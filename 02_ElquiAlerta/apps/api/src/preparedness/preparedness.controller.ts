import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Role } from '@elquialerta/shared-types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PreparednessService } from './preparedness.service';

class UpdateChecklistDto {
  @IsOptional() @IsBoolean() kit?: boolean;
  @IsOptional() @IsBoolean() ruta?: boolean;
  @IsOptional() @IsBoolean() docs?: boolean;
  @IsOptional() @IsBoolean() simulacro?: boolean;
  @IsOptional() @IsBoolean() contacto?: boolean;
}

@ApiTags('Preparedness')
@ApiBearerAuth()
@Controller('preparedness')
export class PreparednessController {
  constructor(private readonly service: PreparednessService) {}

  @Roles(Role.RESIDENT)
  @Get('me')
  @ApiOperation({ summary: '[Vecino] Mi checklist y puntaje de preparación' })
  mine(@CurrentUser() user: JwtPayload) {
    return this.service.getMine(user.sub);
  }

  @Roles(Role.RESIDENT)
  @Patch('me')
  update(@CurrentUser() user: JwtPayload, @Body() dto: UpdateChecklistDto) {
    return this.service.update(user.sub, dto);
  }

  @Get('sectors')
  @ApiOperation({ summary: 'Avance de preparación por sector' })
  bySector() {
    return this.service.bySector();
  }
}
