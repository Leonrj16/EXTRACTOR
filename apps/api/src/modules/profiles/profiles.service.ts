import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Profile, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RESERVED_USERNAMES } from '../../common/constants/reserved-usernames';
import type { UpdateProfileDto } from './dto/update-profile.dto';

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

    const profile = await this.prisma.profile.update({ where: { userId }, data });
    return this.omitSecrets(profile);
  }

  /** Never send the page-password hash or the domain-verification token to
   * the client — even the owner's own browser doesn't need them, and a
   * compromised admin session shouldn't be able to exfiltrate a hash for
   * offline cracking. */
  private omitSecrets(profile: Profile) {
    const { pagePasswordHash: _pagePasswordHash, customDomainToken: _customDomainToken, ...rest } = profile;
    return rest;
  }
}
