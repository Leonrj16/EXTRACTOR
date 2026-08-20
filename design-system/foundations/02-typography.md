# Tipografía

## Familias tipográficas

Definidas en `apps/web/src/app/layout.tsx` vía `next/font/google` y
expuestas como variables CSS consumidas por `tokens.css`:

| Rol | Fuente | Variable | Utilidad Tailwind |
|---|---|---|---|
| Cuerpo / UI | Inter | `--font-inter` | `font-sans` (por defecto en `<body>`) |
| Encabezados | Space Grotesk (500/600/700) | `--font-space-grotesk` | `font-heading` |
| Código / mono | Geist Mono | `--font-geist-mono` | `font-mono` |

`h1`–`h4` reciben `font-family: var(--font-heading)` y
`letter-spacing: -0.02em` automáticamente vía `@layer base` en
`globals.css` — no es necesario aplicar `font-heading` manualmente a un
`<h1>`, pero sí a un `<div>`/`<span>` que visualmente actúa como título
(por ejemplo `CardTitle`, `DialogTitle`, el nombre del perfil en el
sidebar).

## Escala tipográfica

Aura usa la escala de tamaño de Tailwind sin sobrescribirla. Estos son los
pasos realmente en uso en la aplicación, de mayor a menor jerarquía:

| Clase | Tamaño | Uso |
|---|---|---|
| `text-3xl` | 1.875rem / 30px | Valor numérico grande de `StatCard` / `CardContent` de analítica |
| `text-2xl` | 1.5rem / 24px | Título de página (`<h1>` de Analítica) |
| `text-xl` | 1.25rem / 20px | Nombre de perfil en la página pública |
| `text-lg` | 1.125rem / 18px | `DialogTitle`, logo "Aura" |
| `text-base` | 1rem / 16px | `CardTitle`, saludo del header, valor de input en móvil |
| `text-sm` | 0.875rem / 14px | Cuerpo de UI por defecto: botones, badges, ítems de menú, texto de card |
| `text-xs` | 0.75rem / 12px | Labels en mayúsculas, timestamps, descripciones secundarias |
| `text-[11px]` | 11px | Micro-label de `DropdownMenuLabel` (un paso por debajo de `text-xs`, solo para encabezados de grupo dentro de menús) |

## Pesos

| Peso | Clase | Uso |
|---|---|---|
| 400 Regular | `font-normal` | Texto de párrafo / descripción |
| 500 Medium | `font-medium` | Texto de UI por defecto (botones, ítems, badges) |
| 600 Semibold | `font-semibold` | Títulos (`CardTitle`, `DialogTitle`), valores destacados, labels en mayúsculas |
| 700 Bold | — | No usado; Semibold es el techo de énfasis de la marca |

## El patrón "micro-label"

Todo label de formulario y todo encabezado de grupo de menú comparte la
misma receta tipográfica — definida una sola vez en el componente `Label`
y reutilizada por `DropdownMenuLabel`:

```
text-xs font-semibold tracking-wide text-muted-foreground uppercase
```

Si necesitas un label nuevo en cualquier parte de la app (formulario,
tabla, filtro), reutiliza esta clase compuesta — no inventes una variante
con mayúsculas/tracking distintos.

## Números

Los contadores animados (`StatCard`, `AnimatedCounter`) y los valores de
analítica usan siempre `font-heading` + `font-semibold` para que las
cifras se sientan "de producto" y no como texto de cuerpo — nunca
`font-sans` para un número destacado.
