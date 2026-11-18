import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AlertLevel, AlertTrigger } from '@elquialerta/shared-types';
import { AlertsService } from '../alerts/alerts.service';

const ORDER = [AlertLevel.NORMAL, AlertLevel.PREVENTIVA, AlertLevel.AMARILLA, AlertLevel.ROJA];

interface EvaluateJob {
  stationId: string;
  flowM3s: number;
  level: AlertLevel;
}

/**
 * Si el caudal sube a un nivel mayor que la alerta activa, emite una alerta AUTO.
 * Nunca baja el nivel solo: cerrar o rebajar una alerta es decisión del operador.
 */
@Processor('hydro-threshold')
export class HydroThresholdWorker extends WorkerHost {
  private readonly logger = new Logger(HydroThresholdWorker.name);

  constructor(private readonly alerts: AlertsService) {
    super();
  }

  async process(job: Job<EvaluateJob>): Promise<void> {
    const { level, flowM3s } = job.data;
    const active = await this.alerts.active();
    const current = active?.level ?? AlertLevel.NORMAL;

    if (ORDER.indexOf(level) > ORDER.indexOf(current as AlertLevel)) {
      this.logger.warn(`Caudal ${flowM3s} m³/s → sube de ${current} a ${level}`);
      await this.alerts.issue({
        level,
        trigger: AlertTrigger.AUTO,
        note: `Automática por caudal ${flowM3s} m³/s`,
      });
    }
  }
}
