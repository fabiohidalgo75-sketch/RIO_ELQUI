import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/**
 * Datos base de ElquiAlerta (adaptado del seed de EcoPoint).
 * Las geometrías (manzanas, zonas inundables) NO se inventan aquí:
 * se cargan desde ArcGIS Pro con POST /api/v1/blocks/import.
 * Los umbrales de caudal son ilustrativos hasta tener los oficiales (DGA / SENAPRED).
 */
const prisma = new PrismaClient();

const SECTORS = ['Villa El Arrayán', 'Marquesa', 'Nueva Talcuna', 'El Almendral', 'San Carlos', 'Huanta', 'Centro'];

const ASSETS = [
  { type: 'ROCK_DEFENSE', name: 'Defensa fluvial acceso oriente, puente Ing. Alfonso Díaz Ossa', condition: 'GOOD' },
  { type: 'ROCK_DEFENSE', name: 'Enrocado puente Marquesa', condition: 'GOOD' },
  { type: 'GABION', name: 'Gaviones ribera sur, Villa El Arrayán', condition: 'DAMAGED' },
  { type: 'BRIDGE', name: 'Puente Ingeniero Díaz Ossa', condition: 'GOOD' },
  { type: 'BRIDGE', name: 'Puente Presbítero Tomás Álvarez', condition: 'GOOD' },
] as const;

const SCENARIOS = [
  { returnPeriod: 2, peakFlowM3s: 60 },
  { returnPeriod: 10, peakFlowM3s: 110 },
  { returnPeriod: 50, peakFlowM3s: 150 },
  { returnPeriod: 100, peakFlowM3s: 190 },
];

async function seedExtensionAndIndexes(): Promise<void> {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis`);
  // Índices espaciales (Prisma no los genera para columnas Unsupported)
  for (const [table, col] of [
    ['blocks', 'geom'],
    ['sectors', 'geom'],
    ['flood_zones', 'geom'],
    ['residents', 'location'],
    ['reports', 'location'],
    ['shelters', 'location'],
  ]) {
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_${table}_${col} ON ${table} USING GIST (${col})`,
    );
  }
}

async function main(): Promise<void> {
  await seedExtensionAndIndexes();

  for (const name of SECTORS) {
    await prisma.sector.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const s of SCENARIOS) {
    await prisma.floodScenario.upsert({
      where: { returnPeriod_modelVersion: { returnPeriod: s.returnPeriod, modelVersion: 'HEC-RAS 2D · borrador' } },
      update: {},
      create: { ...s, modelVersion: 'HEC-RAS 2D · borrador', demResolutionM: 5, validated: false },
    });
  }

  await prisma.hydroStation.upsert({
    where: { code: 'ELQUI-VICUNA' },
    update: {},
    create: {
      code: 'ELQUI-VICUNA',
      name: 'Estación río Elqui (referencial)',
      thresholdPreventiva: 110,
      thresholdAmarilla: 150,
      thresholdRoja: 190,
    },
  });

  if ((await prisma.infrastructureAsset.count()) === 0) {
    await prisma.infrastructureAsset.createMany({ data: ASSETS.map((a) => ({ ...a })) });
  }

  if ((await prisma.shelter.count()) === 0) {
    await prisma.shelter.create({ data: { name: 'Escuela Lucila Godoy Alcayaga', capacity: 180 } });
  }

  const email = process.env['SEED_OPERATOR_EMAIL'] ?? 'operador@elquialerta.local';
  const password = process.env['SEED_OPERATOR_PASSWORD'];
  if (!password) {
    console.warn('SEED_OPERATOR_PASSWORD no definido: no se crea el operador inicial');
  } else {
    await prisma.operator.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: process.env['SEED_OPERATOR_NAME'] ?? 'Centro de Monitoreo',
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
  }

  console.log('Seed listo: sectores, escenarios, estación, infraestructura, albergue y operador');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
