import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProfile(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      include: {
        appearance: { include: { theme: true } },
        links: { where: { isActive: true }, orderBy: { order: 'asc' } },
      },
    });

    if (!profile || !profile.isPublished) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return profile;
  }
}
