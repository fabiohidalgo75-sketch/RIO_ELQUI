import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AlertLevel } from '@elquialerta/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';

export interface Thresholds {
  thresholdPreventiva: number;
  thresholdAmarilla: number;
  thresholdRoja: number;
}

/** Traduce un caudal a nivel de alerta según los umbrales de la estación. */
export function levelForFlow(flow: number, t: Thresholds): AlertLevel {
  if (flow >= t.thresholdRoja) return AlertLevel.ROJA;
  if (flow >= t.thresholdAmarilla) return AlertLevel.AMARILLA;
  if (flow >= t.thresholdPreventiva) return AlertLevel.PREVENTIVA;
  return AlertLevel.NORMAL;
}

@Injectable()
export class HydrologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
    @InjectQueue('hydro-threshold') private readonly thresholdQueue: Queue,
  ) {}

  stations() {
    return this.prisma.hydroStation.findMany({ orderBy: { name: 'asc' } });
  }

  /** Últimas N horas de lecturas para el hidrograma del dashboard. */
  readings(stationId: string, hours = 48) {
    return this.prisma.hydroReading.findMany({
      where: { stationId, measuredAt: { gte: new Date(Date.now() - hours * 3_600_000) } },
      orderBy: { measuredAt: 'asc' },
    });
  }

  /**
   * Ingresa una lectura (desde la integración DGA o carga manual).
   * Emite al dashboard y encola la evaluación de umbrales.
   */
  async ingest(stationCode: string, measuredAt: Date, flowM3s: number, levelM?: number) {
    const station = await this.prisma.hydroStation.findUnique({ where: { code: stationCode } });
    if (!station) throw new NotFoundException(`Estación ${stationCode} no registrada`);

    const reading = await this.prisma.hydroReading.upsert({
      where: { stationId_measuredAt: { stationId: station.id, measuredAt } },
      update: { flowM3s, levelM },
      create: { stationId: station.id, measuredAt, flowM3s, levelM },
    });

    const level = levelForFlow(flowM3s, station);
    this.gateway.emitReading({ stationId: station.id, measuredAt, flowM3s, level });
    await this.thresholdQueue.add('evaluate', { stationId: station.id, flowM3s, level });
    return reading;
  }
}
