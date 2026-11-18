import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetCondition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlockFeature } from './dto/import-blocks.dto';

/** Territorio: sectores, manzanas e infraestructura (≈ points en EcoPoint, ahora con polígonos) */
@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  sectors() {
    return this.prisma.sector.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { blocks: true, brigadists: true } } },
    });
  }

  /**
   * Manzanas como GeoJSON, con la exposición del escenario pedido.
   * El panel la pinta directo en el mapa (MapLibre).
   */
  async geojson(returnPeriod?: number) {
    const rows = await this.prisma.$queryRaw<{ feature: unknown }[]>`
      SELECT json_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(b.geom)::json,
        'properties', json_build_object(
          'id', b.id, 'code', b.code, 'sector', s.name,
          'population', b.population, 'households', b.households,
          'maxDepthM', COALESCE(e.max_depth_m, 0)
        )
      ) AS feature
      FROM blocks b
      JOIN sectors s ON s.id = b.sector_id
      LEFT JOIN flood_scenarios f ON f.return_period = ${returnPeriod ?? -1}
      LEFT JOIN block_exposures e ON e.block_id = b.id AND e.scenario_id = f.id
      WHERE b.geom IS NOT NULL
    `;
    return { type: 'FeatureCollection', features: rows.map((r) => r.feature) };
  }

  /** ¿En qué manzana cae este punto? (registro de vecinos, reportes) */
  async blockAt(lat: number, lng: number) {
    const [row] = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM blocks
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))
      LIMIT 1
    `;
    if (!row) throw new NotFoundException('El punto no cae dentro de ninguna manzana registrada');
    return this.prisma.block.findUnique({ where: { id: row.id }, include: { sector: true } });
  }

  /** Carga/actualiza manzanas desde un GeoJSON exportado de ArcGIS Pro. */
  async importGeoJson(features: BlockFeature[]): Promise<{ upserted: number }> {
    let upserted = 0;
    for (const f of features) {
      const { code, sector, population = 0, households = 0 } = f.properties;
      const sec = await this.prisma.sector.upsert({
        where: { name: sector },
        update: {},
        create: { name: sector },
      });
      const block = await this.prisma.block.upsert({
        where: { code },
        update: { sectorId: sec.id, population, households },
        create: { code, sectorId: sec.id, population, households },
      });
      const geom = JSON.stringify(f.geometry);
      await this.prisma.$executeRaw`
        UPDATE blocks
        SET geom = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${geom}), 4326))::geometry(Polygon, 4326)
        WHERE id = ${block.id}
      `.catch(() =>
        // Si viene como MultiPolygon de una sola parte, se toma la primera
        this.prisma.$executeRaw`
          UPDATE blocks
          SET geom = ST_SetSRID(ST_GeometryN(ST_GeomFromGeoJSON(${geom}), 1), 4326)
          WHERE id = ${block.id}
        `,
      );
      upserted++;
    }
    // Recalcula el polígono de cada sector como unión de sus manzanas
    await this.prisma.$executeRaw`
      UPDATE sectors s
      SET geom = sub.g
      FROM (SELECT sector_id, ST_Multi(ST_Union(geom)) AS g FROM blocks GROUP BY sector_id) sub
      WHERE sub.sector_id = s.id
    `;
    return { upserted };
  }

  assets() {
    return this.prisma.infrastructureAsset.findMany({ orderBy: [{ condition: 'desc' }, { name: 'asc' }] });
  }

  async updateAsset(id: string, condition: AssetCondition) {
    const asset = await this.prisma.infrastructureAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Activo ${id} no encontrado`);
    return this.prisma.infrastructureAsset.update({ where: { id }, data: { condition } });
  }
}
