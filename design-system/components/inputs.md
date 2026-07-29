# Inputs

Tres componentes comparten una única receta visual — mismo radio, misma
altura mínima, mismos tokens de superficie/borde/foco — para que un
formulario nunca mezcle estilos:

- `Input` (`ui/input.tsx`) — texto, email, color, archivo…
- `Textarea` (`ui/textarea.tsx`) — texto multilínea, `field-sizing-content`
- `NativeSelect` (`ui/native-select.tsx`) — `<select>` nativo estilizado
  con un ícono `ChevronDown` superpuesto

## Receta compartida

```
rounded-xl border border-border bg-surface-2
focus-visible:border-ring focus-visible:bg-surface-4 focus-visible:ring-3 focus-visible:ring-ring/40
disabled:opacity-50
aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
```

| Propiedad | Valor | Nota |
|---|---|---|
| Altura | `h-10` (`min-h-20` en Textarea) | Igual a `Button` tamaño `default` — un input y un botón en la misma fila siempre alinean verticalmente |
| Fondo en reposo | `surface-2` (0.03) | |
| Fondo en foco | `surface-4` (0.05) | Un paso más de opacidad, nunca un color distinto |
| Padding | `px-3.5 py-2` (`py-2.5` Textarea) | |
| Placeholder | `text-muted-foreground/70` | Nunca el mismo tono que el texto real — debe leerse como placeholder |

## Por qué `NativeSelect` existe

Antes había dos `<select>` estilizados a mano en archivos distintos
(`design-editor.tsx` y `link-form-dialog.tsx`) con clases casi idénticas
pero no exactamente iguales. `NativeSelect` es el único punto de verdad:
cualquier select nuevo lo importa, nunca se vuelve a escribir un
`<select className="...">` suelto.

```tsx
import { NativeSelect } from "@/components/ui/native-select";

<NativeSelect value={value} onChange={(e) => onChange(e.target.value)}>
  {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
</NativeSelect>
```

## Label

Todo campo usa el componente `Label` (`ui/label.tsx`), nunca un `<label>`
o `<p>` suelto — ver el "patrón micro-label" en
`foundations/02-typography.md`.

```tsx
<div className="flex flex-col gap-2">
  <Label htmlFor="displayName">Nombre</Label>
  <Input id="displayName" value={...} onChange={...} />
</div>
```

## Reglas de uso

1. Todo campo de formulario vive dentro de `flex flex-col gap-2` con su
   `Label` — ese gap es fijo, ver `foundations/03-spacing.md`.
2. Nunca un input con `focus:` en vez de `focus-visible:` — un input debe
   marcar foco cuando se navega con teclado, no forzar el anillo en cada
   click de mouse.
3. Un campo de color (`ColorField` en `design-editor.tsx`) reutiliza el
   mismo contenedor (`h-10 rounded-xl border-border bg-surface-2`) que
   `Input`, con un `<input type="color">` invisible superpuesto — no un
   picker custom nuevo.
