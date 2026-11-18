import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

/** Atención en terreno: cierra un reporte o el pedido de ayuda de un vecino (≈ CreateCollectionDto). */
export class CreateInspectionDto {
  @ApiPropertyOptional({ description: 'Reporte atendido' })
  @IsOptional()
  @IsUUID('4')
  reportId?: string;

  @ApiPropertyOptional({ description: 'Mensaje de alerta (vecino que pidió ayuda o no respondió)' })
  @IsOptional()
  @IsUUID('4')
  deliveryId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() photoUrl?: string;
}
