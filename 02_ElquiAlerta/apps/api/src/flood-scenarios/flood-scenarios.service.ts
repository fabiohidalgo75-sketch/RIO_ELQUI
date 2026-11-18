import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExposedBlock {
  block_id: string;
  code: string;
  sector_id: string;
  sector: string;
  population: number;
  max_depth_m: number;
  mean_depth_m: number;
}

@Injectable()
export class FloodScenariosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.floodScenario.findMany({ orderBy: { returnPeriod: 'asc' } });
  }

  async findByReturnPeriod(returnPeriod: number) {
    const scenario = await this.prisma.floodScenario.findFirst({
      where: { returnPeriod },
      orderBy: { importedAt: 'desc' },
    });
    if (!scenario) throw new NotFoundException(`No hay escenario T=${returnPeriod}`);
    return scenario;
  }

  /** Manzanas con agua en el escenario, de mayor a menor profundidad. */
  exposedBlocks(scenarioId: string, minDepthM = 0.05, sectorIds: string[] = []) {
    const filterBySector = sectorIds.length > 0;
    return this.prisma.$queryRaw<ExposedBlock[]>`
      SELECT b.id AS block_id, b.code, s.id AS sector_id, s.name AS sector,
             b.population, e.max_depth_m, e.mean_depth_m
      FROM block_exposures e
      JOIN blocks  b ON b.id = e.block_id
      JOIN sectors s ON s.id = b.sector_id
      WHERE e.scenario_id = ${scenarioId}
        AND e.max_depth_m > ${minDepthM}
        AND (${!filterBySector} OR s.id = ANY(${sectorIds}::text[]))
      ORDER BY e.max_depth_m DESC
    `;
  }

  /**
   * Recalcula la exposición de cada manzana tras importar un escenario desde ArcGIS Pro.
   * Usa la clase de profundidad más alta que toca la manzana y el % de área mojada.
   */
  async recomputeExposure(scenarioId: string): Promise<number> {
    await this.prisma.$executeRaw`DELETE FROM block_exposures WHERE scenario_id = ${scenarioId}`;
    return this.prisma.$executeRaw`
      INSERT INTO block_exposures (block_id, scenario_id, max_depth_m, mean_depth_m, wet_area_pct)
      SELECT b.id, ${scenarioId},
             MAX(CASE z.depth_class WHEN 'D15_PLUS' THEN 2.0 WHEN 'D05_15' THEN 1.0 ELSE 0.25 END),
             AVG(CASE z.depth_class WHEN 'D15_PLUS' THEN 2.0 WHEN 'D05_15' THEN 1.0 ELSE 0.25 END),
             LEAST(100, 100 * SUM(ST_Area(ST_Intersection(b.geom, z.geom)::geography))
                         / NULLIF(ST_Area(b.geom::geography), 0))
      FROM blocks b
      JOIN flood_zones z ON z.scenario_id = ${scenarioId} AND ST_Intersects(b.geom, z.geom)
      GROUP BY b.id
    `;
  }
}
