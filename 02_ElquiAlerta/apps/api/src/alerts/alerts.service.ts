import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import {
  AckStatus,
  ALERT_SCENARIO,
  AlertLevel,
  AlertTrigger,
} from '@elquialerta/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { ExposedBlock, FloodScenariosService } from '../flood-scenarios/flood-scenarios.service';

const LEVEL_LABEL: Record<AlertLevel, string> = {
  [AlertLevel.NORMAL]: 'Normal',
  [AlertLevel.PREVENTIVA]: 'Alerta Temprana Preventiva',
  [AlertLevel.AMARILLA]: 'Alerta Amarilla',
  [AlertLevel.ROJA]: 'Alerta Roja',
};

/**
 * Mensaje por manzana: la respuesta a la "brecha de comunicación" (Ficha 9).
 * EcoPoint enviaba un texto fijo; aquí cada vecino recibe dónde, cuánto y qué hacer.
 */
export function buildMessage(
  level: AlertLevel,
  block: Pick<ExposedBlock, 'code' | 'sector' | 'max_depth_m'>,
  route?: { label: string; shelter: string },
): string {
  const depth = block.max_depth_m.toFixed(1).replace('.', ',');
  const lines = [
    `${LEVEL_LABEL[level]} — río Elqui.`,
    `${block.sector}, manzana ${block.code}: agua estimada hasta ${depth} m.`,
  ];
  if (route) lines.push(`Evacúa: ${route.label}. Albergue: ${route.shelter}.`);
  lines.push('Responde: 1 = Estoy a salvo · 2 = Necesito ayuda.');
  return lines.join(' ');
}

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scenarios: FloodScenariosService,
    private readonly gateway: AppGateway,
    private readonly config: ConfigService,
    @InjectQueue('alert-dispatch') private readonly dispatchQueue: Queue,
    @InjectQueue('ack-timeout') private readonly ackTimeoutQueue: Queue,
  ) {}

  active() {
    return this.prisma.alertEvent.findFirst({
      where: { closedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { scenario: true },
    });
  }

  /** Vista previa sin enviar: destinatarios y mensaje de ejemplo por manzana. */
  async preview(level: AlertLevel, sectorIds: string[] = []) {
    const returnPeriod = ALERT_SCENARIO[level];
    if (!returnPeriod) return { blocks: [], recipients: 0 };
    const scenario = await this.scenarios.findByReturnPeriod(returnPeriod);
    const blocks = await this.scenarios.exposedBlocks(scenario.id, 0.05, sectorIds);
    const recipients = await this.prisma.resident.count({
      where: { blockId: { in: blocks.map((b) => b.block_id) }, status: 'ACTIVE' },
    });
    return {
      scenario,
      recipients,
      blocks: blocks.map((b) => ({ ...b, message: buildMessage(level, b) })),
    };
  }

  /** Crea el evento y encola un mensaje por vecino expuesto. */
  async issue(params: {
    level: AlertLevel;
    trigger: AlertTrigger;
    operatorId?: string;
    sectorIds?: string[];
    note?: string;
  }) {
    if (params.level === AlertLevel.NORMAL) {
      throw new BadRequestException('Para volver a Normal se cierra la alerta activa');
    }
    const returnPeriod = ALERT_SCENARIO[params.level]!;
    const scenario = await this.scenarios.findByReturnPeriod(returnPeriod);

    const alert = await this.prisma.alertEvent.create({
      data: {
        level: params.level,
        trigger: params.trigger,
        scenarioId: scenario.id,
        operatorId: params.operatorId,
        sectorIds: params.sectorIds ?? [],
        note: params.note,
      },
    });

    await this.dispatchQueue.add('fan-out', { alertId: alert.id });
    await this.ackTimeoutQueue.add(
      'check',
      { alertId: alert.id },
      { delay: (this.config.get<number>('ackTimeoutMinutes') ?? 15) * 60_000 },
    );

    this.gateway.emitAlertLevel({
      alertId: alert.id,
      level: alert.level,
      returnPeriod,
      validatedScenario: scenario.validated,
    });
    return alert;
  }

  /** Respuesta del vecino: "Estoy a salvo" o "Necesito ayuda". */
  async acknowledge(alertId: string, residentId: string, status: AckStatus.SAFE | AckStatus.NEEDS_HELP) {
    const delivery = await this.prisma.alertDelivery.findUnique({
      where: { alertId_residentId: { alertId, residentId } },
      include: { resident: { include: { block: true } } },
    });
    if (!delivery) throw new NotFoundException('No hay mensaje de esta alerta para el vecino');

    const updated = await this.prisma.alertDelivery.update({
      where: { id: delivery.id },
      data: { ackStatus: status, ackAt: new Date() },
    });

    this.gateway.emitAck({ alertId, residentId, status });
    if (status === AckStatus.NEEDS_HELP && delivery.resident.block) {
      this.gateway.emitHelpNeeded(delivery.resident.block.sectorId, {
        deliveryId: delivery.id,
        residentId,
        blockId: delivery.resident.blockId,
        householdSize: delivery.resident.householdSize,
        needsAssistance: delivery.resident.needsAssistance,
      });
    }
    return updated;
  }

  /** Resumen para el panel: cuántos confirmaron, cuántos piden ayuda, cuántos no responden. */
  async ackSummary(alertId: string) {
    const rows = await this.prisma.alertDelivery.groupBy({
      by: ['ackStatus'],
      where: { alertId },
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((r) => [r.ackStatus, r._count._all]));
  }

  async close(alertId: string) {
    const alert = await this.prisma.alertEvent.update({
      where: { id: alertId },
      data: { closedAt: new Date() },
    });
    this.gateway.emitAlertLevel({ alertId, level: AlertLevel.NORMAL });
    return alert;
  }
}
