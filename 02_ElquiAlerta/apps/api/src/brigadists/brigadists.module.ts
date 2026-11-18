import { Module } from '@nestjs/common';
import { BrigadistsService } from './brigadists.service';
import { BrigadistsController } from './brigadists.controller';

@Module({
  providers: [BrigadistsService],
  controllers: [BrigadistsController],
  exports: [BrigadistsService],
})
export class BrigadistsModule {}
