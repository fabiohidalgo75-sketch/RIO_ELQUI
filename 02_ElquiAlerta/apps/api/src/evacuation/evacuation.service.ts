import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { CreateRouteDto, CreateShelterDto, UpdateShelterDto } from './dto/evacuation.dto';

/** Albergues y rutas de evacuación (el módulo routes/ que EcoPoint documentaba pero no tenía). */
@Injectable()
export class EvacuationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  shelters() {
    return this.prisma.shelter.findMany({ orderBy: { name: 'asc' } });
  }

  async createShelter(dto: CreateShelterDto) {
    const { lat, lng, ...data } = dto;
    const shelter = await this.prisma.shelter.create({ data });
    await this.prisma.$executeRaw`
      UPDATE shelters SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) WHERE id = ${shelter.id}
    `;
    return shelter;
  }

  async updateShelter(id: string, dto: UpdateShelterDto) {
    const exists = await this.prisma.shelter.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Albergue ${id} no encontrado`);
    const shelter = await this.prisma.shelter.update({ where: { id }, data: dto });
    this.gateway.server?.to('operators').emit('shelter:update', shelter);
    return shelter;
  }

  /** Albergue activo más cercano con cupo (para el vecino o la brigada). */
  async nearestWithCapacity(lat: number, lng: number) {
    const [row] = await this.prisma.$queryRaw<{ id: string; distance_m: number }[]>`
      SELECT id, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS distance_m
      FROM shelters
      WHERE active AND occupancy < capacity AND location IS NOT NULL
      ORDER BY location <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      LIMIT 1
    `;
    if (!row) throw new NotFoundException('No hay albergues activos con cupo');
    const shelter = await this.prisma.shelter.findUniqueOrThrow({ where: { id: row.id } });
    return { ...shelter, distanceM: Math.round(row.distance_m) };
  }

  routes(sectorId?: string) {
    return this.prisma.evacuationRoute.findMany({
      where: sectorId ? { sectorId } : undefined,
      include: { shelter: true, sector: { select: { name: true } } },
    });
  }

  async createRoute(dto: CreateRouteDto) {
    const { geometry, ...data } = dto;
    const route = await this.prisma.evacuationRoute.create({ data });
    if (geometry) {
      const geom = JSON.stringify(geometry);
      await this.prisma.$executeRaw`
        UPDATE evacuation_routes SET geom = ST_SetSRID(ST_GeomFromGeoJSON(${geom}), 4326) WHERE id = ${route.id}
      `;
    }
    return route;
  }
}
