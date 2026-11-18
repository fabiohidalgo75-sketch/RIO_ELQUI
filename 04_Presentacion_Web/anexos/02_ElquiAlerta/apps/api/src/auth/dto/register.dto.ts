import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

/** Registro de vecino. A diferencia de EcoPoint, pide la ubicación de la vivienda
 *  para asignar automáticamente su manzana (y así poder avisarle por manzana). */
export class RegisterDto {
  @ApiProperty({ example: 'Familia Rojas' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'vecino@ejemplo.cl' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: '+56 9 1234 5678', description: 'Para SMS de respaldo' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: -30.0319 })
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: -70.7081 })
  @IsLongitude()
  lng!: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  householdSize?: number;

  @ApiPropertyOptional({ description: 'Hay personas con movilidad reducida en el hogar' })
  @IsOptional()
  @IsBoolean()
  needsAssistance?: boolean;
}
