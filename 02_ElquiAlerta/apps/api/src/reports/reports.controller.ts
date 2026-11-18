import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportStatus, Role } from '@elquialerta/shared-types';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto } from './dto/create-report.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Roles(Role.RESIDENT, Role.BRIGADIST)
  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(user.sub, user.role as Role, dto);
  }

  @Roles(Role.RESIDENT, Role.BRIGADIST)
  @Get('mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.service.findMine(user.sub, user.role as Role);
  }

  @Roles(Role.OPERATOR, Role.BRIGADIST)
  @Get()
  findAll(@Query('status') status?: ReportStatus) {
    return this.service.findAll(status);
  }

  @Roles(Role.OPERATOR, Role.BRIGADIST)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.service.update(id, dto);
  }
}
