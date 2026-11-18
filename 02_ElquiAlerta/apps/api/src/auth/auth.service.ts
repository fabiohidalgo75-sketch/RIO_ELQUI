import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@elquialerta/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Solo los vecinos se registran solos; brigadistas y operadores los crea un operador. */
  async register(dto: RegisterDto): Promise<AuthTokensDto> {
    const existing = await this.prisma.resident.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El correo ya está registrado');

    // Manzana que contiene la vivienda (PostGIS)
    const [block] = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM blocks
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${dto.lng}, ${dto.lat}), 4326))
      LIMIT 1
    `;

    const resident = await this.prisma.resident.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 12),
        householdSize: dto.householdSize ?? 1,
        needsAssistance: dto.needsAssistance ?? false,
        blockId: block?.id,
        preparedness: { create: {} },
      },
    });
    await this.prisma.$executeRaw`
      UPDATE residents SET location = ST_SetSRID(ST_MakePoint(${dto.lng}, ${dto.lat}), 4326)
      WHERE id = ${resident.id}
    `;

    return this.issueTokens(resident.id, resident.email, Role.RESIDENT);
  }

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const { id, email, role, passwordHash } = await this.findEntityByEmail(dto.email);
    const valid = await bcrypt.compare(dto.password, passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');
    return this.issueTokens(id, email, role);
  }

  async refresh(payload: JwtPayload, rawRefreshToken: string): Promise<AuthTokensDto> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token revocado o vencido');
    }
    await this.prisma.refreshToken.delete({ where: { tokenHash } });
    return this.issueTokens(payload.sub, payload.email, payload.role as Role);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    await this.prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => null);
  }

  private async issueTokens(sub: string, email: string, role: Role): Promise<AuthTokensDto> {
    const payload: JwtPayload = { sub, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    });
    const refreshToken = this.jwt.sign(
      { ...payload, jti: randomUUID() },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      },
    );

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(
      Date.now() + this.parseExpiresIn(this.config.get<string>('jwt.refreshExpiresIn') ?? '7d'),
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        role, // enum Role (en EcoPoint era String libre)
        expiresAt,
        ...(role === Role.RESIDENT && { residentId: sub }),
        ...(role === Role.BRIGADIST && { brigadistId: sub }),
        ...(role === Role.OPERATOR && { operatorId: sub }),
      },
    });

    return { accessToken, refreshToken, role };
  }

  private parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 86_400_000;
    const mult: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return parseInt(match[1], 10) * (mult[match[2]] ?? 86_400_000);
  }

  private async findEntityByEmail(
    email: string,
  ): Promise<{ id: string; email: string; role: Role; passwordHash: string }> {
    const resident = await this.prisma.resident.findUnique({ where: { email } });
    if (resident) {
      if (resident.status !== 'ACTIVE') throw new UnauthorizedException('Cuenta suspendida');
      return { ...resident, role: Role.RESIDENT };
    }
    const brigadist = await this.prisma.brigadist.findUnique({ where: { email } });
    if (brigadist) {
      if (brigadist.status !== 'ACTIVE') throw new UnauthorizedException('Cuenta suspendida');
      return { ...brigadist, role: Role.BRIGADIST };
    }
    const operator = await this.prisma.operator.findUnique({ where: { email } });
    if (operator) return { ...operator, role: Role.OPERATOR };

    throw new UnauthorizedException('Credenciales inválidas');
  }
}
