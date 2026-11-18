import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GatewayModule } from '../gateway/gateway.module';
import { AlertsModule } from '../alerts/alerts.module';
import { FloodScenariosModule } from '../flood-scenarios/flood-scenarios.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { HydroThresholdWorker } from './hydro-threshold.worker';
import { AlertDispatchWorker } from './alert-dispatch.worker';
import { AckTimeoutWorker } from './ack-timeout.worker';
import { ReportEscalationWorker } from './report-escalation.worker';
import { NotificationWorker } from './notification.worker';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'hydro-threshold' },
      { name: 'alert-dispatch' },
      { name: 'ack-timeout' },
      { name: 'report-escalation' },
      { name: 'notifications' },
    ),
    GatewayModule,
    AlertsModule,
    FloodScenariosModule,
    NotificationsModule,
  ],
  providers: [
    HydroThresholdWorker,
    AlertDispatchWorker,
    AckTimeoutWorker,
    ReportEscalationWorker,
    NotificationWorker,
  ],
})
export class WorkersModule {}
