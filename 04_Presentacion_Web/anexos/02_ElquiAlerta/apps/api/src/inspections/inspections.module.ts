import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GatewayModule } from '../gateway/gateway.module';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' }), GatewayModule],
  providers: [InspectionsService],
  controllers: [InspectionsController],
})
export class InspectionsModule {}
