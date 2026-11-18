import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, Min } from 'class-validator';

export class CreateShelterDto {
  @ApiProperty({ example: 'Escuela Lucila Godoy Alcayaga' }) @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiProperty({ example: 180 }) @IsInt() @Min(1) capacity!: number;
  @ApiProperty() @IsLatitude() lat!: number;
  @ApiProperty() @IsLongitude() lng!: number;
}

export class UpdateShelterDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) occupancy?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) capacity?: number;
}

export class CreateRouteDto {
  @ApiProperty() @IsString() sectorId!: string;
  @ApiProperty() @IsString() shelterId!: string;
  @ApiProperty({ example: 'Sube hacia el sur por la calle alta hacia la ladera' }) @IsString() label!: string;
  @ApiPropertyOptional({ description: 'GeoJSON LineString en EPSG:4326' })
  @IsOptional()
  geometry?: { type: 'LineString'; coordinates: [number, number][] };
}
