import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AccountStatus } from '@prisma/client';

/** Lo que el vecino puede cambiar de su propio perfil */
export class UpdateMyProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(30) householdSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() needsAssistance?: boolean;
}

/** Lo que el operador puede cambiar */
export class UpdateResidentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ enum: AccountStatus }) @IsOptional() @IsEnum(AccountStatus) status?: AccountStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() blockId?: string;
}

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  @IsString()
  token!: string;
}
