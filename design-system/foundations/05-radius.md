# Border Radius

Toda la escala de radios se deriva de **una sola variable base**,
`--radius: 1rem`, definida en `tokens.css`. Cambiar ese único valor
reescala el redondeo de toda la aplicación de forma proporcional — por
eso ningún componente debe usar un `rounded-[Npx]` arbitrario fuera de
esta escala.

## Escala (derivada de `--radius`)

| Token | Fórmula | Valor resultante | Uso típico |
|---|---|---|---|
| `rounded-sm` | `--radius * 0.6` | 9.6px | Radios internos pequeños |
| `rounded-md` | `--radius * 0.8` | 12.8px | Botones `sm`/`xs` (vía `min(var(--radius-md), Npx)`) |
| `rounded-lg` | `--radius` | 16px | Ítems de menú, filas de lista, íconos de sidebar |
| `rounded-xl` | `--radius * 1.4` | 22.4px | **El radio por defecto de casi todo**: Input, Textarea, Button, Badge base, filas de enlace, header |
| `rounded-2xl` | `--radius * 1.8` | 28.8px | Card, Dialog, contenedores grandes ("glass") |
| `rounded-3xl` | `--radius * 2.2` | 35.2px | Sidebar |
| `rounded-4xl` | `--radius * 2.6` | 41.6px | Reservado para superficies aún más grandes |
| `rounded-full` | — | 9999px | Avatares, dots, pill de navegación activo, `Switch`, `Badge` |

## Radio dinámico de la página pública (por tema)

La página pública permite al usuario elegir un estilo de botón
(`rounded` / `pill` / `square`) desde el editor de apariencia. Esto se
resuelve con **dos** mapas distintos en `profile-view.tsx` — a propósito,
no por descuido:

```ts
// Botones cortos (link, texto centrado): "pill" = rounded-full es correcto
const BUTTON_RADIUS = { rounded: "rounded-xl", pill: "rounded-full", square: "rounded-none" };

// Bloques altos (formulario, producto, video/música): "pill" se limita a
// rounded-2xl — rounded-full en un contenedor alto lo deforma en un óvalo/
// círculo visible.
const CARD_RADIUS = { rounded: "rounded-xl", pill: "rounded-2xl", square: "rounded-none" };
```

**Regla**: si un elemento puede tener una altura mayor a su ancho (un
formulario, una tarjeta de producto, un embed de video), su radio viene de
`CARD_RADIUS`, nunca de `BUTTON_RADIUS` — sin importar qué tan "botón" se
sienta visualmente. Este fue un bug real (círculo/óvalo superpuesto en la
tarjeta de "Contáctame") que esta separación existe para prevenir que
vuelva a ocurrir.

## Reglas de uso

1. Nunca `rounded-[10px]` o similar arbitrario — usa el paso de la escala
   más cercano (`rounded-md`/`rounded-lg`).
2. Un componente "hijo" de otro con esquinas redondeadas (una imagen
   dentro de una Card) usa un radio un paso menor que el contenedor para
   que el borde interior se vea concéntrico (`Card` es `rounded-2xl`; su
   primera/última imagen hija es `rounded-t-2xl`/`rounded-b-2xl`, es
   decir, el mismo radio, porque no hay padding entre la imagen y el
   borde — ver `has-[>img:first-child]:pt-0`).
3. Elementos circulares (avatares, dots, thumbs de `Switch`) siempre
   `rounded-full`, nunca un radio grande fijo en px.
