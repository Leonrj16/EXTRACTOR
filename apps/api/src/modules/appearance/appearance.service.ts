import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateAppearanceDto } from './dto/update-appearance.dto';

@Injectable()
export class AppearanceService {
  constructor(private readonly prisma: PrismaService) {}

  listThemes() {
    return this.prisma.theme.findMany({ orderBy: { name: 'asc' } });
  }

  async getByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const appearance = await this.prisma.appearance.findUnique({
      where: { profileId: profile.id },
      include: { theme: true },
    });
    if (!appearance) {
      throw new NotFoundException('Apariencia no configurada');
    }
    return appearance;
  }

  async update(userId: string, dto: UpdateAppearanceDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    if (dto.themeId) {
      const theme = await this.prisma.theme.findUnique({ where: { id: dto.themeId } });
      if (!theme) {
        throw new BadRequestException('La plantilla seleccionada no existe');
      }
    }

    return this.prisma.appearance.update({
      where: { profileId: profile.id },
      data: dto,
      include: { theme: true },
    });
  }
}
