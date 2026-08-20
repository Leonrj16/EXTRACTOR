import Anthropic from '@anthropic-ai/sdk';
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LinkType } from '@prisma/client';
import type { AppConfig } from '../../config/configuration';
import { CreateLinkDto } from '../links/dto/create-link.dto';
import { UpdateLinkDto } from '../links/dto/update-link.dto';
import { LinksService } from '../links/links.service';
import { UpdateProfileDto } from '../profiles/dto/update-profile.dto';
import { ProfilesService } from '../profiles/profiles.service';

// A capable-enough model for structured editing decisions — this is the
// flagship "talk to your page" feature, worth spending a bit more than the
// classification-grade Haiku call in theme-ai.service.ts.
const MODEL = 'claude-sonnet-5';

const LINK_TYPES = Object.values(LinkType);

export type AiOperation =
  | {
      op: 'create_block';
      type: LinkType;
      title: string;
      url?: string;
      icon?: string;
      metadata?: Record<string, unknown>;
      order?: number;
    }
  | { op: 'update_block'; linkId: string; patch: Record<string, unknown> }
  | { op: 'delete_block'; linkId: string }
  | { op: 'reorder_blocks'; order: string[] }
  | { op: 'update_profile'; patch: Record<string, unknown> };

export interface AiPlan {
  summary: string;
  operations: AiOperation[];
}

/**
 * "Editor conversacional": el dueño de la página describe en lenguaje
 * natural qué quiere cambiar ("agregá una sección de testimonios abajo
 * del hero", "hacé la bio más corta") y esto lo traduce a una lista de
 * operaciones sobre el mismo modelo que ya usan LinksController/
 * ProfilesController — nunca inventa un camino de escritura nuevo, solo
 * decide QUÉ llamar de lo que ya existe (create/update/delete/reorder de
 * Link, update de Profile).
 *
 * A diferencia de ThemeAiService, acá no hay fallback determinístico: no
 * existe una forma sensata de "adivinar" edición de página libre sin un
 * modelo de lenguaje, así que sin ANTHROPIC_API_KEY esto directamente no
 * está disponible (503, con un mensaje claro) en vez de fingir que sí.
 *
 * `plan()` NUNCA escribe nada — solo devuelve la propuesta para que el
 * usuario la confirme (mismo patrón de "proponer, no ejecutar" que
 * restaurar una versión guardada). `apply()` es la única que muta datos,
 * y es la que de verdad importa que sea segura: cada operación se valida
 * con las mismas clases (CreateLinkDto/UpdateLinkDto/UpdateProfileDto) y
 * el mismo pipeline (class-validator con whitelist+forbidNonWhitelisted)
 * que corre normalmente en el ValidationPipe global — la salida del
 * modelo nunca llega a Prisma sin pasar por ahí, así que un campo
 * inventado o mal tipado por el LLM se rechaza exactamente igual que si
 * lo hubiera mandado un cliente HTTP cualquiera. `update_profile` además
 * restringe qué campos puede tocar el LLM: solo contenido
 * (displayName/bio/seoTitle/seoDescription), nunca username, contraseña
 * de página, dominio personalizado ni el estado de publicación.
 */
@Injectable()
export class AiEditorService {
  private readonly client: Anthropic | null;

  private static readonly EDITABLE_PROFILE_FIELDS = [
    'displayName',
    'bio',
    'seoTitle',
    'seoDescription',
  ] as const;

  constructor(
    private readonly linksService: LinksService,
    private readonly profilesService: ProfilesService,
    config: ConfigService<AppConfig, true>,
  ) {
    const apiKey = config.get('ai.anthropicApiKey', { infer: true });
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async plan(userId: string, instruction: string): Promise<AiPlan> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'El editor conversacional necesita ANTHROPIC_API_KEY configurada en el servidor.',
      );
    }

    const [profile, links] = await Promise.all([
      this.profilesService.getByUserId(userId),
      this.linksService.list(userId),
    ]);

    const pageState = {
      profile: {
        displayName: profile.displayName,
        bio: profile.bio,
        seoTitle: profile.seoTitle,
        seoDescription: profile.seoDescription,
      },
      blocks: links.map((link) => ({
        id: link.id,
        type: link.type,
        title: link.title,
        url: link.url,
        icon: link.icon,
        metadata: link.metadata,
        isActive: link.isActive,
        order: link.order,
      })),
    };

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system:
        'Eres el asistente de edición de una página de bio-link (estilo Linktree). ' +
        'El usuario te describe en español qué quiere cambiar en SU PROPIA página y vos ' +
        'traducís eso a una lista de operaciones concretas usando la herramienta propose_changes. ' +
        'Nunca inventes bloques que el usuario no pidió. Si el usuario pide agregar algo ' +
        'que ya existe, actualizalo en vez de duplicarlo. Los bloques nuevos van al final ' +
        'del orden salvo que el usuario pida una posición específica (usá "order" con un ' +
        'número menor al del primer bloque para ponerlo primero). "summary" debe ser una ' +
        'frase corta en español, dirigida al usuario, describiendo qué vas a cambiar.',
      messages: [
        {
          role: 'user',
          content: `Estado actual de la página (JSON): ${JSON.stringify(pageState)}\n\nInstrucción: "${instruction}"`,
        },
      ],
      tools: [
        {
          name: 'propose_changes',
          description:
            'Propone una lista de cambios concretos para la página del usuario.',
          input_schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description:
                  'Resumen breve en español de los cambios propuestos, para mostrarle al usuario.',
              },
              operations: {
                type: 'array',
                maxItems: 20,
                items: {
                  type: 'object',
                  properties: {
                    op: {
                      type: 'string',
                      enum: [
                        'create_block',
                        'update_block',
                        'delete_block',
                        'reorder_blocks',
                        'update_profile',
                      ],
                    },
                    type: {
                      type: 'string',
                      enum: LINK_TYPES,
                      description: 'Solo para create_block.',
                    },
                    title: {
                      type: 'string',
                      description: 'Solo para create_block.',
                    },
                    url: {
                      type: 'string',
                      description: 'Solo para create_block.',
                    },
                    icon: {
                      type: 'string',
                      description: 'Solo para create_block.',
                    },
                    metadata: {
                      type: 'object',
                      description:
                        'Solo para create_block — configuración específica del tipo de bloque.',
                    },
                    order: {
                      type: 'number',
                      description:
                        'Solo para create_block — posición opcional.',
                    },
                    linkId: {
                      type: 'string',
                      description:
                        'Para update_block / delete_block — el id del bloque existente.',
                    },
                    patch: {
                      type: 'object',
                      description:
                        'Para update_block — solo los campos a cambiar (title/url/icon/metadata/isActive/styleOverrides).',
                    },
                    orderedIds: {
                      type: 'array',
                      items: { type: 'string' },
                      description:
                        'Solo para reorder_blocks — los ids existentes en el nuevo orden deseado.',
                    },
                    profilePatch: {
                      type: 'object',
                      description:
                        'Para update_profile — solo displayName/bio/seoTitle/seoDescription.',
                    },
                  },
                  required: ['op'],
                },
              },
            },
            required: ['summary', 'operations'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'propose_changes' },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );
    if (!toolUse) {
      throw new BadRequestException(
        'No se pudo generar una propuesta de cambios — probá reformular el pedido.',
      );
    }

    const raw = toolUse.input as { summary?: unknown; operations?: unknown };
    if (typeof raw.summary !== 'string' || !Array.isArray(raw.operations)) {
      throw new BadRequestException(
        'La propuesta generada no tiene el formato esperado.',
      );
    }

    const existingIds = links.map((link) => link.id);
    const operations = await this.parseAndValidateOperations(
      raw.operations,
      existingIds,
    );
    return { summary: raw.summary, operations };
  }

  async apply(userId: string, rawOperations: Record<string, unknown>[]) {
    const links = await this.linksService.list(userId);
    const existingIds = links.map((link) => link.id);
    const operations = await this.parseAndValidateOperations(
      rawOperations,
      existingIds,
    );

    for (const operation of operations) {
      switch (operation.op) {
        case 'create_block': {
          const dto: CreateLinkDto = {
            type: operation.type,
            title: operation.title,
            url: operation.url,
            icon: operation.icon,
            metadata: operation.metadata,
            order: operation.order,
          };
          await this.linksService.create(userId, dto);
          break;
        }
        case 'update_block': {
          await this.linksService.update(
            userId,
            operation.linkId,
            operation.patch,
          );
          break;
        }
        case 'delete_block': {
          await this.linksService.remove(userId, operation.linkId);
          break;
        }
        case 'reorder_blocks': {
          const items = operation.order.map((id, index) => ({
            id,
            order: (index + 1) * 10,
          }));
          await this.linksService.reorder(userId, { items });
          break;
        }
        case 'update_profile': {
          await this.profilesService.update(userId, operation.patch);
          break;
        }
      }
    }

    return {
      links: await this.linksService.list(userId),
      profile: await this.profilesService.getByUserId(userId),
    };
  }

  /**
   * The one place that decides whether something the model (or a client
   * replaying a previously-planned batch) sent is safe to execute. Every
   * field that ends up touching Prisma passes through the exact DTO class
   * the equivalent human-driven endpoint uses, run through class-validator
   * with the same whitelist/forbidNonWhitelisted options the global
   * ValidationPipe uses — a wrongly-typed field is rejected here exactly
   * like it would be from any other client. For `create_block`, whose
   * fields live in the flat schema shared by all 5 op kinds, an
   * unrecognized *name* is silently ignored (only known field names are
   * ever read off the raw entry — see below) rather than rejected; for
   * `update_block`'s `patch` and `update_profile`'s `profilePatch`, which
   * are the model's own dedicated nested objects, an unrecognized name
   * genuinely is rejected via forbidNonWhitelisted, since there's no
   * other op's fields it could be confused with.
   */
  private async parseAndValidateOperations(
    raw: unknown[],
    existingIds: string[],
  ): Promise<AiOperation[]> {
    const existingIdSet = new Set(existingIds);
    const operations: AiOperation[] = [];

    for (const item of raw) {
      if (typeof item !== 'object' || item === null) {
        throw new BadRequestException(
          'Una operación propuesta no es un objeto válido.',
        );
      }
      const entry = item as Record<string, unknown>;

      switch (entry.op) {
        case 'create_block': {
          const dto = await this.validateAgainst(CreateLinkDto, {
            type: entry.type,
            title: entry.title,
            url: entry.url,
            icon: entry.icon,
            metadata: entry.metadata,
            order: entry.order,
          });
          operations.push({
            op: 'create_block',
            type: dto.type ?? 'LINK',
            title: dto.title,
            url: dto.url,
            icon: dto.icon,
            metadata: dto.metadata,
            order: dto.order,
          });
          break;
        }
        case 'update_block': {
          if (
            typeof entry.linkId !== 'string' ||
            !existingIdSet.has(entry.linkId)
          ) {
            throw new BadRequestException(
              'update_block hace referencia a un bloque que no existe en tu página.',
            );
          }
          const dto = await this.validateAgainst(
            UpdateLinkDto,
            entry.patch ?? {},
          );
          operations.push({
            op: 'update_block',
            linkId: entry.linkId,
            patch: dto as Record<string, unknown>,
          });
          break;
        }
        case 'delete_block': {
          if (
            typeof entry.linkId !== 'string' ||
            !existingIdSet.has(entry.linkId)
          ) {
            throw new BadRequestException(
              'delete_block hace referencia a un bloque que no existe en tu página.',
            );
          }
          operations.push({ op: 'delete_block', linkId: entry.linkId });
          break;
        }
        case 'reorder_blocks': {
          const order = entry.orderedIds ?? entry.order;
          if (
            !Array.isArray(order) ||
            order.some((id) => typeof id !== 'string' || !existingIdSet.has(id))
          ) {
            throw new BadRequestException(
              'reorder_blocks incluye ids que no pertenecen a tu página.',
            );
          }
          operations.push({ op: 'reorder_blocks', order: order as string[] });
          break;
        }
        case 'update_profile': {
          const patch = (entry.profilePatch ?? entry.patch ?? {}) as Record<
            string,
            unknown
          >;
          const scoped = Object.fromEntries(
            Object.entries(patch).filter(([key]) =>
              (
                AiEditorService.EDITABLE_PROFILE_FIELDS as readonly string[]
              ).includes(key),
            ),
          );
          const dto = await this.validateAgainst(UpdateProfileDto, scoped);
          operations.push({
            op: 'update_profile',
            patch: dto as Record<string, unknown>,
          });
          break;
        }
        default:
          throw new BadRequestException(
            `Operación desconocida: "${String(entry.op)}".`,
          );
      }
    }

    return operations;
  }

  private async validateAgainst<T extends object>(
    DtoClass: new () => T,
    payload: unknown,
  ): Promise<T> {
    const instance = plainToInstance(DtoClass, payload, {
      excludeExtraneousValues: false,
    });
    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      throw new BadRequestException(
        messages.length > 0
          ? messages
          : 'Datos inválidos en la operación propuesta.',
      );
    }
    return instance;
  }
}
