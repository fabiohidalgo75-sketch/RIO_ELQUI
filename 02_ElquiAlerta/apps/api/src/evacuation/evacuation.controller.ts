import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { Roles } from '../common/decorators/roles.decorator';
import { EvacuationService } from './evacuation.service';
import { CreateRouteDto, CreateShelterDto, UpdateShelterDto } from './dto/evacuation.dto';

@ApiTags('Evacuation')
@ApiBearerAuth()
@Controller('evacuation')
export class EvacuationController {
  constructor(private readonly service: EvacuationService) {}

  @Get('shelters')
  shelters() {
    return this.service.shelters();
  }

  @Get('shelters/nearest')
  @ApiOperation({ summary: 'Albergue activo más cercano con cupo' })
  nearest(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.service.nearestWithCapacity(+lat, +lng);
  }

  @Roles(Role.OPERATOR)
  @Post('shelters')
  createShelter(@Body() dto: CreateShelterDto) {
    return this.service.createShelter(dto);
  }

  @Roles(Role.OPERATOR, Role.BRIGADIST)
  @Patch('shelters/:id')
  @ApiOperation({ summary: 'Habilitar albergue o actualizar ocupación' })
  updateShelter(@Param('id') id: string, @Body() dto: UpdateShelterDto) {
    return this.service.updateShelter(id, dto);
  }

  @Get('routes')
  routes(@Query('sectorId') sectorId?: string) {
    return this.service.routes(sectorId);
  }

  @Roles(Role.OPERATOR)
  @Post('routes')
  createRoute(@Body() dto: CreateRouteDto) {
    return this.service.createRoute(dto);
  }
}
