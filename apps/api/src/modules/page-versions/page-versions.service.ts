import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LinkType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreatePageVersionDto } from './dto/create-page-version.dto';

/**
 * What a saved version actually stores: the Page Builder–relevant fields
 * of each Link, in order — deliberately no `id` (restoring always creates
 * fresh rows, see `restore()`) and no Appearance/theme (this is the
 * Editor Visual's block history, not the Theme Engine's).
 */
interface SnapshotLink {
  type: LinkType;
  title: string;
  url: string | null;
  icon: string | null;
  imageUrl: string | null;
  metadata: Prisma.JsonValue | null;
  styleOverrides: Prisma.JsonValue | null;
  isActive: boolean;
  order: number;
}

@Injectable()
export class PageVersionsService {
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
    return this.prisma.pageVersion.findMany({
      where: { profileId },
      select: { id: true, name: true, blockCount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreatePageVersionDto) {
    const profileId = await this.getProfileId(userId);
    const links = await this.prisma.link.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });

    const snapshot: SnapshotLink[] = links.map((link) => ({
      type: link.type,
      title: link.title,
      url: link.url,
      icon: link.icon,
      imageUrl: link.imageUrl,
      metadata: link.metadata,
      styleOverrides: link.styleOverrides,
      isActive: link.isActive,
      order: link.order,
    }));

    return this.prisma.pageVersion.create({
      data: {
        profileId,
        name: dto.name,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        blockCount: snapshot.length,
      },
      select: { id: true, name: true, blockCount: true, createdAt: true },
    });
  }

  async remove(userId: string, versionId: string) {
    const version = await this.assertOwnership(userId, versionId);
    await this.prisma.pageVersion.delete({ where: { id: version.id } });
    return { deleted: true };
  }

  /**
   * Replaces the profile's entire current block set with the snapshot's
   * — a full "go back to this point", not a merge with whatever exists
   * now. Deliberately not built on the in-memory undo stack
   * (use-editor-history.ts): that stack can't safely redo a create/delete
   * because the server assigns a fresh id to every row, but a whole-set
   * replace has no such problem — nothing outside this transaction ever
   * references the old ids.
   */
  async restore(userId: string, versionId: string) {
    const version = await this.assertOwnership(userId, versionId);
    const snapshot = version.snapshot as unknown as SnapshotLink[];
    if (!Array.isArray(snapshot)) {
      throw new BadRequestException(
        'El snapshot de esta versión está corrupto',
      );
    }

    await this.prisma.$transaction([
      this.prisma.link.deleteMany({ where: { profileId: version.profileId } }),
      ...snapshot.map((link) =>
        this.prisma.link.create({
          data: {
            profileId: version.profileId,
            type: link.type,
            title: link.title,
            url: link.url ?? undefined,
            icon: link.icon ?? undefined,
            imageUrl: link.imageUrl ?? undefined,
            metadata: link.metadata ?? undefined,
            styleOverrides: link.styleOverrides ?? undefined,
            isActive: link.isActive,
            order: link.order,
          },
        }),
      ),
    ]);

    return this.prisma.link.findMany({
      where: { profileId: version.profileId },
      orderBy: { order: 'asc' },
    });
  }

  private async assertOwnership(userId: string, versionId: string) {
    const profileId = await this.getProfileId(userId);
    const version = await this.prisma.pageVersion.findUnique({
      where: { id: versionId },
    });
    if (!version || version.profileId !== profileId) {
      throw new NotFoundException('Versión no encontrada');
    }
    return version;
  }
}
