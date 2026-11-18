import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Reemplaza la gamificación de EcoPoint: en vez de sumar puntos por reciclar,
 * mide qué tan preparada está cada familia (y cada sector) antes de una crecida.
 */
export const CHECKLIST = [
  { id: 'kit', label: 'Kit de emergencia listo', weight: 25 },
  { id: 'ruta', label: 'Conozco mi ruta y albergue', weight: 25 },
  { id: 'docs', label: 'Documentos en bolsa impermeable', weight: 15 },
  { id: 'simulacro', label: 'Participé en el último simulacro', weight: 20 },
  { id: 'contacto', label: 'Contacto de emergencia registrado', weight: 15 },
] as const;

export type ChecklistId = (typeof CHECKLIST)[number]['id'];

export function scoreOf(checklist: Partial<Record<ChecklistId, boolean>>): number {
  return CHECKLIST.reduce((s, item) => s + (checklist[item.id] ? item.weight : 0), 0);
}

@Injectable()
export class PreparednessService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(residentId: string) {
    const p = await this.prisma.preparedness.upsert({
      where: { residentId },
      update: {},
      create: { residentId },
    });
    return { ...p, items: CHECKLIST };
  }

  async update(residentId: string, changes: Partial<Record<ChecklistId, boolean>>) {
    const current = await this.getMine(residentId);
    const checklist = { ...(current.checklist as Record<string, boolean>), ...changes };
    return this.prisma.preparedness.update({
      where: { residentId },
      data: { checklist: checklist as Prisma.InputJsonValue, score: scoreOf(checklist) },
    });
  }

  /** Promedio por sector (≈ ranking por comuna de EcoPoint). */
  bySector() {
    return this.prisma.$queryRaw<{ sector: string; residents: number; avg_score: number }[]>`
      SELECT s.name AS sector,
             COUNT(p.id)::int AS residents,
             ROUND(AVG(p.score))::int AS avg_score
      FROM preparedness p
      JOIN residents r ON r.id = p.resident_id
      JOIN blocks b    ON b.id = r.block_id
      JOIN sectors s   ON s.id = b.sector_id
      GROUP BY s.name
      ORDER BY avg_score DESC
    `;
  }
}
