# Colores

Fuente: `/design-system/tokens.css`. Todos los valores están definidos una
sola vez en el bloque `:root, .dark` y expuestos como utilidades Tailwind
vía `@theme inline`.

## Aura es una app oscura, no "oscura por defecto"

`:root` y `.dark` comparten exactamente los mismos valores — no hay tema
claro. Antes existían como dos bloques idénticos copiados; ahora es un
único bloque `:root, .dark { ... }`, porque mantener dos copias de los
mismos 25 valores era, literalmente, el estilo repetido que este sistema
existe para eliminar. Si algún día se agrega un tema claro real, ese es el
momento de separarlos — no antes.

## Colores base (slots semánticos)

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#07080c` | Fondo raíz de toda la app |
| `--foreground` | `#f4f5fb` | Texto principal |
| `--card` | `rgba(255,255,255,0.045)` | Fondo de `Card` (= `surface-3`) |
| `--popover` | `#12131c` | Fondo sólido de popovers nativos |
| `--primary` | `#7c3aed` | Acento principal (violeta Aura) |
| `--primary-foreground` | `#ffffff` | Texto sobre `--primary` |
| `--secondary` | `#171826` | Fondo de botón secundario |
| `--secondary-foreground` | `#eceefb` | Texto sobre `--secondary` |
| `--muted` | `#13141d` | Fondos apagados |
| `--muted-foreground` | `#8d90a8` | Texto secundario / labels |
| `--accent` | `#1b1d2c` | Resaltado neutro |
| `--destructive` | `#fb3b5a` | Acciones destructivas (= `brand-error`) |
| `--border` | `rgba(255,255,255,0.09)` | Borde por defecto de todo componente |
| `--input` | `rgba(255,255,255,0.07)` | Reservado para integraciones shadcn (inputs usan `surface-2`/`surface-4`, ver `components/inputs.md`) |
| `--ring` | `#7c3aed` | Anillo de foco |

## Paleta de marca

Utilidades: `bg-brand-purple`, `text-brand-cyan`, `from-brand-blue`, etc.

| Token | Hex | Rol |
|---|---|---|
| `--color-brand-purple` | `#7c3aed` | Primario de marca / gradiente Aura |
| `--color-brand-purple-light` | `#a78bfa` | Texto/ícono sobre fondo violeta translúcido |
| `--color-brand-blue` | `#3b82f6` | Secundario de marca |
| `--color-brand-blue-light` | `#60a5fa` | Variante clara de azul |
| `--color-brand-cyan` | `#22d3ee` | Acento frío (analítica, CTR) |
| `--color-brand-success` | `#34d399` | Estados de éxito |
| `--color-brand-warning` | `#fb923c` | Estados de advertencia ("Sin publicar") |
| `--color-brand-error` | `#fb3b5a` | Estados de error (= `--destructive`) |

El gradiente de marca (`bg-gradient-aura`, `text-gradient-aura`,
`border-gradient-aura`) es un `linear-gradient(135deg, #7c3aed 0%, #4f46e5
50%, #0ea5e9 100%)` — se usa para el logo, el botón primario, el avatar
placeholder y el pill de navegación activo. Es la única expresión
multicolor de la marca; el resto de la UI es monocromática con acentos de
un solo color.

## Escala de superficies (`surface-1` … `surface-6`)

La opacidad de fondo de cualquier elemento translúcido ("glass") viene de
esta escala — nunca de un `bg-white/[0.0X]` escrito a mano.

| Token | Opacidad | Rol | Dónde se usa |
|---|---|---|---|
| `surface-1` | 0.02 | Fondo de fila / tira | Pie de `Dialog`, filas de "Top links" |
| `surface-2` | 0.03 | Fill en reposo | `Input`, `Textarea`, `NativeSelect`, botón `outline` |
| `surface-3` | 0.045 | Fill de tarjeta/glass | `Card`, `.glass`, hover de tab inactivo |
| `surface-4` | 0.05 | Fill en foco | `Input`/`Textarea`/`Select` al enfocar |
| `surface-5` | 0.06 | Fill en hover | Ítem de sidebar, ícono del header, `Badge` secundario |
| `surface-6` | 0.07 | Fill activo/presionado | Ítem de dropdown en foco, botón `ghost`/`outline` en hover, tab activo del editor |
| `surface-strong` | sólido `rgba(12,13,20,0.82)` | Popovers/diálogos | `.glass-strong` (Dialog, DropdownMenu) |

## Escala de bordes

| Token | Opacidad | Rol |
|---|---|---|
| `border-subtle` | 0.07 | Divisores tenues, filas con outline |
| `border` (`--border`) | 0.09 | Borde por defecto de cualquier componente |
| `border-strong` | 0.14 | Borde en hover / énfasis (Card, fila de enlace) |
| `border-hover` | 0.20 | Hover fuerte (botón outline, swatch de color) |

## Reglas de uso

1. Texto principal → `text-foreground`. Texto secundario/labels →
   `text-muted-foreground`. Nunca un gris hardcodeado.
2. Un fondo translúcido nuevo siempre se elige de la escala `surface-*`
   existente antes de inventar una opacidad nueva.
3. Los colores de marca (`brand-*`) son para acentos puntuales (íconos de
   stat cards, badges de estado, glow) — no para fondos grandes de página.
4. `success` / `warning` / `error` en `Badge` usan siempre `brand-success`,
   `brand-warning`, `brand-error` — nunca verde/ámbar/rojo genéricos de
   Tailwind (`green-500`, etc.).
