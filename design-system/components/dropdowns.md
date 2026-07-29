# Dropdowns

Componente: `apps/web/src/components/ui/dropdown-menu.tsx`, sobre
`@base-ui/react/menu`. Cubre menú simple, submenús, checkbox items, radio
items y grupos con label.

## Anatomía mínima

```tsx
<DropdownMenu>
  <DropdownMenuTrigger className="...">
    <Bell className="size-4.5" />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-72">
    <DropdownMenuGroup>
      <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>...</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

**Regla no-negociable**: `DropdownMenuLabel` y `DropdownMenuSeparator`
**siempre** van dentro de un `<DropdownMenuGroup>`, nunca sueltos
directamente en `DropdownMenuContent`. Base UI lanza un error en tiempo
de ejecución ("MenuGroupContext is missing") si se omite — este fue un
bug real que llegó a producción (el dropdown de notificaciones/cuenta del
header) porque ningún test anterior había hecho click en esos triggers
específicos.

## Receta visual

| Parte | Receta |
|---|---|
| `DropdownMenuContent` | `.glass-strong` (mismo nivel de elevación que `Dialog`, ver `components/modals.md`), `rounded-xl p-1.5 min-w-40`, `duration-150` |
| `DropdownMenuLabel` | Patrón micro-label: `text-[11px] font-semibold tracking-wide uppercase text-muted-foreground` |
| `DropdownMenuItem` | `rounded-lg px-2.5 py-2 text-sm`, foco/hover `bg-surface-6` |
| `DropdownMenuSeparator` | `h-px bg-border` |
| Variante destructiva | `data-[variant=destructive]:text-destructive`, foco `bg-destructive/10` |

## Uso

```tsx
<DropdownMenuItem variant="destructive" onClick={onDelete}>
  <Trash2 /> Eliminar
</DropdownMenuItem>
```

## Reglas de uso

1. El trigger de un dropdown que es solo un ícono necesita `aria-label`
   explícito (ver `foundations/09-states.md` y `07-icons.md`) — el ícono
   por sí solo no es accesible.
2. `align`/`side`/`sideOffset` tienen defaults sensatos (`start`/`bottom`/
   `4`) — solo se sobrescriben cuando el trigger está en el borde de la
   pantalla (los dos dropdowns del header usan `align="end"` porque están
   pegados al borde derecho).
3. Un ítem de menú con submenú usa `DropdownMenuSub` +
   `DropdownMenuSubTrigger` + `DropdownMenuSubContent` — nunca un segundo
   `DropdownMenu` anidado a mano.
