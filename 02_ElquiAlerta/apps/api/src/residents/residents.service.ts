import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMyProfileDto, UpdateResidentDto } from './dto/update-resident.dto';

@Injectable()
export class ResidentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(blockId?: string) {
    return this.prisma.resident.findMany({
      where: blockId ? { blockId } : undefined,
      omit: { passwordHash: true },
      include: { block: { select: { code: true, sector: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });
    if (!resident) throw new NotFoundException(`Vecino ${id} no encontrado`);
    return resident;
  }

  /** Perfil con su manzana, sector, ruta de evacuación y preparación */
  async getProfile(id: string) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },
      omit: { passwordHash: true },
      include: {
        preparedness: true,
        block: {
          include: {
            sector: { include: { routes: { include: { shelter: true } } } },
            exposures: { include: { scenario: { select: { returnPeriod: true, validated: true } } } },
          },
        },
      },
    });
    if (!resident) throw new NotFoundException('Vecino no encontrado');
    return resident;
  }

  async updateMe(id: string, dto: UpdateMyProfileDto) {
    return this.prisma.resident.update({ where: { id }, data: dto, omit: { passwordHash: true } });
  }

  async update(id: string, dto: UpdateResidentDto) {
    await this.findOne(id);
    return this.prisma.resident.update({ where: { id }, data: dto, omit: { passwordHash: true } });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.resident.delete({ where: { id } });
  }

  async registerPushToken(id: string, token: string): Promise<void> {
    await this.prisma.resident.update({ where: { id }, data: { expoPushToken: token } });
  }
}
