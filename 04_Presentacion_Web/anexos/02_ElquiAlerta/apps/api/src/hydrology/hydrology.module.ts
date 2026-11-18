import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GatewayModule } from '../gateway/gateway.module';
import { HydrologyController } from './hydrology.controller';
import { HydrologyService } from './hydrology.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'hydro-threshold' }), GatewayModule],
  controllers: [HydrologyController],
  providers: [HydrologyService],
  exports: [HydrologyService],
})
export class HydrologyModule {}
