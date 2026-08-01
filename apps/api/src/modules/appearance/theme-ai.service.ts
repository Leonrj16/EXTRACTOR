import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Theme } from '@prisma/client';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';

// Clasificación simple y barata — no hace falta el modelo insignia.
const MODEL = 'claude-haiku-4-5-20251001';

export interface SuggestResult {
  themeId: string | null;
  key: string | null;
  name: string | null;
  matched: boolean;
  reason: string;
}

const NO_MATCH_REASON =
  'No encontramos un tema que encaje claramente — prueba a mencionar un estilo (oscuro, minimalista, elegante...) o un rubro (salud, moda, restaurante...).';

/**
 * "Temas inteligentes": el usuario escribe una descripción ("un diseño
 * elegante para un estudio jurídico") y el sistema sugiere el tema del
 * catálogo que mejor encaja.
 *
 * Con ANTHROPIC_API_KEY configurada, `suggest()` le pasa el catálogo de
 * temas (key/nombre/categorías/tagline) a Claude como una herramienta de
 * una sola opción forzada (`tool_choice`), así la respuesta siempre es
 * una key válida del catálogo o "none" — nunca texto libre que haya que
 * adivinar cómo parsear.
 *
 * Sin la API key configurada (o si la llamada falla por cualquier razón:
 * red, rate limit, respuesta inesperada), cae a un match determinístico
 * por palabras clave contra las categorías de cada tema. El modelo real y
 * el fallback comparten la misma forma de entrada/salida a propósito, así
 * que degradar a keywords nunca rompe al frontend, solo da una sugerencia
 * más simple.
 */
@Injectable()
export class ThemeAiService {
  private readonly logger = new Logger(ThemeAiService.name);
  private readonly client: Anthropic | null;

  // Categoría → palabras clave en español que la sugieren. Usado solo por
  // el fallback determinístico.
  private readonly KEYWORDS: Record<string, string[]> = {
    minimalist: ['minimalista', 'minimal', 'simple', 'limpio', 'limpia'],
    dark: ['oscuro', 'oscura', 'noche', 'negro', 'nocturno'],
    professional: [
      'profesional',
      'serio',
      'seria',
      'formal',
      'confianza',
      'jurídico',
      'jurídica',
      'abogado',
      'abogada',
      'despacho',
      'legal',
      'consultoría',
    ],
    creative: [
      'creativo',
      'creativa',
      'arte',
      'artístico',
      'artística',
      'diseño',
      'original',
      'diseñador',
      'diseñadora',
    ],
    business: [
      'negocio',
      'negocios',
      'empresa',
      'empresarial',
      'startup',
      'marca',
      'corporativo',
      'estudio',
    ],
    fashion: [
      'moda',
      'fashion',
      'estilo',
      'elegante',
      'elegancia',
      'boutique',
      'lujo',
    ],
    health: [
      'salud',
      'médico',
      'médica',
      'doctor',
      'doctora',
      'clínica',
      'bienestar',
      'wellness',
      'consultorio',
    ],
    restaurant: [
      'restaurante',
      'comida',
      'chef',
      'cocina',
      'café',
      'bar',
      'gastronomía',
    ],
    technology: [
      'tecnología',
      'tech',
      'software',
      'digital',
      'innovación',
      'app',
      'saas',
    ],
  };

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<AppConfig, true>,
  ) {
    const apiKey = config.get('ai.anthropicApiKey', { infer: true });
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async suggest(prompt: string): Promise<SuggestResult> {
    const themes = await this.prisma.theme.findMany({
      where: { isSystem: true },
    });

    if (this.client) {
      try {
        return await this.suggestWithLlm(prompt, themes);
      } catch (error) {
        this.logger.warn(
          `Falló la sugerencia con Claude, usando fallback por palabras clave: ${String(error)}`,
        );
      }
    }

    return this.suggestByKeywords(prompt, themes);
  }

  private async suggestWithLlm(
    prompt: string,
    themes: Theme[],
  ): Promise<SuggestResult> {
    if (themes.length === 0) {
      return {
        themeId: null,
        key: null,
        name: null,
        matched: false,
        reason: NO_MATCH_REASON,
      };
    }

    const catalog = themes.map((theme) => {
      const config = theme.baseConfig as {
        categories?: string[];
        tagline?: string;
      };
      return {
        key: theme.key,
        name: theme.name,
        categories: config.categories ?? [],
        tagline: config.tagline ?? '',
      };
    });
    const themeKeys = catalog.map((entry) => entry.key);

    const response = await this.client!.messages.create({
      model: MODEL,
      max_tokens: 300,
      system:
        'Eres un asistente que elige, de un catálogo cerrado de temas visuales para una página de bio-link, el que mejor encaja con la descripción de un usuario. Responde únicamente usando la herramienta select_theme.',
      messages: [
        {
          role: 'user',
          content: `Catálogo de temas disponibles (JSON): ${JSON.stringify(catalog)}\n\nDescripción del usuario: "${prompt}"`,
        },
      ],
      tools: [
        {
          name: 'select_theme',
          description:
            'Selecciona el tema del catálogo que mejor encaja, o "none" si ninguno encaja razonablemente.',
          input_schema: {
            type: 'object',
            properties: {
              themeKey: {
                type: 'string',
                enum: [...themeKeys, 'none'],
                description: 'La key del tema elegido, o "none".',
              },
              reason: {
                type: 'string',
                description:
                  'Una frase breve en español explicando la elección, dirigida al usuario final.',
              },
            },
            required: ['themeKey', 'reason'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'select_theme' },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );
    if (!toolUse) {
      throw new Error(
        'La respuesta de Claude no incluyó una llamada a select_theme',
      );
    }

    const { themeKey, reason } = toolUse.input as {
      themeKey: string;
      reason: string;
    };
    if (themeKey === 'none') {
      return {
        themeId: null,
        key: null,
        name: null,
        matched: false,
        reason: reason || NO_MATCH_REASON,
      };
    }

    const chosen = themes.find((theme) => theme.key === themeKey);
    if (!chosen) {
      throw new Error(`Claude eligió una key fuera del catálogo: ${themeKey}`);
    }

    return {
      themeId: chosen.id,
      key: chosen.key,
      name: chosen.name,
      matched: true,
      reason,
    };
  }

  private suggestByKeywords(prompt: string, themes: Theme[]): SuggestResult {
    const normalized = prompt.toLowerCase();

    let best: { theme: Theme; score: number } | null = null;

    for (const theme of themes) {
      const config = theme.baseConfig as {
        categories?: string[];
        tagline?: string;
      };
      const categories = config.categories ?? [];
      let score = 0;

      for (const category of categories) {
        const keywords = this.KEYWORDS[category] ?? [];
        for (const keyword of keywords) {
          if (normalized.includes(keyword)) score += 1;
        }
      }
      // Pequeño empate a favor de un match directo en el nombre del tema.
      if (normalized.includes(theme.name.toLowerCase())) score += 2;

      if (!best || score > best.score) {
        best = { theme, score };
      }
    }

    if (!best || best.score === 0) {
      return {
        themeId: null,
        key: null,
        name: null,
        matched: false,
        reason: NO_MATCH_REASON,
      };
    }

    const config = best.theme.baseConfig as { tagline?: string };
    return {
      themeId: best.theme.id,
      key: best.theme.key,
      name: best.theme.name,
      matched: true,
      reason:
        config.tagline ??
        `"${best.theme.name}" es la mejor coincidencia para esa descripción.`,
    };
  }
}
