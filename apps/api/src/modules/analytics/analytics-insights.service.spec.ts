import { NotFoundException } from '@nestjs/common';
import { AnalyticsInsightsService } from './analytics-insights.service';

const messagesCreateMock = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: messagesCreateMock },
  }));
});

describe('AnalyticsInsightsService', () => {
  const prismaMock = {
    profile: { findUnique: jest.fn() },
    analyticsEvent: { count: jest.fn(), groupBy: jest.fn() },
    link: { findMany: jest.fn() },
  };

  function makeConfig(apiKey?: string) {
    return { get: () => apiKey } as any;
  }

  function makeService(apiKey?: string) {
    return new AnalyticsInsightsService(prismaMock as any, makeConfig(apiKey));
  }

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
    prismaMock.link.findMany.mockResolvedValue([
      { id: 'link-1', title: 'Instagram' },
    ]);
  });

  it('throws NotFoundException when the caller has no profile', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null);
    const service = makeService(undefined);

    await expect(service.getInsights('user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('without an API key (rule-based fallback)', () => {
    let service: AnalyticsInsightsService;

    beforeEach(() => {
      service = makeService(undefined);
    });

    it('never calls the Anthropic client', async () => {
      prismaMock.analyticsEvent.count.mockResolvedValue(0);
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);

      await service.getInsights('user-1');

      expect(messagesCreateMock).not.toHaveBeenCalled();
    });

    it('reports a growth trend when views rose vs. the previous period', async () => {
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(150) // totalViews
        .mockResolvedValueOnce(20) // totalClicks
        .mockResolvedValueOnce(100) // previousViews
        .mockResolvedValueOnce(15); // previousClicks
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.some((s) => s.includes('subieron 50%'))).toBe(
        true,
      );
    });

    it('reports a decline trend when views fell vs. the previous period', async () => {
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(15);
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.some((s) => s.includes('bajaron 50%'))).toBe(true);
    });

    it('names the top link and its share of clicks', async () => {
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.analyticsEvent.groupBy.mockImplementation(({ by }: any) => {
        if (by[0] === 'linkId') {
          return Promise.resolve([
            { linkId: 'link-1', _count: { linkId: 10 } },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getInsights('user-1', '7d');

      expect(
        result.insights.some(
          (s) => s.includes('Instagram') && s.includes('50%'),
        ),
      ).toBe(true);
    });

    it('flags a dominant device when it accounts for most page views', async () => {
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.analyticsEvent.groupBy.mockImplementation(({ by }: any) => {
        if (by[0] === 'device') {
          return Promise.resolve([
            { device: 'MOBILE', _count: { device: 80 } },
            { device: 'DESKTOP', _count: { device: 20 } },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.some((s) => s.includes('celular'))).toBe(true);
    });

    it('does not flag UNKNOWN as the dominant device', async () => {
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.analyticsEvent.groupBy.mockImplementation(({ by }: any) => {
        if (by[0] === 'device') {
          return Promise.resolve([
            { device: 'UNKNOWN', _count: { device: 90 } },
            { device: 'MOBILE', _count: { device: 10 } },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.every((s) => !s.includes('celular'))).toBe(true);
    });

    it('warns about a low click-through rate', async () => {
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.some((s) => s.includes('tasa de clics'))).toBe(
        true,
      );
    });

    it('falls back to a "not enough data" message when there is no activity', async () => {
      prismaMock.analyticsEvent.count.mockResolvedValue(0);
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights).toHaveLength(1);
      expect(result.insights[0]).toContain('suficiente actividad');
    });

    it('caps the output at 4 insights', async () => {
      prismaMock.analyticsEvent.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(5);
      prismaMock.analyticsEvent.groupBy.mockImplementation(({ by }: any) => {
        if (by[0] === 'linkId') {
          return Promise.resolve([{ linkId: 'link-1', _count: { linkId: 5 } }]);
        }
        if (by[0] === 'device') {
          return Promise.resolve([
            { device: 'MOBILE', _count: { device: 90 } },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.length).toBeLessThanOrEqual(4);
    });
  });

  describe('with an API key configured (Claude)', () => {
    let service: AnalyticsInsightsService;

    beforeEach(() => {
      service = makeService('sk-ant-test');
      prismaMock.analyticsEvent.count.mockResolvedValue(0);
      prismaMock.analyticsEvent.groupBy.mockResolvedValue([]);
    });

    it('asks Claude to write insights via a forced tool call', async () => {
      messagesCreateMock.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            name: 'write_insights',
            input: { insights: ['Tus visitas están creciendo.'] },
          },
        ],
      });

      const result = await service.getInsights('user-1', '7d');

      expect(messagesCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tool_choice: { type: 'tool', name: 'write_insights' },
        }),
      );
      expect(result.insights).toEqual(['Tus visitas están creciendo.']);
    });

    it('falls back to rule-based insights when the Claude call throws', async () => {
      messagesCreateMock.mockRejectedValue(new Error('rate limited'));
      prismaMock.analyticsEvent.count.mockResolvedValueOnce(100); // totalViews

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('falls back to rule-based insights when the response has no tool_use block', async () => {
      messagesCreateMock.mockResolvedValue({
        content: [{ type: 'text', text: 'oops' }],
      });

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('falls back to rule-based insights when write_insights returns an invalid shape', async () => {
      messagesCreateMock.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            name: 'write_insights',
            input: { insights: 'not an array' },
          },
        ],
      });

      const result = await service.getInsights('user-1', '7d');

      expect(result.insights.length).toBeGreaterThan(0);
    });
  });
});
