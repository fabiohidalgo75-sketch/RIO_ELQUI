import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ResidentsModule } from './residents/residents.module';
import { BrigadistsModule } from './brigadists/brigadists.module';
import { OperatorsModule } from './operators/operators.module';
import { BlocksModule } from './blocks/blocks.module';
import { FloodScenariosModule } from './flood-scenarios/flood-scenarios.module';
import { HydrologyModule } from './hydrology/hydrology.module';
import { AlertsModule } from './alerts/alerts.module';
import { EvacuationModule } from './evacuation/evacuation.module';
import { ReportsModule } from './reports/reports.module';
import { InspectionsModule } from './inspections/inspections.module';
import { PreparednessModule } from './preparedness/preparedness.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { GatewayModule } from './gateway/gateway.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '../../.env',
    }),
    // Global: lo usan AuthService, el gateway (verifica tokens de socket) y los workers
    JwtModule.register({ global: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    ResidentsModule,
    BrigadistsModule,
    OperatorsModule,
    BlocksModule,
    FloodScenariosModule,
    HydrologyModule,
    AlertsModule,
    EvacuationModule,
    ReportsModule,
    InspectionsModule,
    PreparednessModule,
    NotificationsModule,
    StorageModule,
    GatewayModule,
    WorkersModule,
  ],
})
export class AppModule {}
