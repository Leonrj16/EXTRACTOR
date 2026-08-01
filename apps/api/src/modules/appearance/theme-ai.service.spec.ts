import { ThemeAiService } from './theme-ai.service';

describe('ThemeAiService', () => {
  const prismaMock = {
    theme: { findMany: jest.fn() },
  };

  let themeAiService: ThemeAiService;

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

  beforeEach(() => {
    jest.clearAllMocks();
    themeAiService = new ThemeAiService(prismaMock as any);
  });

  it('only considers system themes', async () => {
    prismaMock.theme.findMany.mockResolvedValue([]);

    await themeAiService.suggest('algo');

    expect(prismaMock.theme.findMany).toHaveBeenCalledWith({
      where: { isSystem: true },
    });
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
