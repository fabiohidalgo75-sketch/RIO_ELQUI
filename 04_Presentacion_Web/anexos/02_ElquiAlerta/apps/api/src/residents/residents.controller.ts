import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ResidentsService } from './residents.service';
import { RegisterPushTokenDto, UpdateMyProfileDto, UpdateResidentDto } from './dto/update-resident.dto';

@ApiTags('Residents')
@ApiBearerAuth()
@Controller('residents')
export class ResidentsController {
  constructor(private readonly service: ResidentsService) {}

  @Roles(Role.RESIDENT)
  @Get('me')
  @ApiOperation({ summary: '[Vecino] Mi perfil, manzana, ruta y preparación' })
  me(@CurrentUser() user: JwtPayload) {
    return this.service.getProfile(user.sub);
  }

  @Roles(Role.RESIDENT)
  @Patch('me')
  @ApiOperation({ summary: '[Vecino] Actualizar hogar (personas, movilidad reducida, teléfono)' })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateMyProfileDto) {
    return this.service.updateMe(user.sub, dto);
  }

  @Roles(Role.RESIDENT)
  @Patch('me/push-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Vecino] Registrar token Expo' })
  pushToken(@CurrentUser() user: JwtPayload, @Body() dto: RegisterPushTokenDto): Promise<void> {
    return this.service.registerPushToken(user.sub, dto.token);
  }

  @Roles(Role.OPERATOR)
  @Get()
  @ApiOperation({ summary: '[Operador] Listar vecinos (opcional por manzana)' })
  findAll(@Query('blockId') blockId?: string) {
    return this.service.findAll(blockId);
  }

  @Roles(Role.OPERATOR, Role.BRIGADIST)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.OPERATOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResidentDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.OPERATOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
