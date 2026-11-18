import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';

interface GenericJob {
  residentId: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
}

/**
 * Dos tipos de trabajo:
 *  - 'alert-delivery': envía UN mensaje de alerta (push y, si falla o no hay token, SMS).
 *  - cualquier otro nombre: aviso general al vecino (ej. 'inspection-done').
 */
@Processor('notifications')
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {
    super();
  }

  async process(job: Job<GenericJob | { deliveryId: string }>): Promise<void> {
    if (job.name === 'alert-delivery') {
      return this.sendAlert((job.data as { deliveryId: string }).deliveryId);
    }
    const { residentId, title, body, payload } = job.data as GenericJob;
    await this.notifications.persist(residentId, job.name, title, body, payload);
    this.gateway.server?.to(`resident:${residentId}`).emit('notification', { title, body, payload });
    const r = await this.prisma.resident.findUnique({ where: { id: residentId }, select: { expoPushToken: true } });
    await this.notifications.sendPush({ residentId, title, body, payload, expoPushToken: r?.expoPushToken ?? undefined });
  }

  private async sendAlert(deliveryId: string): Promise<void> {
    const d = await this.prisma.alertDelivery.findUnique({
      where: { id: deliveryId },
      include: { resident: { select: { id: true, phone: true, expoPushToken: true } }, alert: true },
    });
    if (!d || d.deliveredAt) return; // ya enviado (reintentos idempotentes)

    const title = 'Alerta de crecida · río Elqui';
    const payload = { alertId: d.alertId, deliveryId: d.id, level: d.alert.level };
    this.gateway.server?.to(`resident:${d.residentId}`).emit('alert:message', { ...payload, message: d.message });

    let sent = await this.notifications.sendPush(
      { residentId: d.residentId, title, body: d.message, payload, expoPushToken: d.resident.expoPushToken ?? undefined },
      true,
    );
    let channel = d.channel;
    if (!sent) {
      sent = await this.notifications.sendSms(d.resident.phone, d.message);
      channel = 'SMS';
    }

    await this.prisma.alertDelivery.update({
      where: { id: d.id },
      data: { deliveredAt: sent ? new Date() : null, channel },
    });
    await this.notifications.persist(d.residentId, 'alert', title, d.message, payload);
    if (!sent) {
      this.logger.warn(`Mensaje ${d.id} sin entregar (sin token ni teléfono)`);
      throw new Error('No entregado'); // BullMQ reintenta según la política de la cola
    }
  }
}
