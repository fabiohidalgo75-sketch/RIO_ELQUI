import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { Roles } from '../common/decorators/roles.decorator';
import { BlocksService } from './blocks.service';
import { ImportBlocksDto, UpdateAssetDto } from './dto/import-blocks.dto';

@ApiTags('Territory')
@ApiBearerAuth()
@Controller()
export class BlocksController {
  constructor(private readonly service: BlocksService) {}

  @Get('sectors')
  sectors() {
    return this.service.sectors();
  }

  @Get('blocks/geojson')
  @ApiQuery({ name: 'returnPeriod', required: false, example: 100 })
  @ApiOperation({ summary: 'Manzanas en GeoJSON con profundidad del escenario' })
  geojson(@Query('returnPeriod') returnPeriod?: string) {
    return this.service.geojson(returnPeriod ? +returnPeriod : undefined);
  }

  @Get('blocks/at')
  @ApiOperation({ summary: 'Manzana que contiene un punto' })
  blockAt(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.service.blockAt(+lat, +lng);
  }

  @Roles(Role.OPERATOR)
  @Post('blocks/import')
  @ApiOperation({ summary: '[Operador] Importar manzanas desde GeoJSON (ArcGIS Pro / QGIS)' })
  import(@Body() dto: ImportBlocksDto) {
    return this.service.importGeoJson(dto.features);
  }

  @Get('assets')
  @ApiOperation({ summary: 'Gaviones, defensas, puentes y señalética con su estado' })
  assets() {
    return this.service.assets();
  }

  @Roles(Role.OPERATOR, Role.BRIGADIST)
  @Patch('assets/:id')
  updateAsset(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.service.updateAsset(id, dto.condition);
  }
}
