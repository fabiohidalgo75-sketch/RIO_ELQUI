import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOperatorDto } from './dto/create-operator.dto';

@Injectable()
export class OperatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOperatorDto) {
    const exists = await this.prisma.operator.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El correo ya está registrado');
    return this.prisma.operator.create({
      data: { name: dto.name, email: dto.email, passwordHash: await bcrypt.hash(dto.password, 12) },
      omit: { passwordHash: true },
    });
  }

  findAll() {
    return this.prisma.operator.findMany({ omit: { passwordHash: true }, orderBy: { name: 'asc' } });
  }

  /**
   * Métricas del dashboard. En EcoPoint eran conteos genéricos;
   * aquí son las que el centro de monitoreo necesita para decidir.
   */
  async getDashboardMetrics() {
    const alert = await this.prisma.alertEvent.findFirst({
      where: { closedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { scenario: { select: { returnPeriod: true, validated: true } } },
    });

    const [lastReadings, pendingReports, activeBrigadists, shelters, acks, exposure] = await Promise.all([
      this.prisma.hydroStation.findMany({
        include: { readings: { orderBy: { measuredAt: 'desc' }, take: 2 } },
      }),
      this.prisma.report.groupBy({
        by: ['priority'],
        where: { status: { in: ['PENDING', 'VERIFYING'] } },
        _count: { _all: true },
      }),
      this.prisma.brigadist.count({ where: { status: 'ACTIVE' } }),
      this.prisma.shelter.findMany({ where: { active: true }, select: { name: true, capacity: true, occupancy: true } }),
      alert
        ? this.prisma.alertDelivery.groupBy({ by: ['ackStatus'], where: { alertId: alert.id }, _count: { _all: true } })
        : Promise.resolve([]),
      alert?.scenarioId
        ? this.prisma.$queryRaw<{ blocks: bigint; deep: bigint; population: bigint }[]>`
            SELECT COUNT(*) AS blocks,
                   COUNT(*) FILTER (WHERE e.max_depth_m > 1.5) AS deep,
                   COALESCE(SUM(b.population), 0) AS population
            FROM block_exposures e JOIN blocks b ON b.id = e.block_id
            WHERE e.scenario_id = ${alert.scenarioId} AND e.max_depth_m > 0.05`
        : Promise.resolve([]),
    ]);

    const ex = exposure[0];
    return {
      alert: alert
        ? { id: alert.id, level: alert.level, since: alert.createdAt, scenario: alert.scenario }
        : { level: 'NORMAL' },
      stations: lastReadings.map((s) => {
        const [now, prev] = s.readings;
        return {
          name: s.name,
          flowM3s: now?.flowM3s ?? null,
          trend: now && prev ? Math.sign(now.flowM3s - prev.flowM3s) : 0,
          thresholds: {
            preventiva: s.thresholdPreventiva,
            amarilla: s.thresholdAmarilla,
            roja: s.thresholdRoja,
          },
        };
      }),
      exposure: ex
        ? { blocks: Number(ex.blocks), blocksDeep: Number(ex.deep), population: Number(ex.population) }
        : { blocks: 0, blocksDeep: 0, population: 0 },
      acks: Object.fromEntries(acks.map((a) => [a.ackStatus, a._count._all])),
      pendingReports: Object.fromEntries(pendingReports.map((r) => [r.priority, r._count._all])),
      activeBrigadists,
      shelters,
    };
  }
}
