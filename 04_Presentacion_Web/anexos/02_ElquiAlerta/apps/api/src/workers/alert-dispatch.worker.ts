import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { AlertLevel, DeliveryChannel } from '@elquialerta/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { FloodScenariosService } from '../flood-scenarios/flood-scenarios.service';
import { buildMessage } from '../alerts/alerts.service';

/**
 * Crea un AlertDelivery por vecino de cada manzana expuesta, con su mensaje personalizado.
 * Mejora frente a EcoPoint: el aviso no depende de tener la app abierta (push + SMS de respaldo).
 * El envío real (Expo push con SMS de respaldo) lo hace NotificationWorker.
 */
@Processor('alert-dispatch')
export class AlertDispatchWorker extends WorkerHost {
  private readonly logger = new Logger(AlertDispatchWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scenarios: FloodScenariosService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ alertId: string }>): Promise<void> {
    const alert = await this.prisma.alertEvent.findUniqueOrThrow({ where: { id: job.data.alertId } });
    if (!alert.scenarioId) return;

    const blocks = await this.scenarios.exposedBlocks(alert.scenarioId, 0.05, alert.sectorIds);
    let total = 0;

    for (const block of blocks) {
      const route = await this.prisma.evacuationRoute.findFirst({
        where: { sectorId: block.sector_id },
        include: { shelter: true },
      });
      const message = buildMessage(
        alert.level as AlertLevel,
        block,
        route ? { label: route.label, shelter: route.shelter.name } : undefined,
      );
      const residents = await this.prisma.resident.findMany({
        where: { blockId: block.block_id, status: 'ACTIVE' },
        select: { id: true, expoPushToken: true },
      });

      const result = await this.prisma.alertDelivery.createMany({
        data: residents.map((r) => ({
          alertId: alert.id,
          residentId: r.id,
          channel: r.expoPushToken ? DeliveryChannel.PUSH : DeliveryChannel.SMS,
          message,
        })),
        skipDuplicates: true,
      });
      total += result.count;
    }
    // Un trabajo de envío por mensaje: si uno falla, se reintenta solo ese
    const pending = await this.prisma.alertDelivery.findMany({
      where: { alertId: alert.id, deliveredAt: null },
      select: { id: true },
    });
    await this.notificationsQueue.addBulk(
      pending.map((d) => ({
        name: 'alert-delivery',
        data: { deliveryId: d.id },
        opts: { jobId: `delivery-${d.id}`, attempts: 3, backoff: { type: 'exponential', delay: 10_000 } },
      })),
    );
    this.logger.log(`Alerta ${alert.id}: ${total} mensajes en ${blocks.length} manzanas`);
  }
}
