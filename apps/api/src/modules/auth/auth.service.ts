import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AppConfig } from '../../config/configuration';
import { MailerService } from '../../common/mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly mailer: MailerService,
  ) {}

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.users.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.issueTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    const record = await this.resolveRefreshToken(rawRefreshToken);
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair({
      id: record.user.id,
      email: record.user.email,
      role: record.user.role,
    });
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const [id] = rawRefreshToken.split('.');
    if (!id) return;

    await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Always resolves, whether or not the email matches an account — telling
   * the caller "no existe esa cuenta" would let an attacker enumerate
   * registered emails. The reset link only goes out over email, which only
   * the real owner of that inbox can act on.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;

    const secret = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(secret, 10);
    const record = await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    const webUrl = this.config.get('webUrl', { infer: true });
    const link = `${webUrl}/admin/reset-password?token=${record.id}.${secret}`;

    await this.mailer.send({
      to: user.email,
      subject: 'Restablecer tu contraseña de Aura',
      html: `
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${link}">Elegir una nueva contraseña</a></p>
        <p>Este enlace vence en 1 hora. Si no pediste esto, ignora este correo.</p>
      `,
    });
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const [id, secret] = rawToken.split('.');
    if (!id || !secret) {
      throw new BadRequestException('Enlace de restablecimiento inválido');
    }

    const record = await this.prisma.verificationToken.findUnique({
      where: { id },
    });
    if (
      !record ||
      record.type !== 'PASSWORD_RESET' ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Este enlace ya no es válido — pide uno nuevo',
      );
    }

    const matches = await bcrypt.compare(secret, record.tokenHash);
    if (!matches) {
      throw new BadRequestException('Enlace de restablecimiento inválido');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.verificationToken.update({
        where: { id },
        data: { usedAt: new Date() },
      }),
      // Cambiar la contraseña invalida cualquier sesión existente — si
      // alguien más tenía acceso, este es el momento de cortarlo.
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async resolveRefreshToken(rawRefreshToken: string) {
    const [id, secret] = rawRefreshToken.split('.');
    if (!id || !secret) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const record = await this.prisma.refreshToken.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const matches = await bcrypt.compare(secret, record.tokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    return record;
  }

  private async issueTokenPair(user: AuthenticatedUser): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.get('jwt.accessSecret', { infer: true }),
        expiresIn: this.config.get('jwt.accessExpiresIn', { infer: true }),
      },
    );

    const secret = randomBytes(48).toString('hex');
    const tokenHash = await bcrypt.hash(secret, 10);
    const refreshExpiresIn = this.config.get('jwt.refreshExpiresIn', {
      infer: true,
    });

    const record = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: addDuration(new Date(), refreshExpiresIn),
      },
    });

    return { accessToken, refreshToken: `${record.id}.${secret}` };
  }
}

function addDuration(date: Date, duration: string): Date {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);

  const value = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return new Date(date.getTime() + value * unitMs[unit]);
}
