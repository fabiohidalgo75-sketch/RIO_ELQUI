import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { Roles } from '../common/decorators/roles.decorator';
import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';

@ApiTags('Operators')
@ApiBearerAuth()
@Roles(Role.OPERATOR)
@Controller('operators')
export class OperatorsController {
  constructor(private readonly service: OperatorsService) {}

  @Post()
  @ApiOperation({ summary: '[Operador] Crear cuenta de operador' })
  create(@Body() dto: CreateOperatorDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('dashboard')
  @ApiOperation({ summary: '[Operador] Métricas del centro de monitoreo' })
  dashboard() {
    return this.service.getDashboardMetrics();
  }
}
