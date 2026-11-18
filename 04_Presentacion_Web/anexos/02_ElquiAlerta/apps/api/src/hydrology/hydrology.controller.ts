import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Role } from '@elquialerta/shared-types';
import { Roles } from '../common/decorators/roles.decorator';
import { HydrologyService } from './hydrology.service';

export class IngestReadingDto {
  @IsString() stationCode!: string;
  @Type(() => Date) @IsDate() measuredAt!: Date;
  @IsNumber() @Min(0) flowM3s!: number;
  @IsOptional() @IsNumber() levelM?: number;
}

@ApiTags('hydrology')
@ApiBearerAuth()
@Controller('hydrology')
export class HydrologyController {
  constructor(private readonly service: HydrologyService) {}

  @Get('stations')
  stations() {
    return this.service.stations();
  }

  @Get('stations/:id/readings')
  readings(@Param('id') id: string, @Query('hours') hours?: string) {
    return this.service.readings(id, hours ? +hours : 48);
  }

  @Roles(Role.OPERATOR)
  @Post('readings')
  ingest(@Body() dto: IngestReadingDto) {
    return this.service.ingest(dto.stationCode, dto.measuredAt, dto.flowM3s, dto.levelM);
  }
}
