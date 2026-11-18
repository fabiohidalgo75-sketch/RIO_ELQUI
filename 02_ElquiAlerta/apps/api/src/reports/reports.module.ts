import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GatewayModule } from '../gateway/gateway.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'report-escalation' }), GatewayModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
