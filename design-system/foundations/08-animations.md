# Animaciones

Dos motores conviven, cada uno con un rol fijo — no se mezclan para el
mismo efecto:

- **Framer Motion** — animaciones con estado/física (entrada
  escalonada, spring, contador, layout).
- **`tw-animate-css` + variantes `data-*` de Base UI** — transiciones de
  apertura/cierre de overlays (Dialog, DropdownMenu), porque esos
  primitivos ya exponen el estado como atributos `data-open`/`data-closed`.

## Tokens de motion (`tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| `--ease-aura` | `cubic-bezier(0.16, 1, 0.3, 1)` | Easing "salida rápida, llegada suave" — entradas de stat cards, tiles |
| `--duration-fast` | `150ms` | Overlays (Dialog/Dropdown open-close), hover de color |
| `--duration-base` | `200ms` | Transiciones de botón, ring de foco |
| `--duration-slow` | `300ms` | Entradas de contenido (fade/slide de bloques) |

## Catálogo de animaciones reales

| Patrón | Mecanismo | Dónde |
|---|---|---|
| Entrada escalonada | `initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay: i*0.05, ease: [0.16,1,0.3,1]}}` | Stat cards, ítems del sidebar, bloques de la página pública |
| Transición entre páginas | `AnimatePresence` + `motion.div` con `key={pathname}`, fade + `y:6→0`, `duration:0.2` | `PageTransition` (envuelve el contenido de `AdminShell` — cambiar de Dashboard a Enlaces, etc.) |
| Pill de nav activo | `layoutId="sidebar-active-pill"` con `transition={{type:"spring", stiffness:400, damping:32}}` | Sidebar — el fondo violeta se desliza entre ítems en vez de aparecer/desaparecer |
| Nudge de hover en nav | `whileHover={{x:3}}` | Ítems del sidebar |
| Elevación de Card | `whileHover={{y:-3}}`, `transition={{type:"spring", stiffness:400, damping:32}}` | `Card` (ui/card.tsx) — se aplica a **todo** lo que use el componente (Analytics, Benefits, Testimonials…) sin que cada consumidor lo repita |
| Contador animado | `useMotionValue` + `useSpring({damping:24, stiffness:90})`, dispara con `useInView({once:true})` | `AnimatedCounter` (stat cards) |
| Hover/tap de bloque | `whileHover={{scale:1.02}}` / `whileTap={{scale:0.98}}` | Enlaces de la página pública (deshabilitado en bloques interactivos: video/música/formulario vía `isInteractiveBlock`) |
| Spinner de carga | `motion.span` con `animate={{rotate:360}}`, `transition={{repeat:Infinity, ease:"linear", duration:0.7}}` envolviendo un ícono `Loader2` | Prop `loading` de `Button` — reemplaza el patrón repetido de `disabled={saving}` + texto sin indicador visual |
| Drawer móvil | `AnimatePresence` + overlay con fade | Sidebar en viewport `< lg` |
| Apertura de overlay | `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95` / `data-closed:animate-out ...zoom-out-95`, `duration-150` | `Dialog`, `DropdownMenu` |
| Fondo aurora | `@keyframes aurora-drift-1/2/3`, 22–30s `ease-in-out infinite`, transform-only (translate + scale) | Fondo de la página pública cuando el tema tiene `aurora: true` |
| Variantes de entrada por tema | `fade` / `slide` / `bounce` / `none` (objeto `ANIMATION_VARIANTS` en `profile-view.tsx`) | Configurable por el usuario en el editor de apariencia |

## Por qué `Button` e `Input` NO usan Framer Motion para su propia interacción

`Card` es un `<div>` plano — envolverlo en `motion.div` no tiene efectos
secundarios. `Button` e `Input`, en cambio, envuelven primitivos
polimórficos de Base UI (`@base-ui/react/button`, `@base-ui/react/input`).
Se intentó envolver `Button` con `motion.create(ButtonPrimitive)` para el
`whileTap`, y TypeScript lo rechazó: Base UI y Framer Motion declaran
ambos una prop `onAnimationStart` con firmas incompatibles, un choque
real, no cosmético. Forzarlo habría significado debilitar los tipos de un
primitivo usado en decenas de lugares por una ganancia menor. En su lugar:

- **`Button`** usa `active:scale-[0.97]` en CSS para el feedback de click
  (mismo efecto visual, cero riesgo de tipos) y reserva Framer Motion para
  el **spinner interno** (`loading`), que es un `motion.span` hijo — ahí
  no hay wrapping del primitivo, así que no hay conflicto.
- **`Input`** usa `focus-visible:scale-[1.01]` en CSS por la misma razón.
  `Textarea` no lo replica: un `scale` sobre un elemento redimensionable
  (con asa de resize) se ve raro al enfocar, así que se dejó solo con el
  anillo de foco existente.

Regla derivada: antes de envolver un primitivo polimórfico de Base UI en
`motion.create()`, prueba con `tsc --noEmit` primero. Si hay conflicto de
tipos, usa CSS (`scale`/`translate` nativos, no `transform` a mano) para
el estado de interacción y reserva Framer Motion para elementos hijos
simples (íconos, spinners) o para componentes que no envuelven un
primitivo polimórfico.

## Reglas de uso

1. **Nunca animar propiedades costosas de layout** (`width`, `top`,
   `left`, `margin`). Todo lo anterior anima `opacity`, `transform`
   (`scale`, `translate`) o usa `layoutId` — así el hilo principal nunca
   hace reflow.
2. **Toda animación de estado simple (color, borde, fondo) usa CSS
   `transition-colors`/`transition-all` con duración `--duration-base`
   (200ms).** Framer Motion se reserva para *entrada*, *layout
   compartido*, *física* (spring, contador) o hover/tap que se beneficia
   de una curva de resorte — nunca para un simple cambio de color.
3. **`prefers-reduced-motion`**: los keyframes de aurora y los springs de
   Framer Motion respetan la preferencia del sistema por defecto del
   navegador/Framer — no se fuerza `!important` sobre esa preferencia.
4. Las animaciones de apertura de overlay (`Dialog`, `DropdownMenu`)
   comparten exactamente la misma duración (150ms) y curva
   (`zoom-in-95`/`fade-in-0`) — un overlay nuevo reutiliza esas clases via
   los componentes `ui/dialog.tsx` / `ui/dropdown-menu.tsx`, nunca define
   sus propias clases `animate-in`.
5. **Cualquier archivo que importe `framer-motion` (o un componente que lo
   use, como `Card` o `Button`) necesita `"use client"`.** Si ese archivo
   exporta también lógica pura sin JSX (como `buttonVariants`), sepárala
   en su propio módulo sin la directiva — de lo contrario un Server
   Component que solo necesita el nombre de clase (`buttonVariants(...)`
   para un `<Link>`, por ejemplo) rompe en build con "Attempted to call
   X() from the server but X is on the client". Ver
   `ui/button-variants.ts` como el patrón a seguir.
