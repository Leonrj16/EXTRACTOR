import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Arquitectura preparada para "Temas inteligentes": el usuario escribe
 * una descripción ("un diseño elegante para un estudio jurídico") y el
 * sistema sugiere el tema del catálogo que mejor encaja.
 *
 * Hoy no hay un modelo de lenguaje conectado — `suggest()` hace un match
 * determinístico por palabras clave contra las categorías/tagline de cada
 * tema (sembradas en Theme.baseConfig, ver prisma/seed.ts). El punto de
 * esta clase es que sea la ÚNICA pieza que hay que reemplazar cuando haya
 * un modelo real: mismo método, misma forma de entrada/salida, la
 * implementación interna cambia de "buscar por palabras clave" a "llamar
 * a un LLM", sin tocar el controller ni el frontend.
 */
@Injectable()
export class ThemeAiService {
  constructor(private readonly prisma: PrismaService) {}

  // Categoría → palabras clave en español que la sugieren. Ampliar esta
  // lista es la forma más simple de mejorar el mock sin tocar el resto
  // de la clase.
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

  async suggest(prompt: string) {
    const normalized = prompt.toLowerCase();
    const themes = await this.prisma.theme.findMany({
      where: { isSystem: true },
    });

    let best: { theme: (typeof themes)[number]; score: number } | null = null;

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
        reason:
          'No encontramos un tema que encaje claramente — prueba a mencionar un estilo (oscuro, minimalista, elegante...) o un rubro (salud, moda, restaurante...).',
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
