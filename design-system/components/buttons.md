# Botones

Componente: `apps/web/src/components/ui/button.tsx` (`Button`). Construido
sobre `@base-ui/react/button` + `class-variance-authority` (`cva`) — toda
variante/tamaño vive en un único archivo, nunca se reimplementa un botón a
mano en una pantalla.

`buttonVariants` (la función de clases, sin JSX) vive en un archivo
hermano separado, `ui/button-variants.ts`, **sin** `"use client"` — ver
`foundations/08-animations.md` para por qué (un Server Component que solo
necesita la className de un `<Link>` rompe si la importa desde un módulo
marcado cliente).

## Variantes

| Variante | Fondo | Uso |
|---|---|---|
| `default` | `bg-gradient-aura` + `shadow-(--shadow-button)` | Acción primaria de la pantalla (Guardar, Nuevo enlace) — una por vista |
| `outline` | `bg-surface-2` + `border-border`, hover `bg-surface-6`/`border-border-hover` | Acción secundaria (Cancelar, Ver página) |
| `secondary` | `bg-secondary` + `ring-border-subtle` | Alternativa neutra cuando `outline` no tiene suficiente contraste sobre el fondo |
| `ghost` | Transparente, hover `bg-surface-5` | Acciones terciarias / dentro de toolbars |
| `destructive` | `bg-destructive/10` texto `text-destructive` | Eliminar, acciones irreversibles |
| `link` | Solo texto, `text-brand-purple-light` | Navegación inline dentro de un párrafo |

## Tamaños

| Tamaño | Altura | Padding horizontal | Uso |
|---|---|---|---|
| `xs` | `h-6` | `px-2` | Controles muy compactos (raramente usado) |
| `sm` | `h-9` | `px-3.5` | Botones dentro de cards/filas (Guardar, Copiar enlace) |
| `default` | `h-10` | `px-4` | Botón estándar de formulario/página |
| `lg` | `h-12` | `px-6` | CTA de alto énfasis (raramente usado en el admin) |
| `icon` / `icon-sm` / `icon-lg` | `size-10` / `size-9` / `size-12` | — | Botón que es solo un ícono — ver `foundations/07-icons.md` |

## Estados

Ver `foundations/09-states.md`. En resumen: `hover:brightness-110` +
sombra más intensa (`default`), `active:scale-[0.97]` (feedback táctil de
"presionado" en todas las variantes salvo cuando el botón controla un
popup — `active:not-aria-[haspopup]:scale-[0.97]`), `focus-visible:ring-3
ring-ring/40`, `disabled:opacity-50 disabled:pointer-events-none`. El
press-feedback es CSS a propósito, no Framer Motion — ver
`foundations/08-animations.md`.

## Estado de carga

`Button` acepta una prop `loading` que deshabilita el botón y muestra un
spinner (`Loader2` animado con Framer Motion) antes del contenido —
reemplaza el patrón repetido de `disabled={saving}` + texto sin ningún
indicador visual de que algo está pasando:

```tsx
<Button onClick={handleSave} loading={saving}>
  {saving ? "Guardando…" : "Guardar"}
</Button>
```

## Uso

```tsx
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

<Button>Guardar</Button>
<Button variant="outline" size="sm">Cancelar</Button>
<Button variant="destructive" size="icon-sm" aria-label="Eliminar">
  <Trash2 />
</Button>

// Cuando el elemento visual debe ser un <Link> de Next.js, no un <button>
// — o cuando quien lo usa es un Server Component, importa buttonVariants
// desde ui/button-variants, no desde ui/button:
<Link href="/x" className={buttonVariants({ variant: "outline", size: "sm" })}>
  Ver página
</Link>
```

**Regla**: si necesitas que un botón se vea distinto a estas 6 variantes,
la pregunta correcta es "¿cuál de estas variantes es conceptualmente más
cercana?", no "qué clases le agrego encima". Una clase de color nueva
pegada sobre `variant="outline"` es exactamente el tipo de estilo
duplicado que este sistema existe para evitar.
