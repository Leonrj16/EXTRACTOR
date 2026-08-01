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
