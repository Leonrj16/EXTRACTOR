# Sistema de Grid

Aura no usa un grid de columnas fijo tipo "12 columnas" — usa CSS Grid /
Flexbox de Tailwind directamente, con breakpoints estándar. Estos son los
patrones de layout reales que existen hoy y que cualquier pantalla nueva
debería reutilizar en vez de inventar uno propio.

## Breakpoints

Los de Tailwind por defecto, sin overrides: `sm` 640px, `md` 768px, `lg`
1024px, `xl` 1280px. En la práctica, Aura solo usa tres de ellos:

- **`sm`** — punto donde una columna se convierte en dos (stat cards,
  campos de formulario en par) y donde reaparecen elementos ocultos en
  móvil (buscador del header, badge de tipo de enlace).
- **`lg`** — punto donde la navegación pasa de "drawer móvil" a "sidebar
  fijo", y donde el editor de diseño pasa de una columna apilada a tres
  columnas lado a lado.
- **`xl`** — solo para el grid de 4 stat cards del dashboard.

## Layout raíz del admin

```
Sidebar (w-64, fijo, lg:flex) + contenido (flex-1, scroll propio)
```

En móvil (`< lg`) el sidebar se oculta y se reemplaza por un drawer
(`AnimatePresence` + overlay) disparado desde el botón de menú del header.

## Grid de Stat Cards (Dashboard)

```
grid gap-4 sm:grid-cols-2 xl:grid-cols-4
```

1 columna en móvil → 2 en tablet → 4 en desktop. Los mismos 4 pasos se
usan en `apps/web/src/app/admin/(protected)/dashboard/page.tsx`.

## Grid de dos paneles (Dashboard: top links + accesos rápidos)

```
grid gap-4 lg:grid-cols-[1.3fr_1fr]
```

Columnas de ancho fijo-proporcional (no `1fr 1fr` genérico) porque el
panel de "Enlaces con más clics" necesita más espacio horizontal que la
columna de accesos rápidos.

## Editor visual — grid de 3 columnas

```
grid lg:grid-cols-[220px_1fr_360px]
```

Rail de navegación (ancho fijo) + panel activo (flexible) + vista previa
en vivo (ancho fijo). Por debajo de `lg`, es un `grid` de una sola columna
que apila las tres secciones verticalmente — **nunca uses `flex-col` +
`lg:flex-row` para este patrón**, un solo `grid`/`lg:grid-cols-[...]` ya
resuelve ambos casos sin duplicar el contenedor.

## Grid de campos de formulario en pares

```
grid gap-4 sm:grid-cols-2
```

Usado para WhatsApp/Email, y para color primario/color de fondo en el
editor de tema. Regla: si dos campos son conceptualmente equivalentes
(mismo tipo, mismo peso visual), van en este grid de 2 columnas — no en
un `flex` con anchos manuales.

## Página pública (perfil)

```
flex flex-col items-center gap-6 px-6 py-14   (layout "list")
grid grid-cols-2 gap-3                        (layout "grid"/"bento",
                                                max-w-sm, columna completa
                                                para bloques interactivos
                                                vía isWide())
```

## Regla de uso

Todo grid nuevo de "tarjetas iguales" usa `grid-cols-N` con los mismos
breakpoints (`sm`→2, `xl`→4) que el dashboard, salvo que el contenido
exija proporciones distintas — en ese caso, un `grid-cols-[Xfr_Yfr]`
explícito como el editor de diseño, nunca anchos con `w-[Npx]` fijos que
no colapsan en móvil.
