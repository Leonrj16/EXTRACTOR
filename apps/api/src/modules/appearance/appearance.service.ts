import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateCustomThemeDto } from './dto/create-custom-theme.dto';
import type { UpdateAppearanceDto } from './dto/update-appearance.dto';

@Injectable()
export class AppearanceService {
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

  // Catálogo de temas del sistema + los temas propios del usuario
  // (creados vía "Guardar tema"/"Duplicar") — la galería del Theme Engine
  // muestra ambos grupos juntos.
  async listThemes(userId: string) {
    const profileId = await this.getProfileId(userId);
    return this.prisma.theme.findMany({
      where: { OR: [{ isSystem: true }, { profileId }] },
      orderBy: { name: 'asc' },
    });
  }

  async getByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, favoriteThemeKeys: true },
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
    return { ...appearance, favoriteThemeKeys: profile.favoriteThemeKeys };
  }

  async update(userId: string, dto: UpdateAppearanceDto) {
    const profileId = await this.getProfileId(userId);

    if (dto.themeId) {
      const theme = await this.prisma.theme.findFirst({
        where: { id: dto.themeId, OR: [{ isSystem: true }, { profileId }] },
      });
      if (!theme) {
        throw new BadRequestException('La plantilla seleccionada no existe');
      }
    }

    return this.prisma.appearance.update({
      where: { profileId },
      data: {
        ...dto,
        themeOverrides: dto.themeOverrides as Prisma.InputJsonValue,
      },
      include: { theme: true },
    });
  }

  // Persiste una definición ya resuelta por el frontend como un tema
  // nuevo del usuario — sirve tanto a "Duplicar tema" (clon de un tema
  // del catálogo) como a "Guardar tema" (la personalización activa),
  // la diferencia está solo en qué baseConfig envía el cliente.
  async createCustomTheme(userId: string, dto: CreateCustomThemeDto) {
    const profileId = await this.getProfileId(userId);
    return this.prisma.theme.create({
      data: {
        key: `custom-${profileId}-${Date.now()}`,
        name: dto.name,
        layout: dto.layout ?? 'list',
        baseConfig: dto.baseConfig as Prisma.InputJsonValue,
        isSystem: false,
        profileId,
      },
    });
  }

  async deleteCustomTheme(userId: string, themeId: string) {
    const profileId = await this.getProfileId(userId);
    const theme = await this.prisma.theme.findFirst({
      where: { id: themeId, profileId },
    });
    if (!theme) {
      throw new NotFoundException('Tema no encontrado');
    }
    try {
      await this.prisma.theme.delete({ where: { id: themeId } });
    } catch {
      throw new BadRequestException(
        'No se pudo eliminar: cambia a otro tema antes de borrar este.',
      );
    }
    return { deleted: true };
  }

  async toggleFavoriteTheme(userId: string, themeKey: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, favoriteThemeKeys: true },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const isFavorite = profile.favoriteThemeKeys.includes(themeKey);
    const favoriteThemeKeys = isFavorite
      ? profile.favoriteThemeKeys.filter((key) => key !== themeKey)
      : [...profile.favoriteThemeKeys, themeKey];

    await this.prisma.profile.update({
      where: { id: profile.id },
      data: { favoriteThemeKeys },
    });

    return { favoriteThemeKeys };
  }
}
