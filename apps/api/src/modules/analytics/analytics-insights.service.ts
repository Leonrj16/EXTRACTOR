import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import type { AppConfig } from '../../config/configuration';

// Resumir números en 2-4 frases es una tarea de redacción, no de
// clasificación — pero tampoco necesita razonamiento profundo, así que
// se queda en el mismo nivel que theme-ai.service.ts (no en el modelo
// insignia que sí usa ai-editor.service.ts).
const MODEL = 'claude-haiku-4-5-20251001';

const RANGE_TO_DAYS: Record<string, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const RANGE_LABEL: Record<string, string> = {
  '1d': 'las últimas 24 horas',
  '7d': 'los últimos 7 días',
  '30d': 'los últimos 30 días',
  '90d': 'los últimos 90 días',
};

export interface InsightsResult {
  insights: string[];
}

interface InsightsData {
  rangeLabel: string;
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  previousViews: number;
  previousClicks: number;
  topLinks: { title: string; clicks: number; share: number }[];
  deviceBreakdown: { device: string; share: number }[];
}

/**
 * "Analítica con insights de IA": en vez de que el usuario tenga que
 * interpretar números crudos (visitas, clics, CTR, top links), esto los
 * traduce a 2-4 frases accionables en español plano.
 *
 * A diferencia de ai-editor.service.ts, esta sí tiene un fallback
 * determinístico razonable con ANTHROPIC_API_KEY ausente o si la llamada
 * falla — a diferencia de "editar la página en lenguaje libre", resumir
 * tendencias y compararlas contra umbrales es algo que reglas simples
 * hacen razonablemente bien (mismo criterio que theme-ai.service.ts).
 */
@Injectable()
export class AnalyticsInsightsService {
  private readonly logger = new Logger(AnalyticsInsightsService.name);
  private readonly client: Anthropic | null;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<AppConfig, true>,
  ) {
    const apiKey = config.get('ai.anthropicApiKey', { infer: true });
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async getInsights(userId: string, range = '7d'): Promise<InsightsResult> {
    const data = await this.collectData(userId, range);

    if (this.client) {
      try {
        return await this.summarizeWithLlm(data);
      } catch (error) {
        this.logger.warn(
          `Falló el resumen con Claude, usando fallback por reglas: ${String(error)}`,
        );
      }
    }

    return { insights: this.summarizeByRules(data) };
  }

  private async collectData(
    userId: string,
    range: string,
  ): Promise<InsightsData> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const days = RANGE_TO_DAYS[range] ?? 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const previousSince = new Date(
      since.getTime() - days * 24 * 60 * 60 * 1000,
    );

    const [
      totalViews,
      totalClicks,
      previousViews,
      previousClicks,
      topLinksRaw,
      deviceRaw,
    ] = await Promise.all([
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
      this.prisma.analyticsEvent.count({
        where: {
          profileId: profile.id,
          type: 'PAGE_VIEW',
          createdAt: { gte: previousSince, lt: since },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          profileId: profile.id,
          type: 'LINK_CLICK',
          createdAt: { gte: previousSince, lt: since },
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
        take: 3,
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['device'],
        where: {
          profileId: profile.id,
          type: 'PAGE_VIEW',
          createdAt: { gte: since },
        },
        _count: { device: true },
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

    const deviceTotal = deviceRaw.reduce(
      (sum, row) => sum + row._count.device,
      0,
    );

    return {
      rangeLabel: RANGE_LABEL[range] ?? RANGE_LABEL['7d'],
      totalViews,
      totalClicks,
      clickThroughRate:
        totalViews > 0 ? Number((totalClicks / totalViews).toFixed(4)) : 0,
      previousViews,
      previousClicks,
      topLinks: topLinksRaw.map((row) => ({
        title: titleById.get(row.linkId as string) ?? 'Enlace eliminado',
        clicks: row._count.linkId,
        share:
          totalClicks > 0
            ? Number((row._count.linkId / totalClicks).toFixed(4))
            : 0,
      })),
      deviceBreakdown: deviceRaw
        .map((row) => ({
          device: row.device,
          share:
            deviceTotal > 0
              ? Number((row._count.device / deviceTotal).toFixed(4))
              : 0,
        }))
        .sort((a, b) => b.share - a.share),
    };
  }

  private async summarizeWithLlm(data: InsightsData): Promise<InsightsResult> {
    const response = await this.client!.messages.create({
      model: MODEL,
      max_tokens: 500,
      system:
        'Eres un analista que traduce estadísticas de una página de bio-link a observaciones breves y accionables en español, dirigidas al dueño de la página. Responde únicamente usando la herramienta write_insights.',
      messages: [
        {
          role: 'user',
          content: `Estadísticas de ${data.rangeLabel} (JSON): ${JSON.stringify(data)}`,
        },
      ],
      tools: [
        {
          name: 'write_insights',
          description:
            'Registra entre 2 y 4 observaciones breves y accionables sobre las estadísticas.',
          input_schema: {
            type: 'object',
            properties: {
              insights: {
                type: 'array',
                minItems: 2,
                maxItems: 4,
                items: { type: 'string' },
                description:
                  'Frases cortas en español, cada una una observación u recomendación concreta.',
              },
            },
            required: ['insights'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'write_insights' },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );
    if (!toolUse) {
      throw new Error(
        'La respuesta de Claude no incluyó una llamada a write_insights',
      );
    }

    const { insights } = toolUse.input as { insights: unknown };
    if (
      !Array.isArray(insights) ||
      insights.length === 0 ||
      !insights.every((entry) => typeof entry === 'string')
    ) {
      throw new Error('write_insights devolvió un formato inválido');
    }

    return { insights: insights };
  }

  private summarizeByRules(data: InsightsData): string[] {
    const insights: string[] = [];

    if (data.previousViews > 0) {
      const change =
        ((data.totalViews - data.previousViews) / data.previousViews) * 100;
      if (Math.abs(change) >= 5) {
        insights.push(
          change > 0
            ? `Tus visitas subieron ${Math.round(change)}% respecto al período anterior.`
            : `Tus visitas bajaron ${Math.round(Math.abs(change))}% respecto al período anterior.`,
        );
      }
    } else if (data.totalViews > 0) {
      insights.push(
        `Tuviste ${data.totalViews} visita${data.totalViews === 1 ? '' : 's'} en ${data.rangeLabel}.`,
      );
    }

    if (data.topLinks.length > 0) {
      const top = data.topLinks[0];
      insights.push(
        `"${top.title}" es tu bloque con más clics — ${Math.round(top.share * 100)}% de todos los clics del período.`,
      );
    }

    const topKnownDevice = data.deviceBreakdown.find(
      (row) => row.device !== 'UNKNOWN',
    );
    if (topKnownDevice && topKnownDevice.share >= 0.6) {
      const deviceLabel =
        topKnownDevice.device === 'MOBILE'
          ? 'celular'
          : topKnownDevice.device === 'DESKTOP'
            ? 'computadora'
            : 'tablet';
      insights.push(
        `La mayoría de tus visitantes (${Math.round(topKnownDevice.share * 100)}%) entra desde ${deviceLabel} — asegurate de que tu página se vea bien ahí.`,
      );
    }

    if (data.totalViews > 0 && data.clickThroughRate < 0.05) {
      insights.push(
        `Tu tasa de clics es del ${(data.clickThroughRate * 100).toFixed(1)}% — probá poner tus bloques más importantes arriba de todo.`,
      );
    }

    if (insights.length === 0) {
      insights.push(
        `Todavía no hay suficiente actividad en ${data.rangeLabel} para sacar conclusiones — compartí tu página para empezar a ver datos.`,
      );
    }

    return insights.slice(0, 4);
  }
}
