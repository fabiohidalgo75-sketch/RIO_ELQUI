import { IsArray, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { AckStatus, AlertLevel } from '@elquialerta/shared-types';

export class IssueAlertDto {
  @IsEnum(AlertLevel) level!: AlertLevel;
  @IsOptional() @IsArray() @IsString({ each: true }) sectorIds?: string[];
  @IsOptional() @IsString() note?: string;
}

export class AckDto {
  @IsIn([AckStatus.SAFE, AckStatus.NEEDS_HELP])
  status!: AckStatus.SAFE | AckStatus.NEEDS_HELP;
}
