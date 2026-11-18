import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlertTrigger, Role } from '@elquialerta/shared-types';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AlertsService } from './alerts.service';
import { AckDto, IssueAlertDto } from './dto/issue-alert.dto';

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get('active')
  active() {
    return this.service.active();
  }

  @Roles(Role.OPERATOR)
  @Post('preview')
  preview(@Body() dto: IssueAlertDto) {
    return this.service.preview(dto.level, dto.sectorIds);
  }

  @Roles(Role.OPERATOR)
  @Post()
  issue(@Body() dto: IssueAlertDto, @CurrentUser() user: JwtPayload) {
    return this.service.issue({ ...dto, trigger: AlertTrigger.OPERATOR, operatorId: user.sub });
  }

  @Roles(Role.RESIDENT)
  @Post(':id/ack')
  ack(@Param('id') id: string, @Body() dto: AckDto, @CurrentUser() user: JwtPayload) {
    return this.service.acknowledge(id, user.sub, dto.status);
  }

  @Roles(Role.OPERATOR, Role.BRIGADIST)
  @Get(':id/acks')
  acks(@Param('id') id: string) {
    return this.service.ackSummary(id);
  }

  @Roles(Role.OPERATOR)
  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.service.close(id);
  }
}
