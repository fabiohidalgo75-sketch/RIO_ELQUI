import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { AssetCondition } from '@prisma/client';

/**
 * GeoJSON exportado desde ArcGIS Pro / QGIS (EPSG:4326).
 * Cada Feature es un polígono de manzana con propiedades:
 *   { code: "M-07", sector: "Villa El Arrayán", population: 47, households: 15 }
 * Fuente recomendada (Proyecto de Título, Cap. 2): manzanas censales Censo 2024 del INE,
 * usando el atributo n_per como `population`. Si la capa viene en EPSG:32719 (levantamiento)
 * o EPSG:20049 (SIRGAS-Chile), reproyectar a 4326 antes de importar.
 */
export class ImportBlocksDto {
  @ApiProperty({ example: 'FeatureCollection' })
  @IsIn(['FeatureCollection'])
  type!: 'FeatureCollection';

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  features!: BlockFeature[];
}

export interface BlockFeature {
  type: 'Feature';
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown };
  properties: { code: string; sector: string; population?: number; households?: number };
}

export class UpdateAssetDto {
  @ApiProperty({ enum: AssetCondition }) @IsEnum(AssetCondition) condition!: AssetCondition;
  @IsOptional() @IsString() note?: string;
}
