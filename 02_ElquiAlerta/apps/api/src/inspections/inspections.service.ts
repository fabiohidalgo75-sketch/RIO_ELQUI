import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { CreateInspectionDto } from './dto/create-inspection.dto';

/** ≈ CollectionsService de EcoPoint: registra la atención y avisa al vecino. */
@Injectable()
export class InspectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async create(brigadistId: string, dto: CreateInspectionDto) {
    if (!dto.reportId && !dto.deliveryId) {
      throw new BadRequestException('Indica reportId o deliveryId');
    }
    const brigadist = await this.prisma.brigadist.findUniqueOrThrow({
      where: { id: brigadistId },
      select: { name: true, institution: true },
    });

    const report = dto.reportId
      ? await this.prisma.report.findUnique({ where: { id: dto.reportId } })
      : null;
    if (dto.reportId && !report) throw new NotFoundException('Reporte no encontrado');

    const delivery = dto.deliveryId
      ? await this.prisma.alertDelivery.findUnique({ where: { id: dto.deliveryId } })
      : null;
    if (dto.deliveryId && !delivery) throw new NotFoundException('Mensaje de alerta no encontrado');

    const [inspection] = await this.prisma.$transaction([
      this.prisma.inspection.create({ data: { brigadistId, ...dto } }),
      ...(report
        ? [this.prisma.report.update({
            where: { id: report.id },
            data: { status: 'ATTENDED', resolvedAt: new Date(), assignedBrigadistId: brigadistId },
          })]
        : []),
      // El vecino atendido queda como a salvo
      ...(delivery
        ? [this.prisma.alertDelivery.update({
            where: { id: delivery.id },
            data: { ackStatus: 'SAFE', ackAt: new Date() },
          })]
        : []),
    ]);

    const residentId = delivery?.residentId ?? report?.residentId;
    if (residentId) {
      await this.notificationsQueue.add('inspection-done', {
        residentId,
        title: report ? 'Tu reporte fue atendido' : 'Una brigada llegó a tu hogar',
        body: `${brigadist.name} (${brigadist.institution}) registró la atención.`,
        payload: { inspectionId: inspection.id },
      });
    }
    this.gateway.server?.to('operators').emit('inspection:new', {
      inspectionId: inspection.id,
      reportId: report?.id,
      deliveryId: delivery?.id,
    });
    return inspection;
  }

  findAll(brigadistId?: string) {
    return this.prisma.inspection.findMany({
      where: brigadistId ? { brigadistId } : undefined,
      include: {
        report: { select: { id: true, type: true, priority: true } },
        brigadist: { select: { id: true, name: true, institution: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async stats() {
    const [total, today, byInstitution] = await Promise.all([
      this.prisma.inspection.count(),
      this.prisma.inspection.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      this.prisma.$queryRaw<{ institution: string; count: bigint }[]>`
        SELECT b.institution, COUNT(*) AS count
        FROM inspections i JOIN brigadists b ON b.id = i.brigadist_id
        GROUP BY b.institution`,
    ]);
    return {
      total,
      today,
      byInstitution: byInstitution.map((r) => ({ institution: r.institution, count: Number(r.count) })),
    };
  }
}
