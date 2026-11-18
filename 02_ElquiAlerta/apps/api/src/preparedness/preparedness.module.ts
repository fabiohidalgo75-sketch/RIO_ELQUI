import { Module } from '@nestjs/common';
import { PreparednessService } from './preparedness.service';
import { PreparednessController } from './preparedness.controller';

@Module({
  providers: [PreparednessService],
  controllers: [PreparednessController],
  exports: [PreparednessService],
})
export class PreparednessModule {}
