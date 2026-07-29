# Modales (Dialog)

Componente: `apps/web/src/components/ui/dialog.tsx`, sobre
`@base-ui/react/dialog`. Un único punto de verdad para overlay + popup +
header + footer + close button — ninguna pantalla implementa su propio
modal con `position: fixed` a mano.

## Anatomía

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Nuevo enlace</DialogTitle>
      <DialogDescription>...</DialogDescription>
    </DialogHeader>
    {/* contenido / formulario */}
    <DialogFooter>
      <DialogClose render={<Button type="button" variant="outline" />}>
        Cancelar
      </DialogClose>
      <Button type="submit">Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Receta visual

| Parte | Receta |
|---|---|
| `DialogOverlay` | `bg-black/60`, `backdrop-blur-sm`, `duration-150` |
| `DialogContent` | `.glass-strong` (ver `foundations/06-shadows-elevation.md`), `rounded-2xl p-6 gap-5`, `sm:max-w-md`, centrado con `top-1/2 left-1/2 -translate-1/2` |
| Botón de cerrar | `Button variant="ghost" size="icon-sm"`, esquina `top-4 right-4` — reutiliza el componente `Button`, no un `<button>` suelto |
| `DialogTitle` | `font-heading text-lg font-semibold` |
| `DialogFooter` | Se extiende fuera del padding del contenido (`-mx-6 -mb-6`) con su propio `border-t border-border bg-surface-1 p-6 pt-4` — separación visual clara entre contenido y acciones |

## Por qué `.glass-strong` y no `.glass`

Un Dialog **flota sobre** otra superficie (la página que quedó detrás,
oscurecida por el overlay), mientras que una Card **vive al mismo nivel**
que el fondo de la página. Por eso Dialog usa el segundo nivel de
elevación (`--shadow-surface-strong`, blur 24px, fondo sólido
`surface-strong`) en vez del primero — ver
`foundations/06-shadows-elevation.md`. Esta misma regla aplica a
`DropdownMenuContent`.

## Reglas de uso

1. `DialogFooter` siempre incluye un botón para cancelar/cerrar
   (`DialogClose` renderizando un `Button variant="outline"`) además de la
   acción principal — nunca solo el botón de acción, obligando al usuario
   a usar Esc o el ícono de cerrar.
2. El ancho máximo por defecto es `sm:max-w-md`; solo se amplía
   (`sm:max-w-lg`, visto en `SubmissionsDialog`) cuando el contenido es
   una lista, nunca por preferencia estética suelta.
3. Todo modal usa `Dialog` de `ui/dialog.tsx` — un `<div>` con
   `fixed inset-0` a mano en una pantalla es exactamente el tipo de
   duplicación que este sistema existe para evitar.
