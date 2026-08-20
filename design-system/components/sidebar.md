# Sidebar

Componente: `apps/web/src/components/admin/sidebar.tsx` (`AdminSidebar`).
Navegación primaria del panel de administración — visible fija en `lg+`,
convertida en drawer superpuesto por debajo de ese breakpoint (ver el
layout que la envuelve en `apps/web/src/app/admin/(protected)/layout.tsx`).

## Anatomía

```
aside (.glass, rounded-3xl, w-64, h-[calc(100vh-1.5rem/2rem)])
├── Logo
├── nav (flex-1)
│   └── Link × 4 (Dashboard, Enlaces, Diseño, Analítica)
│       └── pill activo animado (layoutId) + label
└── footer (border-t border-border)
    ├── "Ver página pública"
    ├── "Cerrar sesión"
    └── tarjeta de identidad (avatar + nombre + @usuario)
```

## Ítem de navegación activo

El fondo violeta del ítem activo **no aparece/desaparece** — se desliza
entre ítems usando `layoutId="sidebar-active-pill"` de Framer Motion (ver
`foundations/08-animations.md`). Esto es intencional: refuerza que la
navegación es un único elemento que se mueve, no cuatro estados
independientes.

```tsx
{isActive && (
  <motion.div
    layoutId="sidebar-active-pill"
    className="absolute inset-0 rounded-xl bg-gradient-aura glow-purple-sm"
    transition={{ type: "spring", stiffness: 400, damping: 32 }}
  />
)}
```

## Receta visual

| Parte | Receta |
|---|---|
| Contenedor | `.glass rounded-3xl p-4` — el radio más grande de toda la app (ver `foundations/05-radius.md`) |
| Ítem inactivo | `text-muted-foreground`, hover `bg-surface-5` |
| Ítem activo | `text-white` sobre el pill de gradiente |
| Separador de sección | `border-t border-border` |
| Tarjeta de identidad | `rounded-xl border-border bg-surface-2`, avatar `rounded-full bg-gradient-aura` |

## Reglas de uso

1. Cada `Link`/`a`/`button` custom del sidebar lleva
   `outline-none focus-visible:ring-2 focus-visible:ring-ring/40` —
   ninguno se apoya solo en el estilo de foco por defecto del navegador.
2. El ítem activo se determina por `pathname === href` exacto — no por
   `startsWith`, para que una subruta futura no marque dos ítems como
   activos a la vez.
3. `aria-current="page"` se añade al `Link` activo además del estilo
   visual — el estado activo nunca es solo color.
