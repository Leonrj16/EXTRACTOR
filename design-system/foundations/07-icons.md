# Iconografía

## Librería

[Lucide React](https://lucide.dev) (`lucide-react`) — una única librería
de íconos en toda la aplicación. No mezclar con otro set (Heroicons,
Feather, SVGs custom) salvo para el logotipo de marca (`LogoMark`, que es
una forma geométrica propia, no un ícono de librería).

## Escala de tamaños

Los componentes que envuelven íconos (`Button`, `Badge`) fuerzan por
defecto `size-4` a cualquier `<svg>` hijo que no traiga ya una clase
`size-*` explícita (`[&_svg:not([class*='size-'])]:size-4`). Fuera de
esos wrappers, estos son los pasos reales en uso:

| Clase | Tamaño | Contexto |
|---|---|---|
| `size-3` | 12px | Íconos dentro de `Badge` (forzado por `[&>svg]:size-3!`) |
| `size-3.5` | 14px | Íconos inline junto a texto pequeño (ubicación/email/whatsapp en la página pública, botón "Ver página") |
| `size-4` | 16px | Default de `Button`/ítems de menú/inputs (buscador, chevron de select) |
| `size-4.5` | 18px | Íconos de navegación del sidebar, stat cards, header (bell, hamburger) |
| `size-5` | 20px | Íconos dentro de tiles de acceso rápido (dashboard) |
| `size-6` / `size-7` | 24–28px | Íconos decorativos grandes (estado vacío, avatar sin foto) |

**Regla**: nunca un tamaño de ícono fuera de esta escala (nada de `h-[17px]
w-[17px]`). Si un ícono se ve "casi bien" en `size-4` pero pide un poco
más, el siguiente paso es `size-4.5`, no un valor intermedio arbitrario.

## Grosor de trazo

Se usa el `strokeWidth` por defecto de Lucide (2) en toda la app — no se
sobrescribe por componente. Un ícono con trazo más fino o más grueso que
sus vecinos es una inconsistencia visual inmediata.

## Color

Los íconos heredan color de texto (`currentColor`) salvo que sean
acentos semánticos (ver `foundations/01-colors.md`):

- Ícono neutro/informativo → `text-muted-foreground`
- Ícono en estado activo/seleccionado → `text-foreground` o
  `text-white` (sobre gradiente de marca)
- Ícono de acento en un tile o stat card → color de marca al 100% sobre
  un fondo del mismo color al 15–20% (`bg-brand-purple/15
  text-brand-purple-light`), nunca el ícono a color pleno sobre fondo
  transparente.
- Ícono destructivo (eliminar) → `text-destructive`, con su fondo de
  hover en `bg-destructive/10`.

## Envoltorio interactivo (icon button)

Todo botón que es solo un ícono (sin texto) comparte esta receta —
extraída como constante `ICON_BUTTON` en `sortable-link-row.tsx` y
replicada con las mismas clases en `header.tsx` y `sidebar.tsx`:

```
flex size-9|size-10 shrink-0 items-center justify-center rounded-lg|rounded-xl
text-muted-foreground outline-none transition-colors
hover:bg-surface-5|surface-6 hover:text-foreground
focus-visible:ring-2 focus-visible:ring-ring/40
```

Todo icon-button nuevo debe partir de esta receta (o del tamaño `icon`/
`icon-sm`/`icon-lg` de `Button`, ver `components/buttons.md`) — nunca un
`<button>` sin `focus-visible` ni `aria-label`.
