import { randomBytes } from 'node:crypto';
import { resolveTxt } from 'node:dns/promises';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Profile, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RESERVED_USERNAMES } from '../../common/constants/reserved-usernames';
import type { UpdateProfileDto } from './dto/update-profile.dto';

const VERIFICATION_SUBDOMAIN = '_aura-verify';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }
    return this.omitSecrets(profile);
  }

  async update(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      if (RESERVED_USERNAMES.has(dto.username.toLowerCase())) {
        throw new BadRequestException('Ese nombre de usuario está reservado');
      }

      const existing = await this.prisma.profile.findUnique({
        where: { username: dto.username },
      });
      if (existing && existing.userId !== userId) {
        throw new ConflictException('Ese nombre de usuario ya está en uso');
      }
    }

    const { pagePassword, ...rest } = dto;
    const data: Prisma.ProfileUpdateInput = { ...rest };
    if (pagePassword) {
      data.pagePasswordHash = await bcrypt.hash(pagePassword, 10);
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data,
    });
    return this.omitSecrets(profile);
  }

  /**
   * Sets (or replaces) the custom domain and issues a fresh verification
   * token — changing the domain always requires re-verifying, since the
   * old token proved control of the *old* domain, not this one.
   *
   * NOTE on scope: this only tracks and verifies domain ownership. Actually
   * routing requests for an arbitrary third-party domain to this app (TLS
   * cert issuance, reverse proxy / edge routing) is infrastructure that
   * lives outside this repo — see design-system/architecture/custom-domain.md.
   */
  async setCustomDomain(userId: string, domain: string) {
    const normalized = domain.toLowerCase().trim();

    const existing = await this.prisma.profile.findUnique({
      where: { customDomain: normalized },
    });
    if (existing && existing.userId !== userId) {
      throw new ConflictException('Ese dominio ya está en uso por otro perfil');
    }

    const customDomainToken = randomBytes(16).toString('hex');
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        customDomain: normalized,
        customDomainToken,
        customDomainVerifiedAt: null,
      },
    });
    return this.omitSecrets(profile);
  }

  async removeCustomDomain(userId: string) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        customDomain: null,
        customDomainToken: null,
        customDomainVerifiedAt: null,
      },
    });
    return this.omitSecrets(profile);
  }

  async verifyCustomDomain(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }
    if (!profile.customDomain || !profile.customDomainToken) {
      throw new BadRequestException(
        'Primero configura un dominio personalizado',
      );
    }

    const recordName = `${VERIFICATION_SUBDOMAIN}.${profile.customDomain}`;
    let records: string[][];
    try {
      records = await resolveTxt(recordName);
    } catch {
      throw new BadRequestException(
        `Todavía no encontramos un registro TXT en ${recordName}. Los cambios de DNS pueden tardar hasta un par de horas en propagarse — probá de nuevo más tarde.`,
      );
    }

    const matches = records.some(
      (chunks) => chunks.join('').trim() === profile.customDomainToken,
    );
    if (!matches) {
      throw new BadRequestException(
        `Encontramos un registro TXT en ${recordName}, pero no coincide con el valor esperado.`,
      );
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: { customDomainVerifiedAt: new Date() },
    });
    return this.omitSecrets(updated);
  }

  /** Only pagePasswordHash is a real secret — customDomainToken is a
   * public-by-design verification nonce (the owner has to copy it into
   * their DNS provider's UI), so it stays in the owner-facing response.
   * PublicService strips both from anything a visitor can see. */
  private omitSecrets(profile: Profile) {
    const { pagePasswordHash: _pagePasswordHash, ...rest } = profile;
    return rest;
  }
}
