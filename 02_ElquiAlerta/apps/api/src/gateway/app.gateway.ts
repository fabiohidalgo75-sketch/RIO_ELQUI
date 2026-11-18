import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@elquialerta/shared-types';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * Igual que EcoPoint (rooms por rol + adaptador Redis) con dos mejoras:
 *  1. CORS restringido a ALLOWED_ORIGINS (EcoPoint usaba origin: '*').
 *  2. Rooms por sector, para que cada brigada reciba solo lo de su zona.
 */
@WebSocketGateway({
  cors: {
    origin: (process.env['ALLOWED_ORIGINS'] ?? '').split(',').filter(Boolean),
    credentials: true,
  },
})
export class AppGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server): void {
    const pub = new Redis({
      host: this.config.get<string>('redis.host')!,
      port: this.config.get<number>('redis.port')!,
    });
    const sub = pub.duplicate();
    pub.on('error', (err) => this.logger.error(`Redis pub: ${err.message}`));
    sub.on('error', (err) => this.logger.error(`Redis sub: ${err.message}`));
    server.adapter(createAdapter(pub, sub));

    server.use((socket, next) => {
      const token =
        (socket.handshake.auth as Record<string, string>)?.token ??
        socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      try {
        socket.data.user = this.jwtService.verify<JwtPayload>(token, {
          secret: this.config.get<string>('jwt.accessSecret'),
        });
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
    this.logger.log('Gateway listo (Redis adapter)');
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { sectorId?: string }): void {
    const user = client.data.user as JwtPayload | undefined;
    if (!user) return;
    if (user.role === Role.OPERATOR) client.join('operators');
    if (user.role === Role.BRIGADIST) {
      client.join('brigadists');
      if (payload?.sectorId) client.join(`sector:${payload.sectorId}`);
    }
    if (user.role === Role.RESIDENT) client.join(`resident:${user.sub}`);
  }

  emitReading(data: Record<string, unknown>): void {
    this.server.to('operators').emit('hydro:reading', data);
  }

  emitAlertLevel(data: Record<string, unknown>): void {
    this.server.to(['operators', 'brigadists']).emit('alert:level', data);
  }

  emitAck(data: Record<string, unknown>): void {
    this.server.to('operators').emit('alert:ack', data);
  }

  emitHelpNeeded(sectorId: string, data: Record<string, unknown>): void {
    this.server.to([`sector:${sectorId}`, 'operators']).emit('help:needed', data);
  }

  emitReport(data: Record<string, unknown>): void {
    this.server.to(['operators', 'brigadists']).emit('report:new', data);
  }
}
