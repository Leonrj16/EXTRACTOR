# Cards

Componente: `apps/web/src/components/ui/card.tsx`. Un único componente
compuesto (`Card`, `CardHeader`, `CardTitle`, `CardDescription`,
`CardAction`, `CardContent`, `CardFooter`) — no existen "cards" custom
hechas con un `<div>` suelto en las pantallas de analítica; sí existen
superficies "glass" ad hoc (dashboard, sidebar) que son variantes visuales
del mismo lenguaje, documentadas más abajo.

## Anatomía

```tsx
<Card>
  <CardHeader className="flex-row items-center justify-between">
    <CardTitle>Visitas</CardTitle>
    <CardAction>...</CardAction>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

## Receta visual

```
rounded-2xl bg-card ring-1 ring-border shadow-(--shadow-surface)
backdrop-blur-xl transition-[ring,box-shadow,background-color,border-color] duration-300
hover:ring-border-strong
whileHover={{ y: -3 }}  // Framer Motion, spring — ver nota abajo
```

`Card` es `"use client"` porque envuelve `motion.div` para la elevación de
hover (`whileHover={{ y: -3 }}`, spring `stiffness:400 damping:32`) — esto
se aplica **una vez, aquí**, y todo lo que use `Card` en cualquier parte
de la app (Analytics, Benefits, Testimonials en la landing) lo hereda
gratis, sin que cada pantalla implemente su propio hover. La transición
CSS deliberadamente excluye `transform` (`transition-[ring,box-shadow,...]`
en vez de `transition-all`) para no competir con la animación de Framer
Motion sobre la misma propiedad — ver
`foundations/08-animations.md`.

Como `Card` ahora es un Client Component, cualquier Server Component que
lo importe (una página de servidor que solo necesita el layout) sigue
funcionando igual — Next.js permite que un Server Component renderice un
Client Component como hijo sin problema; lo que rompería es que un Server
Component intente usar una función *pura* exportada del mismo archivo que
un componente cliente (ver el caso de `buttonVariants` en
`components/buttons.md`).

- `bg-card` = `surface-3` (0.045) — el mismo valor que `.glass`.
- La sombra es `--shadow-surface` — la misma receta que `.glass`, ver
  `foundations/06-shadows-elevation.md`. `Card` y `.glass` son la misma
  elevación expresada de dos formas (componente vs. utilidad), nunca dos
  recetas distintas.
- El espaciado interno usa la variable `--card-spacing` (ver
  `foundations/03-spacing.md`), no clases de padding repetidas en cada
  sub-componente.

## Tamaños

| `size` | `--card-spacing` | Uso |
|---|---|---|
| `default` | 24px (`--spacing(6)`) | Card de contenido normal |
| `sm` | 16px (`--spacing(4)`) | Card dentro de un grid denso |

## Variante ".glass" (superficies que no son `Card`)

Sidebar, header, stat cards del dashboard y contenedores del editor de
diseño usan la clase utilitaria `.glass` en vez del componente `Card`
porque necesitan controlar su propio `border-radius` (`rounded-3xl` en el
sidebar, `rounded-2xl` en el resto) o no son semánticamente una "tarjeta
de contenido". `.glass` comparte exactamente el mismo fondo (`surface-3`)
y sombra (`--shadow-surface`) que `Card` — ver
`foundations/06-shadows-elevation.md`. Regla: si el contenido es una
unidad de "datos con título" (una métrica, un formulario, un bloque de
analítica), usa `Card`; si es un contenedor de layout estructural
(sidebar, header, wrapper del editor), usa `.glass` directamente.

## Reglas de uso

1. Nunca dupliques la sombra de `Card` a mano en otro componente — si
   necesitas la misma elevación, usa `.glass` o
   `shadow-(--shadow-surface)` directamente.
2. `CardFooter` trae su propio `border-t bg-muted/50` — no lo repitas
   manualmente en el último hijo de `CardContent`.
3. Una imagen como primer/último hijo directo de `Card` hereda el radio
   correcto automáticamente (`*:[img:first-child]:rounded-t-2xl`) — no
   agregues `rounded-t-2xl` a la imagen misma.
