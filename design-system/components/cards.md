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
backdrop-blur-xl transition-all duration-300
hover:ring-border-strong
```

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
