import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReportPriority, ReportStatus } from '@elquialerta/shared-types';
import { PrismaService } from '../prisma/prisma.service';

const CLUSTER_SIZE = 3; // igual que el umbral de EcoPoint
const RADIUS_M = 300;
const WINDOW_MIN = 60;

/**
 * Adaptación de report-alert.worker de EcoPoint:
 * 3+ reportes del mismo tipo a menos de 300 m en la última hora → CRITICAL.
 * Sirve para confirmar un desborde real a partir de varios vecinos.
 */
@Processor('report-escalation')
export class ReportEscalationWorker extends WorkerHost {
  private readonly logger = new Logger(ReportEscalationWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ reportId: string }>): Promise<void> {
    const cluster = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT r2.id
      FROM reports r1
      JOIN reports r2
        ON r2.type = r1.type
       AND r2.status IN ('PENDING', 'VERIFYING')
       AND r2.created_at > now() - make_interval(mins => ${WINDOW_MIN})
       AND ST_DWithin(r1.location::geography, r2.location::geography, ${RADIUS_M})
      WHERE r1.id = ${job.data.reportId}
    `;

    if (cluster.length >= CLUSTER_SIZE) {
      await this.prisma.report.updateMany({
        where: { id: { in: cluster.map((c) => c.id) }, status: ReportStatus.PENDING },
        data: { priority: ReportPriority.CRITICAL },
      });
      this.logger.warn(`${cluster.length} reportes agrupados → CRITICAL`);
    }
  }
}
