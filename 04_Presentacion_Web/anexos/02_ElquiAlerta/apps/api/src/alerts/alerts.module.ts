import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GatewayModule } from '../gateway/gateway.module';
import { FloodScenariosModule } from '../flood-scenarios/flood-scenarios.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'alert-dispatch' }, { name: 'ack-timeout' }),
    GatewayModule,
    FloodScenariosModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
