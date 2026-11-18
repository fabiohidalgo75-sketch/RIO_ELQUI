import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { ReportPriority, ReportStatus, ReportType, Role } from '@elquialerta/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { CreateReportDto, UpdateReportDto } from './dto/create-report.dto';

/** Prioridad inicial según tipo: lo que pone vidas en riesgo parte en HIGH/CRITICAL. */
const INITIAL_PRIORITY: Partial<Record<ReportType, ReportPriority>> = {
  [ReportType.ISOLATED_PERSON]: ReportPriority.CRITICAL,
  [ReportType.FLOODED_HOME]: ReportPriority.HIGH,
  [ReportType.OVERFLOW]: ReportPriority.HIGH,
  [ReportType.ACTIVE_RAVINE]: ReportPriority.HIGH,
  [ReportType.ROAD_CUT]: ReportPriority.HIGH,
};

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
    @InjectQueue('report-escalation') private readonly escalationQueue: Queue,
  ) {}

  async create(reporterId: string, role: Role, dto: CreateReportDto) {
    // Mejora: FK real según el rol (EcoPoint guardaba un reporterId sin relación)
    const owner =
      role === Role.RESIDENT ? { residentId: reporterId } : { brigadistId: reporterId };

    // Ubica la manzana que contiene el punto reportado
    const [block] = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM blocks
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${dto.lng}, ${dto.lat}), 4326))
      LIMIT 1
    `;

    const report = await this.prisma.report.create({
      data: {
        ...owner,
        type: dto.type,
        description: dto.description,
        photoUrl: dto.photoUrl,
        blockId: block?.id,
        priority: INITIAL_PRIORITY[dto.type] ?? ReportPriority.MEDIUM,
      },
    });
    await this.prisma.$executeRaw`
      UPDATE reports SET location = ST_SetSRID(ST_MakePoint(${dto.lng}, ${dto.lat}), 4326)
      WHERE id = ${report.id}
    `;

    this.gateway.emitReport({ id: report.id, type: report.type, priority: report.priority, lat: dto.lat, lng: dto.lng });
    // Misma idea que la regla "3+ reportes" de EcoPoint, pero por cercanía y tipo
    await this.escalationQueue.add('check-cluster', { reportId: report.id });
    return report;
  }

  findAll(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      include: { block: { include: { sector: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findMine(reporterId: string, role: Role) {
    const where: Prisma.ReportWhereInput =
      role === Role.RESIDENT ? { residentId: reporterId } : { brigadistId: reporterId };
    return this.prisma.report.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async update(id: string, dto: UpdateReportDto) {
    const exists = await this.prisma.report.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Reporte ${id} no encontrado`);
    return this.prisma.report.update({
      where: { id },
      data: {
        ...dto,
        resolvedAt: dto.status === ReportStatus.ATTENDED ? new Date() : undefined,
      },
    });
  }
}
