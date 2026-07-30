# Aura Design System

Fuente única de verdad del sistema de diseño de **Aura**. Todo color, radio,
sombra, tipografía, espaciado y patrón de componente que aparece en la
aplicación está definido **una sola vez** aquí y se consume desde el código
— nunca se copia ni se redefine en otro archivo.

## Por qué existe esta carpeta

Antes de esta pasada, colores como `rgba(255,255,255,0.07)` o sombras como
`inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.35)` estaban
escritos a mano, repetidos con pequeñas variaciones (`0.06`, `0.07`, `0.08`,
`0.09`, `0.10`...) en más de quince archivos distintos. Cada repetición era
una oportunidad de que dos componentes que debían verse iguales terminaran
viéndose ligeramente distintos. `/design-system` elimina esa clase de bug:
hay una escala con nombre para cada valor, y los componentes la consumen
por nombre (`bg-surface-2`, `border-border-subtle`, `shadow-(--shadow-surface)`)
en lugar de por número mágico.

## Cómo está organizado

```
/design-system
├── tokens.css                     ← fuente única de tokens (colores, radios,
│                                     superficies, bordes, sombras, motion)
├── foundations/                   ← fundamentos visuales, uno por tema
│   ├── 01-colors.md
│   ├── 02-typography.md
│   ├── 03-spacing.md
│   ├── 04-grid.md
│   ├── 05-radius.md
│   ├── 06-shadows-elevation.md
│   ├── 07-icons.md
│   ├── 08-animations.md
│   └── 09-states.md
├── components/                     ← patrones de componente, con ejemplos
│   ├── buttons.md
│   ├── inputs.md
│   ├── cards.md
│   ├── badges.md
│   ├── modals.md
│   ├── dropdowns.md
│   ├── sidebar.md
│   ├── navbar.md
│   ├── tables.md
│   └── accordion.md
└── architecture/                  ← decisiones de arquitectura de features
    ├── blocks.md                  ← Page Builder: contrato de bloque, registro
    │                                 central, cómo agregar un bloque nuevo
    ├── theme-engine.md            ← Theme Engine: contrato de tema, resolución
    │                                 en cascada, cómo agregar un tema nuevo
    └── visual-editor.md           ← Editor Visual: lienzo, capas, historial,
                                      validación de publicación
```

## Cómo se conecta con el código

`tokens.css` se importa una sola vez, desde
`apps/web/src/app/globals.css`:

```css
@import "../../../../design-system/tokens.css";
```

Tailwind CSS v4 (config CSS-first) toma cada `--color-*`, `--radius-*` y
`--shadow-*` definido ahí y genera automáticamente las utilidades
correspondientes (`bg-surface-2`, `rounded-2xl`, `shadow-(--shadow-surface)`,
etc.). `globals.css` ya no vuelve a declarar esos valores: solo importa el
token y añade lo que es genuinamente específico de la app (fuentes vía
`next/font`, el layer `base` con la tipografía por defecto, y las utilidades
compuestas `.glass` / `.glass-strong` / `.glow-purple*`, que a su vez leen
sus sombras y superficies de estas mismas variables).

Los componentes de `apps/web/src/components/ui/*` (Button, Input, Card,
Badge, Dialog, DropdownMenu, Table, Switch...) consumen estas utilidades.
**Ningún componente debería tener un valor `rgba(255,255,255,0.0X)`,
`box-shadow` o radio escrito a mano.** Si necesitas un valor que no existe
todavía, se agrega aquí primero y luego se consume — nunca al revés.

## Regla de oro

> No quiero estilos repetidos.

Antes de escribir `bg-white/[0.07]`, `border-white/10` o un `box-shadow`
literal en un componente: para. Ese valor ya existe como token, o merece
convertirse en uno. Un segundo lugar con el mismo número es exactamente el
tipo de deuda que este directorio existe para prevenir.

## Principios de la marca

- **Neo Glass Premium**: superficies translúcidas con blur, bordes de un
  píxel casi invisibles y una sombra interior sutil que simula un borde de
  luz — nunca bordes sólidos duros.
- **Un solo tema**: Aura es una aplicación oscura por diseño, no
  "oscura por defecto". No existe una variante clara; no dupliques tokens
  para un modo claro que no se usa (ver `foundations/01-colors.md`).
- **Jerarquía por opacidad, no por color nuevo**: la mayoría de los estados
  (resting → hover → focus → active) se expresan subiendo un escalón en la
  escala de superficie/borde, no inventando un color distinto.
- **Motion con propósito**: cada animación comunica jerarquía o
  continuidad (aparición escalonada, pill activo que se desliza, contador
  que cuenta) — nunca decorativa porque sí.
