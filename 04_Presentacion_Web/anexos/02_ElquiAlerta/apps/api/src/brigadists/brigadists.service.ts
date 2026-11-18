import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrigadistDto, UpdateBrigadistDto } from './dto/brigadist.dto';

@Injectable()
export class BrigadistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrigadistDto) {
    const exists = await this.prisma.brigadist.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El correo ya está registrado');
    const { password, ...data } = dto;
    return this.prisma.brigadist.create({
      data: { ...data, passwordHash: await bcrypt.hash(password, 12) },
      omit: { passwordHash: true },
    });
  }

  findAll(sectorId?: string) {
    return this.prisma.brigadist.findMany({
      where: sectorId ? { sectorId } : undefined,
      omit: { passwordHash: true },
      include: { sector: { select: { name: true } }, _count: { select: { inspections: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const b = await this.prisma.brigadist.findUnique({
      where: { id },
      omit: { passwordHash: true },
      include: { sector: true },
    });
    if (!b) throw new NotFoundException(`Brigadista ${id} no encontrado`);
    return b;
  }

  async update(id: string, dto: UpdateBrigadistDto) {
    await this.findOne(id);
    return this.prisma.brigadist.update({ where: { id }, data: dto, omit: { passwordHash: true } });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.brigadist.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  async registerPushToken(id: string, token: string): Promise<void> {
    await this.prisma.brigadist.update({ where: { id }, data: { expoPushToken: token } });
  }

  /**
   * Cola de casos de la brigada, ordenada por urgencia:
   * 1) vecinos que pidieron ayuda, 2) sin respuesta con movilidad reducida, 3) reportes críticos/altos.
   */
  async caseQueue(brigadistId: string) {
    const me = await this.findOne(brigadistId);
    const sectorFilter = me.sectorId ? { block: { sectorId: me.sectorId } } : {};

    const [help, noResponse, reports] = await Promise.all([
      this.prisma.alertDelivery.findMany({
        where: { ackStatus: 'NEEDS_HELP', alert: { closedAt: null }, resident: sectorFilter },
        include: { resident: { omit: { passwordHash: true }, include: { block: true } } },
        orderBy: { ackAt: 'asc' },
      }),
      this.prisma.alertDelivery.findMany({
        where: {
          ackStatus: 'NO_RESPONSE',
          alert: { closedAt: null },
          resident: { needsAssistance: true, ...sectorFilter },
        },
        include: { resident: { omit: { passwordHash: true }, include: { block: true } } },
      }),
      this.prisma.report.findMany({
        where: {
          status: { in: ['PENDING', 'VERIFYING', 'ESCALATED'] },
          priority: { in: ['CRITICAL', 'HIGH'] },
          ...(me.sectorId ? { block: { sectorId: me.sectorId } } : {}),
        },
        include: { block: true },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      }),
    ]);

    return [
      ...help.map((d) => ({ kind: 'HELP' as const, deliveryId: d.id, resident: d.resident, since: d.ackAt })),
      ...noResponse.map((d) => ({ kind: 'NO_RESPONSE' as const, deliveryId: d.id, resident: d.resident, since: d.deliveredAt })),
      ...reports.map((r) => ({ kind: 'REPORT' as const, report: r, since: r.createdAt })),
    ];
  }
}
