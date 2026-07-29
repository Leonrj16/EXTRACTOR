# Navbar (Header)

Componente: `apps/web/src/components/admin/header.tsx` (`AdminHeader`).
Barra superior del panel de administración — complementa al sidebar, no
lo reemplaza en móvil (el botón de hamburguesa del header abre el drawer
del sidebar).

## Anatomía

```
header (.glass, rounded-2xl, px-4/5 py-3.5)
├── botón hamburguesa (solo < lg)
├── título de página + saludo dinámico
├── buscador (solo ≥ sm)
├── dropdown de notificaciones
└── dropdown de cuenta (avatar)
```

## Título de página + saludo

El label de la página activa viene de un mapa fijo ruta→texto
(`PAGE_LABELS`), y el saludo (`"Buenos días, Mi"` / `"Buenas tardes,
Mi"` / `"Buenas noches, Mi"`) se calcula una vez en cliente según la hora
local (`useGreeting`) — nunca se calcula en el servidor para evitar
desajustes de hidratación por zona horaria.

## Buscador con "ir a"

El input de búsqueda del header no filtra contenido: es un atajo de
navegación. Al presionar Enter, hace *match* difuso contra una lista de
alias por ruta (`ROUTES`, ej. `"enlaces"`/`"links"` → `/admin/links`) y
navega. Cualquier alias nuevo de una página futura se agrega a `ROUTES` y
`PAGE_LABELS` juntos, nunca solo a uno de los dos.

## Receta visual

| Parte | Receta |
|---|---|
| Contenedor | `.glass rounded-2xl px-4 py-3.5` (`sm:px-5`) |
| Botón hamburguesa / notificaciones | `size-10 rounded-xl`, hover `bg-surface-5` |
| Buscador | `Input` estándar con ícono `Search` absoluto a la izquierda (`pl-9`) |
| Avatar (trigger de cuenta) | `size-10 rounded-full bg-gradient-aura`, `hover:scale-105` |

## Reglas de uso

1. El botón hamburguesa solo existe visualmente por debajo de `lg`
   (`lg:hidden`) — en desktop el sidebar ya está siempre visible, no debe
   haber un botón de menú redundante.
2. Todo botón icon-only del header lleva `aria-label` (ver
   `foundations/09-states.md`): "Abrir menú", "Notificaciones", "Menú de
   cuenta".
3. Los dos dropdowns del header (notificaciones, cuenta) siguen la receta
   de `components/dropdowns.md` al pie de la letra — incluyendo el
   `DropdownMenuGroup` obligatorio.
