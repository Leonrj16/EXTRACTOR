# Espaciados

Aura usa la escala de espaciado nativa de Tailwind (`--spacing: 0.25rem`,
es decir cada paso = 4px: `p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` =
24px...). No se sobrescribe: la escala completa de Tailwind ya es
suficientemente granular y consistente; crear una escala paralela sería
precisamente el tipo de duplicación que este sistema evita.

## Padding interno por tipo de componente

| Componente | Padding | Nota |
|---|---|---|
| `Button` (default) | `px-4`, altura `h-10` | Ver `components/buttons.md` para la escala completa de tamaños |
| `Input` / `Textarea` / `NativeSelect` | `px-3.5 py-2` (`py-2.5` en Textarea) | Altura mínima `h-10` / `min-h-20` |
| `Card` (default) | `--card-spacing: --spacing(6)` = 24px | Variable CSS, no clases repetidas — ver abajo |
| `Card` (`size="sm"`) | `--card-spacing: --spacing(4)` = 16px | |
| `Dialog` (`DialogContent`) | `p-6` (24px), footer `p-6 pt-4` | |
| `DropdownMenuContent` | `p-1.5` contenedor, ítems `px-2.5 py-2` | |
| Fila de enlace (`LinkRow`) | `p-4` (16px) | |
| Sidebar (`aside`) | `p-4` | |
| Header (`header`) | `px-4 py-3.5`, `sm:px-5` | |

### El patrón `--card-spacing`

`Card` no repite `px-6 py-6` en cada uno de sus sub-componentes
(`CardHeader`, `CardContent`, `CardFooter`). Define **una** variable CSS
local, `--card-spacing`, en el elemento raíz y cada hijo la referencia:

```
className="[--card-spacing:--spacing(6)] ..."
// CardHeader: px-(--card-spacing)
// CardContent: px-(--card-spacing)
// CardFooter: p-(--card-spacing)
```

Cuando `size="sm"`, un solo `data-[size=sm]:[--card-spacing:--spacing(4)]`
en el componente raíz reduce el espaciado de los tres sub-componentes a la
vez. Este es el patrón a seguir para cualquier componente compuesto nuevo
que tenga espaciado interno compartido entre varias partes: una variable,
no N clases repetidas.

## Gaps (separación entre elementos hijos)

| Contexto | Gap | Ejemplo |
|---|---|---|
| Botón (ícono + texto) | `gap-1.5` (default), `gap-1` (sm/xs) | `Button` |
| Fila de nav / ítem de lista | `gap-2.5` | Sidebar, header dropdown item |
| Grupo de campos de formulario | `gap-2` (label + input), `gap-4` (entre campos) | `DesignEditor` |
| Grid de stat cards | `gap-4` | Dashboard |
| Lista de enlaces | `gap-3` | `LinksManager` |
| Card (`--card-spacing`) | `gap-(--card-spacing)` | `Card` |

## Regla de uso

Antes de escribir un valor de padding/gap nuevo, comprueba si el
componente ya pertenece a una de las filas de arriba — la mayoría de las
superficies "glass" de la app (Card, Dialog, Dropdown, filas de lista)
convergen en múltiplos de `4` (16px) o `6` (24px). Un padding de `p-5`
(20px) o `p-3` (12px) suelto en un componente nuevo rompe esa cuadrícula
implícita; si de verdad se necesita un paso intermedio, primero se
documenta aquí.
