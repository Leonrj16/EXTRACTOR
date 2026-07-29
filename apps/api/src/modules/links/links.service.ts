import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateLinkDto } from './dto/create-link.dto';
import type { UpdateLinkDto } from './dto/update-link.dto';
import type { ReorderLinksDto } from './dto/reorder-links.dto';

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }
    return profile.id;
  }

  async list(userId: string) {
    const profileId = await this.getProfileId(userId);
    return this.prisma.link.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });
  }

  async create(userId: string, dto: CreateLinkDto) {
    const profileId = await this.getProfileId(userId);

    const order =
      dto.order ??
      ((await this.prisma.link.count({ where: { profileId } })) + 1) * 10;

    return this.prisma.link.create({
      data: {
        ...dto,
        metadata: dto.metadata as Prisma.InputJsonValue,
        order,
        profileId,
      },
    });
  }

  async update(userId: string, linkId: string, dto: UpdateLinkDto) {
    await this.assertOwnership(userId, linkId);
    return this.prisma.link.update({
      where: { id: linkId },
      data: { ...dto, metadata: dto.metadata as Prisma.InputJsonValue },
    });
  }

  async remove(userId: string, linkId: string) {
    await this.assertOwnership(userId, linkId);
    await this.prisma.link.delete({ where: { id: linkId } });
  }

  async reorder(userId: string, dto: ReorderLinksDto) {
    const profileId = await this.getProfileId(userId);
    const ids = dto.items.map((item) => item.id);
    const owned = await this.prisma.link.findMany({
      where: { id: { in: ids }, profileId },
      select: { id: true },
    });

    if (owned.length !== ids.length) {
      throw new ForbiddenException('Uno o más enlaces no pertenecen a este perfil');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.link.update({ where: { id: item.id }, data: { order: item.order } }),
      ),
    );

    return this.list(userId);
  }

  private async assertOwnership(userId: string, linkId: string) {
    const profileId = await this.getProfileId(userId);
    const link = await this.prisma.link.findUnique({ where: { id: linkId } });
    if (!link || link.profileId !== profileId) {
      throw new NotFoundException('Enlace no encontrado');
    }
    return link;
  }
}
