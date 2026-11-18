import { Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@elquialerta/shared-types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Roles(Role.RESIDENT)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '[Vecino] Notificaciones no leídas' })
  getUnread(@CurrentUser() user: JwtPayload) {
    return this.service.getUnread(user.sub);
  }

  @Patch('read')
  @HttpCode(HttpStatus.NO_CONTENT)
  markRead(@CurrentUser() user: JwtPayload) {
    return this.service.markAllRead(user.sub);
  }
}
