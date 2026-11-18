import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AckStatus } from '@elquialerta/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';

/**
 * Al vencer ACK_TIMEOUT_MINUTES, los que no respondieron pasan a NO_RESPONSE.
 * Los que además necesitan asistencia se envían a la brigada de su sector.
 */
@Processor('ack-timeout')
export class AckTimeoutWorker extends WorkerHost {
  private readonly logger = new Logger(AckTimeoutWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {
    super();
  }

  async process(job: Job<{ alertId: string }>): Promise<void> {
    const { alertId } = job.data;
    const pending = await this.prisma.alertDelivery.findMany({
      where: { alertId, ackStatus: AckStatus.PENDING },
      include: { resident: { include: { block: true } } },
    });

    await this.prisma.alertDelivery.updateMany({
      where: { alertId, ackStatus: AckStatus.PENDING },
      data: { ackStatus: AckStatus.NO_RESPONSE },
    });

    const priority = pending.filter((d) => d.resident.needsAssistance && d.resident.block);
    for (const d of priority) {
      this.gateway.emitHelpNeeded(d.resident.block!.sectorId, {
        deliveryId: d.id,
        residentId: d.residentId,
        blockId: d.resident.blockId,
        reason: 'NO_RESPONSE_NEEDS_ASSISTANCE',
      });
    }
    this.logger.log(`Alerta ${alertId}: ${pending.length} sin respuesta, ${priority.length} prioritarios`);
  }
}
