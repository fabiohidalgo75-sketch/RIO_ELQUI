import { Module } from '@nestjs/common';
import { GatewayModule } from '../gateway/gateway.module';
import { EvacuationService } from './evacuation.service';
import { EvacuationController } from './evacuation.controller';

@Module({
  imports: [GatewayModule],
  providers: [EvacuationService],
  controllers: [EvacuationController],
  exports: [EvacuationService],
})
export class EvacuationModule {}
