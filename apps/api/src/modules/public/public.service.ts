import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { SubmitContactDto } from './dto/submit-contact.dto';

const PROFILE_WITH_CONTENT = Prisma.validator<Prisma.ProfileDefaultArgs>()({
  include: {
    appearance: { include: { theme: true } },
    links: { where: { isActive: true }, orderBy: { order: 'asc' } },
  },
});
type ProfileWithContent = Prisma.ProfileGetPayload<typeof PROFILE_WITH_CONTENT>;

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProfile(username: string) {
    const profile = await this.findPublishedProfile(username);

    if (profile.isPasswordProtected) {
      return this.toGatedProfile(profile);
    }

    return this.omitSecrets(profile);
  }

  /**
   * Separate from getPublicProfile on purpose: the page route (ISR,
   * revalidate: 60, shared across every visitor) can only ever serve the
   * gated shape for a protected profile — caching one visitor's unlocked
   * content would leak it to the next. Unlocking happens client-side
   * instead, one request per visitor, never cached.
   */
  async unlockProfile(username: string, password: string) {
    const profile = await this.findPublishedProfile(username);

    if (!profile.isPasswordProtected || !profile.pagePasswordHash) {
      return this.omitSecrets(profile);
    }

    const matches = await bcrypt.compare(password, profile.pagePasswordHash);
    if (!matches) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    return this.omitSecrets(profile);
  }

  /**
   * "Clonar diseño": a diferencia de getPublicProfile, esto nunca incluye
   * contenido personal — ni título/url/ícono/metadata de cada bloque (solo
   * su tipo y orden), ni bio/avatar/contacto del perfil, ni backgroundImage
   * de Appearance (es un archivo subido por ese usuario, no algo que otro
   * perfil deba poder referenciar). Deliberadamente no respeta
   * isPasswordProtected: la estructura (tema + qué tipos de bloque hay, en
   * qué orden) no es información personal, es lo mismo que vería cualquiera
   * en la vista previa de una plantilla.
   *
   * themeId solo se incluye si el tema de origen es del catálogo del
   * sistema (Theme.isSystem) — apuntar el Appearance de otro perfil al
   * theme *custom* de este dueño lo dejaría dependiendo de una fila que no
   * le pertenece y que su dueño podría borrar. Con un tema custom, el
   * llamador igual recibe los valores de color/estilo para aplicarlos
   * sobre su propio tema actual.
   */
  async getProfileStructure(username: string) {
    const profile = await this.findPublishedProfile(username);

    return {
      username: profile.username,
      displayName: profile.displayName,
      appearance: profile.appearance
        ? {
            themeId: profile.appearance.theme.isSystem
              ? profile.appearance.themeId
              : undefined,
            themeKey: profile.appearance.theme.key,
            themeName: profile.appearance.theme.name,
            primaryColor: profile.appearance.primaryColor,
            backgroundColor: profile.appearance.backgroundColor,
            buttonStyle: profile.appearance.buttonStyle,
            borderStyle: profile.appearance.borderStyle,
            shadowStyle: profile.appearance.shadowStyle,
            fontFamily: profile.appearance.fontFamily,
            animation: profile.appearance.animation,
            layout: profile.appearance.layout,
            themeOverrides: profile.appearance.themeOverrides,
          }
        : null,
      // profile.links ya viene filtrado a isActive y ordenado por `order`
      // (ver PROFILE_WITH_CONTENT).
      blocks: profile.links.map((link) => ({
        type: link.type,
        styleOverrides: link.styleOverrides,
      })),
    };
  }

  async submitContact(username: string, dto: SubmitContactDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!profile) {
      throw new BadRequestException('Perfil no encontrado');
    }

    const link = await this.prisma.link.findUnique({
      where: { id: dto.linkId },
    });
    if (!link || link.profileId !== profile.id || link.type !== 'FORM') {
      throw new BadRequestException('Formulario inválido para este perfil');
    }

    return this.prisma.contactSubmission.create({
      data: {
        linkId: link.id,
        profileId: profile.id,
        name: dto.name,
        email: dto.email,
        message: dto.message,
      },
    });
  }

  private async findPublishedProfile(
    username: string,
  ): Promise<ProfileWithContent> {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      ...PROFILE_WITH_CONTENT,
    });

    if (!profile || !profile.isPublished) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return profile;
  }

  /** pagePasswordHash and customDomainToken never leave this service — not
   * even to an authenticated-and-correctly-unlocked visitor. */
  private omitSecrets(profile: ProfileWithContent) {
    const {
      pagePasswordHash: _pagePasswordHash,
      customDomainToken: _customDomainToken,
      ...rest
    } = profile;
    return rest;
  }

  private toGatedProfile(profile: ProfileWithContent) {
    return {
      isPasswordProtected: true as const,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      seoTitle: profile.seoTitle,
      seoDescription: profile.seoDescription,
    };
  }
}
