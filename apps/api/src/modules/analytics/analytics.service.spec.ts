import { NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  const prismaMock = {
    profile: { findUnique: jest.fn() },
    analyticsEvent: { create: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    link: { findMany: jest.fn() },
  };

  let analyticsService: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService = new AnalyticsService(prismaMock as any);
  });

  describe('recordEvent', () => {
    interface CapturedCreate {
      data: {
        ipHash?: string;
        device?: string;
        browser?: string;
        os?: string;
      };
    }

    function captureCreateData() {
      let captured: CapturedCreate['data'] | undefined;
      prismaMock.analyticsEvent.create.mockImplementation(
        (args: CapturedCreate) => {
          captured = args.data;
          return Promise.resolve({});
        },
      );
      return () => captured;
    }

    it('hashes the ip address instead of storing it in plain text', () => {
      const getData = captureCreateData();

      analyticsService.recordEvent({
        profileId: 'profile-1',
        type: 'PAGE_VIEW',
        ip: '203.0.113.7',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0',
      });

      const data = getData();
      expect(data?.ipHash).toBeDefined();
      expect(data?.ipHash).not.toBe('203.0.113.7');
      expect(data?.ipHash).toHaveLength(64); // sha256 hex digest
    });

    it('derives device/browser/os from the user agent', () => {
      const getData = captureCreateData();

      analyticsService.recordEvent({
        profileId: 'profile-1',
        type: 'LINK_CLICK',
        linkId: 'link-1',
        userAgent: 'Mozilla/5.0 (iPhone) Safari/604.1',
      });

      const data = getData();
      expect(data?.device).toBe('MOBILE');
      expect(data?.os).toBe('iOS');
    });

    it('leaves ipHash undefined when no ip is given', () => {
      const getData = captureCreateData();

      analyticsService.recordEvent({
        profileId: 'profile-1',
        type: 'PAGE_VIEW',
      });

      expect(getData()?.ipHash).toBeUndefined();
    });
  });

  describe('getSummary', () => {
    it('throws NotFoundException when the user has no profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(null);

      await expect(
        analyticsService.getSummary('user-without-profile'),
      ).rejects.toThrow(NotFoundException);
    });

    it('computes clickThroughRate and maps top links to their titles', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(50);
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([
        { linkId: 'link-1', _count: { linkId: 30 } },
        { linkId: 'link-2', _count: { linkId: 20 } },
      ]);
      prismaMock.link.findMany.mockResolvedValue([
        { id: 'link-1', title: 'Instagram' },
      ]);

      const summary = await analyticsService.getSummary('user-1', '30d');

      expect(summary.totalViews).toBe(200);
      expect(summary.totalClicks).toBe(50);
      expect(summary.clickThroughRate).toBe(0.25);
      expect(summary.topLinks).toEqual([
        { linkId: 'link-1', title: 'Instagram', clicks: 30 },
        { linkId: 'link-2', title: 'Enlace eliminado', clicks: 20 },
      ]);
    });

    it('returns clickThroughRate 0 when there are no views yet', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);
      prismaMock.link.findMany.mockResolvedValue([]);

      const summary = await analyticsService.getSummary('user-1');

      expect(summary.clickThroughRate).toBe(0);
      expect(summary.range).toBe('7d');
    });

    it('falls back to 7 days for an unrecognized range', async () => {
      interface CountArgs {
        where: { createdAt: { gte: Date } };
      }
      let since: Date | undefined;
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.analyticsEvent.count.mockImplementation((args: CountArgs) => {
        since ??= args.where.createdAt.gte;
        return Promise.resolve(0);
      });
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);
      prismaMock.link.findMany.mockResolvedValue([]);

      await analyticsService.getSummary('user-1', 'not-a-range');

      const daysAgo =
        (Date.now() - (since as Date).getTime()) / (24 * 60 * 60 * 1000);
      expect(daysAgo).toBeCloseTo(7, 0);
    });
  });
});
