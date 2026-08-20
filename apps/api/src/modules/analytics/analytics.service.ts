import { createHash } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { AnalyticsEventType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  detectBrowser,
  detectDevice,
  detectOs,
} from '../../common/utils/device.util';

const RANGE_TO_DAYS: Record<string, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

interface RecordEventInput {
  profileId: string;
  type: AnalyticsEventType;
  linkId?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  recordEvent(input: RecordEventInput) {
    return this.prisma.analyticsEvent.create({
      data: {
        profileId: input.profileId,
        linkId: input.linkId,
        type: input.type,
        referrer: input.referrer,
        device: detectDevice(input.userAgent),
        browser: detectBrowser(input.userAgent),
        os: detectOs(input.userAgent),
        ipHash: input.ip
          ? createHash('sha256').update(input.ip).digest('hex')
          : undefined,
      },
    });
  }

  async getSummary(userId: string, range = '7d') {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const days = RANGE_TO_DAYS[range] ?? 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalViews, totalClicks, topLinksRaw] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: {
          profileId: profile.id,
          type: 'PAGE_VIEW',
          createdAt: { gte: since },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          profileId: profile.id,
          type: 'LINK_CLICK',
          createdAt: { gte: since },
        },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['linkId'],
        where: {
          profileId: profile.id,
          type: 'LINK_CLICK',
          createdAt: { gte: since },
          linkId: { not: null },
        },
        _count: { linkId: true },
        orderBy: { _count: { linkId: 'desc' } },
        take: 5,
      }),
    ]);

    const linkIds = topLinksRaw
      .map((row) => row.linkId)
      .filter((id): id is string => !!id);
    const links = await this.prisma.link.findMany({
      where: { id: { in: linkIds } },
      select: { id: true, title: true },
    });
    const titleById = new Map(links.map((link) => [link.id, link.title]));

    return {
      range,
      totalViews,
      totalClicks,
      clickThroughRate:
        totalViews > 0 ? Number((totalClicks / totalViews).toFixed(4)) : 0,
      topLinks: topLinksRaw.map((row) => ({
        linkId: row.linkId as string,
        title: titleById.get(row.linkId as string) ?? 'Enlace eliminado',
        clicks: row._count.linkId,
      })),
    };
  }
}
