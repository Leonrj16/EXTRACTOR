# Tablas

Componente: `apps/web/src/components/ui/table.tsx` (`Table`,
`TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`,
`TableCell`, `TableCaption`). Este componente no existía antes de esta
pasada — la app todavía no tenía una vista con datos tabulares reales, así
que se creó como parte del sistema de diseño para que la primera tabla que
se necesite (por ejemplo, una vista de envíos de formulario más densa que
`SubmissionsDialog`, o un futuro panel de administración multiusuario)
tenga una base consistente en vez de partir de cero.

## Anatomía

```tsx
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Fecha</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell className="text-muted-foreground">{row.date}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Receta visual

| Parte | Receta |
|---|---|
| Contenedor | `.glass rounded-2xl overflow-x-auto` — misma elevación que `Card` (ver `foundations/06-shadows-elevation.md`); el scroll horizontal vive en el contenedor, nunca en la página completa |
| `TableHead` | Patrón micro-label: `text-xs font-semibold tracking-wide uppercase text-muted-foreground`, `h-11` |
| `TableRow` | `border-b border-border-subtle`, hover `bg-surface-1` |
| `TableCell` | `px-4 py-3.5` — mismo ritmo horizontal (`px-4`) que una fila de `LinkRow` |
| Fila seleccionada | `data-[state=selected]:bg-surface-4` |
| `TableFooter` | `border-t border-border bg-surface-1 font-medium` |

## Cuándo usar `Table` vs. una lista de `Card`/filas

- **`Table`** — datos homogéneos con las mismas columnas fila tras fila y
  donde comparar valores entre filas importa (fechas, montos, estados).
- **Lista de filas tipo `LinkRow`** (ver el patrón en
  `sortable-link-row.tsx`) — cuando cada fila tiene una jerarquía visual
  propia (título + subtítulo + acciones), se puede reordenar (drag &
  drop), o el número de columnas varía por fila. Esto es lo que ya usan
  `LinksManager`, el ranking de "Enlaces con más clics" y
  `SubmissionsDialog` — no se migran a `Table` porque no son
  conceptualmente tabulares.

## Reglas de uso

1. Igual que el resto de superficies "glass", `Table` no define su propia
   sombra u opacidad — reutiliza `.glass` y la escala `border-*`.
2. Una tabla con más columnas de las que caben en móvil no comprime sus
   celdas: el contenedor scrollea horizontalmente
   (`overflow-x-auto`, ya incluido) antes que forzar `text-[10px]` o
   truncar datos que el usuario necesita comparar.
3. `TableCaption` es para contexto adicional bajo la tabla (ej. "Datos de
   los últimos 30 días"), no para el título de la sección — el título va
   afuera, en un `<h2>`/`CardTitle` según el contexto.
