import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AccountStatus, Institution } from '@prisma/client';

export class CreateBrigadistDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
  @ApiProperty({ enum: Institution }) @IsEnum(Institution) institution!: Institution;
  @ApiPropertyOptional() @IsOptional() @IsString() sectorId?: string;
}

export class UpdateBrigadistDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ enum: AccountStatus }) @IsOptional() @IsEnum(AccountStatus) status?: AccountStatus;
  @ApiPropertyOptional({ description: 'Sector asignado' }) @IsOptional() @IsString() sectorId?: string;
}
