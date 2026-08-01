import { ThemeAiService } from './theme-ai.service';

const messagesCreateMock = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: messagesCreateMock },
  }));
});

describe('ThemeAiService', () => {
  const prismaMock = {
    theme: { findMany: jest.fn() },
  };

  const themes = [
    {
      id: 'theme-legal',
      key: 'professional',
      name: 'Ejecutivo',
      baseConfig: {
        categories: ['professional'],
        tagline: 'Serio y confiable',
      },
    },
    {
      id: 'theme-dark',
      key: 'midnight',
      name: 'Medianoche',
      baseConfig: { categories: ['dark'], tagline: 'Elegancia nocturna' },
    },
  ];

  function makeConfig(apiKey?: string) {
    return { get: () => apiKey } as any;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('without an API key (keyword fallback)', () => {
    let themeAiService: ThemeAiService;

    beforeEach(() => {
      themeAiService = new ThemeAiService(
        prismaMock as any,
        makeConfig(undefined),
      );
    });

    it('only considers system themes', async () => {
      prismaMock.theme.findMany.mockResolvedValue([]);

      await themeAiService.suggest('algo');

      expect(prismaMock.theme.findMany).toHaveBeenCalledWith({
        where: { isSystem: true },
      });
    });

    it('never calls the Anthropic client', async () => {
      prismaMock.theme.findMany.mockResolvedValue(themes);

      await themeAiService.suggest('oscuro');

      expect(messagesCreateMock).not.toHaveBeenCalled();
    });

    it('matches a theme via a keyword found in its category', async () => {
      prismaMock.theme.findMany.mockResolvedValue(themes);

      const result = await themeAiService.suggest(
        'necesito algo para mi despacho de abogados',
      );

      expect(result.matched).toBe(true);
      expect(result.key).toBe('professional');
      expect(result.themeId).toBe('theme-legal');
      expect(result.reason).toBe('Serio y confiable');
    });

    it('picks the theme with the highest keyword score when several match', async () => {
      prismaMock.theme.findMany.mockResolvedValue(themes);

      // Two distinct "dark" keywords ("oscuro", "nocturno") outscore the
      // single "professional" keyword mention.
      const result = await themeAiService.suggest(
        'quiero un estilo oscuro y nocturno, algo profesional',
      );

      expect(result.key).toBe('midnight');
    });

    it('returns matched: false with a guidance message when nothing matches', async () => {
      prismaMock.theme.findMany.mockResolvedValue(themes);

      const result = await themeAiService.suggest('xyz sin relación alguna');

      expect(result.matched).toBe(false);
      expect(result.themeId).toBeNull();
      expect(result.key).toBeNull();
      expect(result.reason).toContain('No encontramos un tema');
    });

    it('returns matched: false when there are no system themes at all', async () => {
      prismaMock.theme.findMany.mockResolvedValue([]);

      const result = await themeAiService.suggest('oscuro');

      expect(result.matched).toBe(false);
    });
  });

  describe('with an API key configured (Claude)', () => {
    let themeAiService: ThemeAiService;

    beforeEach(() => {
      themeAiService = new ThemeAiService(
        prismaMock as any,
        makeConfig('sk-ant-test'),
      );
      prismaMock.theme.findMany.mockResolvedValue(themes);
    });

    it('asks Claude to pick from the catalog via a forced tool call', async () => {
      messagesCreateMock.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            name: 'select_theme',
            input: { themeKey: 'midnight', reason: 'Encaja con lo oscuro' },
          },
        ],
      });

      const result = await themeAiService.suggest('algo oscuro y elegante');

      expect(messagesCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tool_choice: { type: 'tool', name: 'select_theme' },
        }),
      );
      expect(result).toEqual({
        themeId: 'theme-dark',
        key: 'midnight',
        name: 'Medianoche',
        matched: true,
        reason: 'Encaja con lo oscuro',
      });
    });

    it('returns matched: false when Claude answers "none"', async () => {
      messagesCreateMock.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            name: 'select_theme',
            input: { themeKey: 'none', reason: 'No hay un buen match' },
          },
        ],
      });

      const result = await themeAiService.suggest('algo completamente ambiguo');

      expect(result.matched).toBe(false);
      expect(result.reason).toBe('No hay un buen match');
    });

    it('falls back to keyword matching when the Claude call throws', async () => {
      messagesCreateMock.mockRejectedValue(new Error('rate limited'));

      const result = await themeAiService.suggest(
        'necesito algo para mi despacho de abogados',
      );

      expect(result.matched).toBe(true);
      expect(result.key).toBe('professional');
    });

    it('falls back to keyword matching when Claude picks a key outside the catalog', async () => {
      messagesCreateMock.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            name: 'select_theme',
            input: { themeKey: 'not-a-real-theme', reason: 'x' },
          },
        ],
      });

      const result = await themeAiService.suggest(
        'necesito algo para mi despacho de abogados',
      );

      expect(result.matched).toBe(true);
      expect(result.key).toBe('professional');
    });

    it('falls back to keyword matching when the response has no tool_use block', async () => {
      messagesCreateMock.mockResolvedValue({
        content: [{ type: 'text', text: 'oops' }],
      });

      const result = await themeAiService.suggest(
        'necesito algo para mi despacho de abogados',
      );

      expect(result.matched).toBe(true);
      expect(result.key).toBe('professional');
    });
  });
});
