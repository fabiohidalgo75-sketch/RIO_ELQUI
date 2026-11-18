import { IsEnum, IsLatitude, IsLongitude, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ReportStatus, ReportType, ReportPriority } from '@elquialerta/shared-types';

export class CreateReportDto {
  @IsEnum(ReportType) type!: ReportType;
  @IsString() @MaxLength(1000) description!: string;
  @IsOptional() @IsUrl() photoUrl?: string;
  /** Ubicación del incidente (obligatoria para ubicarlo en el mapa) */
  @IsLatitude() lat!: number;
  @IsLongitude() lng!: number;
}

export class UpdateReportDto {
  @IsOptional() @IsEnum(ReportStatus) status?: ReportStatus;
  @IsOptional() @IsEnum(ReportPriority) priority?: ReportPriority;
  @IsOptional() @IsString() assignedBrigadistId?: string;
}
