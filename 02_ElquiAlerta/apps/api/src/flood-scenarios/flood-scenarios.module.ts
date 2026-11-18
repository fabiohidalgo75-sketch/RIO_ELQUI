import { Module } from '@nestjs/common';
import { FloodScenariosController } from './flood-scenarios.controller';
import { FloodScenariosService } from './flood-scenarios.service';

@Module({
  controllers: [FloodScenariosController],
  providers: [FloodScenariosService],
  exports: [FloodScenariosService],
})
export class FloodScenariosModule {}
