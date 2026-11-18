import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { Roles } from '../common/decorators/roles.decorator';
import { FloodScenariosService } from './flood-scenarios.service';

@ApiTags('flood-scenarios')
@ApiBearerAuth()
@Controller('flood-scenarios')
export class FloodScenariosController {
  constructor(private readonly service: FloodScenariosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** GET /flood-scenarios/100/blocks?minDepth=1.5 → "manzanas bajo más de 1,5 m" (concepto 3) */
  @Get(':returnPeriod/blocks')
  async exposed(
    @Param('returnPeriod', ParseIntPipe) returnPeriod: number,
    @Query('minDepth') minDepth?: string,
  ) {
    const scenario = await this.service.findByReturnPeriod(returnPeriod);
    return {
      scenario,
      blocks: await this.service.exposedBlocks(scenario.id, minDepth ? +minDepth : 0.05),
    };
  }

  @Roles(Role.OPERATOR)
  @Post(':id/recompute')
  recompute(@Param('id') id: string) {
    return this.service.recomputeExposure(id);
  }
}
