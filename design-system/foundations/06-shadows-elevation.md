# Sombras y Elevación

## El problema que resuelve esta escala

Antes de esta pasada, `Card` definía su `box-shadow` como un arbitrario
`shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.35)]`
escrito directamente en la clase — que resulta ser, carácter por carácter,
casi la misma receta que la utilidad `.glass` en `globals.css`. Dos
lugares, mismo valor, cero conexión entre ellos: si uno cambiaba, el otro
quedaba desincronizado sin que nada lo advirtiera. Ahora ambos leen la
misma variable.

## Tokens de sombra (`tokens.css`)

| Token | Receta | Rol |
|---|---|---|
| `--shadow-surface` | `inset 0 1px 0 rgba(255,255,255,.06), 0 8px 32px rgba(0,0,0,.35)` | Elevación base de superficie "glass": `Card`, `.glass` (sidebar, header, stat cards) |
| `--shadow-surface-strong` | `inset 0 1px 0 rgba(255,255,255,.07), 0 16px 48px rgba(0,0,0,.5)` | Elevación de overlay flotante: `.glass-strong` (`Dialog`, `DropdownMenu`) — sombra más difusa y oscura porque flota *sobre* el resto de la UI, no al mismo nivel |
| `--shadow-glow-purple` | `0 0 0 1px rgba(124,58,237,.4), 0 0 32px rgba(124,58,237,.35)` | Halo de marca a máxima intensidad — vista previa del editor de diseño |
| `--shadow-glow-purple-sm` | `0 0 20px rgba(124,58,237,.28)` | Halo de marca sutil — logo, pill de nav activo |
| `--shadow-button` | `0 1px 0 rgba(255,255,255,.2) inset, 0 4px 20px rgba(124,58,237,.35)` | Botón primario en reposo |
| `--shadow-button-hover` | `0 1px 0 rgba(255,255,255,.25) inset, 0 6px 28px rgba(124,58,237,.5)` | Botón primario en hover — mismo patrón, mayor difusión/intensidad |

Se consumen como valor arbitrario de la utilidad `shadow`:
`shadow-(--shadow-surface)`.

## Los tres niveles de elevación

Aura tiene exactamente tres niveles de elevación — no más. Añadir un
cuarto nivel intermedio sin una razón de interacción concreta es la forma
más común en que un design system pierde consistencia.

| Nivel | Sombra | Blur de fondo | Ejemplos |
|---|---|---|---|
| **0 — Plano** | ninguna | — | Fondo de página, texto, íconos sueltos |
| **1 — Superficie** | `--shadow-surface` | `blur(20px)` | Card, sidebar, header, stat cards — el contenido "vive" sobre el fondo |
| **2 — Flotante** | `--shadow-surface-strong` | `blur(24px)` | Dialog, DropdownMenu — se superpone *sobre* el nivel 1 |

El halo de marca (`glow-purple*`) no es un nivel de elevación: es un
acento que se añade *encima* de un nivel 1 o 2 para marcar estado activo
(pill de navegación) o foco visual (vista previa en vivo), nunca
reemplaza la sombra de elevación.

## Reglas de uso

1. Ningún componente nuevo escribe un `box-shadow` o clase `shadow-[...]`
   literal — usa uno de los tokens de arriba.
2. Si un patrón de sombra se repite en un tercer componente, es señal de
   que debería ser una utilidad reutilizable (como `.glass`), no una clase
   `shadow-(--shadow-x)` copiada tres veces.
3. `ring` (de Card, botones con foco) es un concepto distinto de
   `box-shadow` — ver `foundations/01-colors.md` para la escala de
   `border-*`/`ring-*`; ambos comparten los mismos tokens de color.
