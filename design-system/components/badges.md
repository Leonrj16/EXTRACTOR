# Badges

Componente: `apps/web/src/components/ui/badge.tsx`. `inline-flex h-6
rounded-full px-2.5` — siempre pill, nunca esquinas cuadradas ni un tamaño
de altura distinto entre badges de la misma pantalla.

## Variantes

| Variante | Receta | Uso |
|---|---|---|
| `default` | `bg-primary text-primary-foreground` | Poco usado directamente — casi siempre una de las siguientes |
| `secondary` | `border-border bg-surface-5` | Metadatos neutros: tipo de enlace (`LINK_TYPE_LABELS`) |
| `outline` | `border-border` sin fondo | Cuando el badge va sobre un fondo ya translúcido y no debe sumar otra capa |
| `success` | `bg-brand-success/15 text-brand-success` | Estado positivo |
| `warning` | `bg-brand-warning/15 text-brand-warning` | "Sin publicar" |
| `destructive` | `bg-destructive/10 text-destructive` | Estado de error/eliminación |
| `ghost` | Transparente | Badge de bajo énfasis dentro de otro componente ya recuadrado |
| `link` | Solo texto | Badge que actúa como enlace |

## Patrón de color semántico

`success`/`warning`/`destructive` siguen todos la misma fórmula: **texto a
color pleno de marca + fondo del mismo color al 10–15% de opacidad**
(`bg-brand-x/15 text-brand-x`) — nunca texto blanco sobre fondo sólido de
color, y nunca un verde/ámbar/rojo que no sea uno de los tres tokens
`brand-success`/`brand-warning`/`brand-error` (ver
`foundations/01-colors.md`).

## Uso

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="secondary">{LINK_TYPE_LABELS[link.type]}</Badge>
<Badge variant="warning">Sin publicar</Badge>
```

## Reglas de uso

1. Un badge nunca lleva `text-xs` explícito — el tamaño de texto (`text-xs`)
   ya viene incluido en `badgeVariants`.
2. Si un badge necesita ocultarse en pantallas pequeñas por falta de
   espacio (ver `sortable-link-row.tsx`), se oculta completo
   (`hidden sm:inline-flex`) — nunca se trunca su texto ni se reduce su
   padding por debajo de la receta base.
