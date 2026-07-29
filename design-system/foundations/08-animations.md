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
| Entrada escalonada | `initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay: i*0.05, ease: [0.16,1,0.3,1]}}` | Stat cards, bloques de la página pública |
| Pill de nav activo | `layoutId="sidebar-active-pill"` con `transition={{type:"spring", stiffness:400, damping:32}}` | Sidebar — el fondo violeta se desliza entre ítems en vez de aparecer/desaparecer |
| Contador animado | `useMotionValue` + `useSpring({damping:24, stiffness:90})`, dispara con `useInView({once:true})` | `AnimatedCounter` (stat cards) |
| Hover/tap de bloque | `whileHover={{scale:1.02}}` / `whileTap={{scale:0.98}}` | Enlaces de la página pública (deshabilitado en bloques interactivos: video/música/formulario vía `isInteractiveBlock`) |
| Drawer móvil | `AnimatePresence` + overlay con fade | Sidebar en viewport `< lg` |
| Apertura de overlay | `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95` / `data-closed:animate-out ...zoom-out-95`, `duration-150` | `Dialog`, `DropdownMenu` |
| Fondo aurora | `@keyframes aurora-drift-1/2/3`, 22–30s `ease-in-out infinite`, transform-only (translate + scale) | Fondo de la página pública cuando el tema tiene `aurora: true` |
| Variantes de entrada por tema | `fade` / `slide` / `bounce` / `none` (objeto `ANIMATION_VARIANTS` en `profile-view.tsx`) | Configurable por el usuario en el editor de apariencia |

## Reglas de uso

1. **Nunca animar propiedades costosas de layout** (`width`, `top`,
   `left`, `margin`). Todo lo anterior anima `opacity`, `transform`
   (`scale`, `translate`) o usa `layoutId` — así el hilo principal nunca
   hace reflow.
2. **Toda animación de estado (hover/focus/active) usa CSS
   `transition-colors`/`transition-all` con duración `--duration-base`
   (200ms)** — no Framer Motion. Framer Motion es solo para animaciones
   de *entrada*, *layout compartido* o *física* (spring, contador).
3. **`prefers-reduced-motion`**: los keyframes de aurora y los springs de
   Framer Motion respetan la preferencia del sistema por defecto del
   navegador/Framer — no se fuerza `!important` sobre esa preferencia.
4. Las animaciones de apertura de overlay (`Dialog`, `DropdownMenu`)
   comparten exactamente la misma duración (150ms) y curva
   (`zoom-in-95`/`fade-in-0`) — un overlay nuevo reutiliza esas clases via
   los componentes `ui/dialog.tsx` / `ui/dropdown-menu.tsx`, nunca define
   sus propias clases `animate-in`.
