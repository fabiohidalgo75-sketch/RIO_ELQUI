import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RegisterPushTokenDto } from '../residents/dto/update-resident.dto';
import { BrigadistsService } from './brigadists.service';
import { CreateBrigadistDto, UpdateBrigadistDto } from './dto/brigadist.dto';

@ApiTags('Brigadists')
@ApiBearerAuth()
@Controller('brigadists')
export class BrigadistsController {
  constructor(private readonly service: BrigadistsService) {}

  @Roles(Role.BRIGADIST)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.service.findOne(user.sub);
  }

  @Roles(Role.BRIGADIST)
  @Get('me/cases')
  @ApiOperation({ summary: '[Brigadista] Cola de casos ordenada por urgencia' })
  cases(@CurrentUser() user: JwtPayload) {
    return this.service.caseQueue(user.sub);
  }

  @Roles(Role.BRIGADIST)
  @Patch('me/push-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  pushToken(@CurrentUser() user: JwtPayload, @Body() dto: RegisterPushTokenDto): Promise<void> {
    return this.service.registerPushToken(user.sub, dto.token);
  }

  @Roles(Role.OPERATOR)
  @Post()
  @ApiOperation({ summary: '[Operador] Crear brigadista' })
  create(@Body() dto: CreateBrigadistDto) {
    return this.service.create(dto);
  }

  @Roles(Role.OPERATOR)
  @Get()
  findAll(@Query('sectorId') sectorId?: string) {
    return this.service.findAll(sectorId);
  }

  @Roles(Role.OPERATOR)
  @Patch(':id')
  @ApiOperation({ summary: '[Operador] Cambiar estado o sector asignado' })
  update(@Param('id') id: string, @Body() dto: UpdateBrigadistDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.OPERATOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Operador] Dar de baja (queda INACTIVE, conserva su historial)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
