import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    return profile;
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

    return this.prisma.profile.update({
      where: { userId },
      data: dto,
    });
  }
}
