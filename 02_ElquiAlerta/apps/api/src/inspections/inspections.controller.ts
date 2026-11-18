import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';

@ApiTags('Inspections')
@ApiBearerAuth()
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly service: InspectionsService) {}

  @Roles(Role.BRIGADIST)
  @Post()
  @ApiOperation({ summary: '[Brigadista] Marcar caso como atendido' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInspectionDto) {
    return this.service.create(user.sub, dto);
  }

  @Roles(Role.BRIGADIST)
  @Get('mine')
  @ApiOperation({ summary: '[Brigadista] Mi historial de atenciones' })
  mine(@CurrentUser() user: JwtPayload) {
    return this.service.findAll(user.sub);
  }

  @Roles(Role.OPERATOR)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(Role.OPERATOR)
  @Get('stats')
  stats() {
    return this.service.stats();
  }
}
