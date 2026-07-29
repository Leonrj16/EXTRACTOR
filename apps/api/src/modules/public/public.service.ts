import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { SubmitContactDto } from './dto/submit-contact.dto';

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

  async submitContact(username: string, dto: SubmitContactDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!profile) {
      throw new BadRequestException('Perfil no encontrado');
    }

    const link = await this.prisma.link.findUnique({ where: { id: dto.linkId } });
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
}
