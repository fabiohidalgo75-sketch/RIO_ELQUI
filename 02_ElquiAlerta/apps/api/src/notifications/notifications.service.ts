import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ExpoPushMessage, PushNotificationPayload } from './interfaces/notification-payload.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Igual que EcoPoint, pero devuelve si se envió (para decidir el respaldo por SMS). */
  async sendPush(data: PushNotificationPayload, critical = false): Promise<boolean> {
    if (!data.expoPushToken) return false;
    const message: ExpoPushMessage = {
      to: data.expoPushToken,
      title: data.title,
      body: data.body,
      data: data.payload,
      sound: 'default',
      priority: 'high',
      ...(critical && { channelId: 'alertas-crecida' }),
    };
    try {
      const res = await fetch(this.config.get<string>('expo.pushUrl')!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!res.ok) this.logger.error(`Expo push falló: ${res.status} ${res.statusText}`);
      return res.ok;
    } catch (err) {
      this.logger.error('Error de red en Expo push', err as Error);
      return false;
    }
  }

  /**
   * SMS de respaldo (mejora: EcoPoint solo tenía push).
   * Sin proveedor configurado, deja el mensaje en el log para pruebas.
   */
  async sendSms(phone: string | null | undefined, body: string): Promise<boolean> {
    if (!phone) return false;
    const url = this.config.get<string>('sms.url');
    const token = this.config.get<string>('sms.token');
    if (!url || !token) {
      this.logger.warn(`[SMS simulado] ${phone}: ${body}`);
      return true;
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: phone, body }),
      });
      return res.ok;
    } catch (err) {
      this.logger.error('Error de red en SMS', err as Error);
      return false;
    }
  }

  async persist(
    residentId: string,
    type: string,
    title: string,
    body: string,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    await this.prisma.notification.create({
      data: { residentId, type, title, body, payload: payload as Prisma.InputJsonValue },
    });
  }

  getUnread(residentId: string) {
    return this.prisma.notification.findMany({
      where: { residentId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAllRead(residentId: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { residentId, read: false }, data: { read: true } });
  }
}
