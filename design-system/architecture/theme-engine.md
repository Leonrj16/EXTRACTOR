# Theme Engine

Un tema en Aura no es "un color primario y una tipografía" — controla
paleta, tipografía, tratamiento de botones, cards, fondos, sombras,
bordes, animación y efectos como una sola unidad coherente. Cambiar de
tema transforma la página pública entera con un clic, sin romper el
contenido (los bloques siguen siendo los mismos, solo cambia cómo se ven).

Esta carpeta documenta el contrato del Theme Engine. Si vas a agregar un
tema nuevo o a entender cómo se resuelve uno, esto es lo único que
necesitas leer.

## Por qué existe esta arquitectura

Antes de esta pasada, un "tema" era un `Theme.baseConfig` con 5 campos
planos (`primaryColor`, `backgroundColor`, `buttonStyle`, `fontFamily`,
`animation`) y un flag `aurora: boolean` hardcodeado. Cambiar de tema
apenas cambiaba dos colores — no había tipografía real, ni tratamiento de
botones, ni fondos, ni cards, ni una identidad propia por tema.

La solución sigue el mismo patrón que ya validamos con el Page Builder:
un contrato único (`ThemeDefinition`) que cada tema implementa, un
registro central (`THEME_REGISTRY` / `getThemeDefinition`), y una función
de resolución (`resolveTheme`) que hace el merge en cascada — tema base →
overrides rápidos existentes de `Appearance` → personalización profunda
nueva (`Appearance.themeOverrides`). Nada de esto rompe lo que ya
funcionaba: los campos escalares de `Appearance` (`primaryColor`,
`buttonStyle`, `borderStyle`, `shadowStyle`, `fontFamily`, `animation`,
`layout`) siguen exactamente con el mismo significado y precedencia que
tenían antes.

## Arquitectura de datos

```
Theme.baseConfig (JSON)          →  la ThemeDefinition completa
                                     (colores, tipografía, botones,
                                     cards, animaciones, efectos)

Appearance.<scalar>              →  overrides "rápidos" que YA EXISTÍAN
(primaryColor, buttonStyle...)      (color principal, fondo, forma de
                                     botón, borde, sombra, fuente,
                                     animación, layout) — sin cambios

Appearance.themeOverrides (JSON) →  personalización profunda NUEVA
                                     (color secundario/acento, tipo de
                                     fondo, tipografía avanzada,
                                     tratamiento de botón, glow) — el
                                     mismo rol que Link.styleOverrides
                                     cumple para bloques
```

**Temas del sistema** (`isSystem: true`, `profileId: null`): están
definidos en código en `apps/web/src/themes/<key>/` — esa es la fuente de
verdad para cómo se ven. El backend solo siembra un `Theme.baseConfig`
liviano (`{ categories, tagline }`, ver `prisma/seed.ts`) para poder
servir el catálogo y hacer el matching de "Temas inteligentes" sin
depender del código del frontend. `getResolvedDefinition()` busca primero
en `THEME_REGISTRY`; solo cae al `baseConfig` de la fila si el `key` no
está registrado ahí.

**Temas personalizados** (`isSystem: false`, `profileId: <perfil>`): no
tienen entrada en `THEME_REGISTRY` — su `Theme.baseConfig` que envía el
frontend (al "Guardar tema" o "Duplicar") ES la `ThemeDefinition`
completa, y es la única fuente de verdad para ese tema. El backend no
resuelve ni mergea nada: solo persiste lo que el cliente ya calculó (ver
`AppearanceService.createCustomTheme`).

## El contrato: `ThemeDefinition`

Definido en `themes/types.ts`:

```ts
interface ThemeDefinition {
  key: string;
  layout: "list" | "grid";
  meta: { name; tagline; categories: ThemeCategory[] };
  colors: { primary; secondary; accent; background; surface; text; textMuted };
  typography: { font; headingWeight; bodyWeight; letterSpacing; lineHeight; textTransform };
  buttons: { treatment; shape };
  cards: { radius; shadow; border };
  animations: { entrance; hover };
  effects: { background: BackgroundSpec; glow?; blurPx? };
}
```

`cards.radius/shadow/border` reutilizan exactamente el mismo vocabulario
que `BlockStyleOverrides` (`none|sm|md|lg|full`, `none|soft|glow`,
`none|subtle|solid|thick`) — un tema no inventa una escala paralela para
"qué tan redondeada es una card", usa la que los bloques ya entienden.

## Decisión de estructura: un archivo por tema, no seis

El pedido original era `colors.ts`, `typography.ts`, `buttons.ts`,
`cards.ts`, `animations.ts`, `effects.ts`, `theme.json` y `preview.png`
por tema. Con 20 temas eso son ~160 archivos de puro scaffolding sin
valor adicional sobre un solo archivo bien organizado. Cada tema en
`apps/web/src/themes/<key>/` tiene en cambio:

- **`theme.json`** — metadata real y separada (`name`, `tagline`,
  `categories`) que también usa el backend al sembrar el catálogo.
- **`index.ts`** — el resto de las secciones (`colors`, `typography`,
  `buttons`, `cards`, `animations`, `effects`) como un solo objeto
  `ThemeDefinition`, con cada sección igual de fácil de encontrar que si
  estuviera en su propio archivo.

**`preview.png` no existe** — en su lugar, `ThemePreviewCard` renderiza
una vista previa en vivo con los tokens reales del tema (avatar, nombre,
botón de muestra, fondo). Esto es mejor que una imagen estática: nunca
queda desactualizada si el tema cambia, y duplica como verificación de
que los tokens realmente resuelven a algo.

## Tratamiento de botones (10 estilos)

`buttons.treatment` (`filled|outline|glass|minimal|gradient|3d|glow|
floating|soft|rounded`) es el *acabado visual* del botón — un eje
independiente de su *forma* (`buttons.shape`: `rounded|pill|square`, el
mismo `Appearance.buttonStyle` de siempre). `resolveButtonTreatment()`
en `themes/shared/button-treatments.ts` traduce un tratamiento a
className + estilos inline.

Los 24 bloques del Page Builder que renderizan un botón o CTA lo
consumen: `ButtonBlock`, `CalendarBlock`, `ContactBlock` (modo enlace
directo), `EmailBlock`, `HeroBlock`, `MapBlock`, `PricingBlock`,
`ProductBlock`, `ProfileBlock` (íconos sociales), `ServiceBlock`,
`SocialBlock`, `WhatsAppBlock` y `ThemePreviewCard`. Los que no tienen
botón (Texto, Imagen sin enlace, Separador, Footer con links de texto
subrayado...) correctamente no lo necesitan. Cada uno sigue el mismo
patrón: `resolveButtonTreatment(theme.buttonTreatment ?? "filled",
theme.primaryColor, theme.secondaryColor)`, con el resultado como base y
cualquier `styleOverrides` propio del bloque ganando encima (mismo orden
`{...treatment.style, ...style}` que `ButtonBlock/preview.tsx` ya usaba).
Agregar un bloque nuevo con botón es seguir ese mismo patrón, no un
cambio de contrato.

## Fondos

`effects.background` es un `BackgroundSpec` con 10 tipos posibles
(`solid|gradient|glass|aurora|mesh|image|pattern|blur|video|particles`).
`resolveBackground()` en `themes/shared/backgrounds.ts` los traduce a CSS.

**Renderizados de verdad hoy**: solid, gradient, glass, aurora (el efecto
de blobs que ya existía, ahora coloreado con los tokens del tema en vez
de colores de marca hardcodeados), mesh (radial-gradients múltiples),
pattern (un patrón de puntos vía data-uri, sin necesidad de subir nada),
blur, image (con upload).

**Declarados en el contrato pero sin render real todavía**: `video` y
`particles` — caen a `solid` en vez de fallar. Están en el tipo a
propósito para que agregar el render real no sea un cambio de contrato,
solo una nueva rama en `resolveBackground()`.

## Tipografía

7 fuentes reales vía `next/font/google` (`layout.tsx`): Inter, Space
Grotesk, Manrope, Poppins, Outfit, DM Sans, Plus Jakarta Sans. **Satoshi
no está** — no existe en Google Fonts, así que no se fingió con un
nombre de CSS sin archivo real detrás.

`Appearance.fontFamily` es anterior al Theme Engine y guarda el label
humano ("Space Grotesk"), no el slug (`FontKey`). `resolve-theme.ts`
mapea ese label a la variable CSS correcta vía
`themes/shared/fonts.ts#FONT_NAME_TO_KEY`; un valor legacy no reconocido
(un viejo "Roboto"/"Playfair Display" de antes de este catálogo) se usa
tal cual como string de `font-family`, exactamente como se comportaba
antes.

Personalizables además de la fuente: peso de títulos/texto (400-700),
espaciado entre letras, altura de línea, transformación de texto — todo
vía `Appearance.themeOverrides.typography`.

## Animaciones

Los 9 presets del spec (Fade, Slide, Zoom, Glow, Float, Parallax, Ripple,
Pulse, Scale) viven en `blocks/shared/animation-presets.ts` —
**el mismo archivo que ya usan los bloques**, no uno nuevo, para que
haya una sola fuente de variantes de Framer Motion en toda la app. Son
variantes de *entrada* (hidden→visible); "float"/"pulse"/"ripple" están
diseñados como una entrada que evoca ese movimiento, no como una
animación continua en loop — encajar en el modelo de entrada existente
importaba más que el loop literal.

## Galería y selector

`ThemeGallery` (búsqueda + filtros de categoría + tarjetas) y
`ThemePreviewCard` (la vista previa en vivo) viven en
`components/admin/`. Las 9 categorías (`ThemeCategory` en
`themes/types.ts`) son las mismas del spec. El filtrado y la búsqueda son
enteramente client-side sobre los temas ya cargados — no hay endpoint de
búsqueda en el backend, no hace falta con ~20-30 temas en el catálogo.

## Guardar, duplicar, restablecer, importar, exportar, favorito

Todos menos "favorito" comparten un único endpoint, `POST /admin/themes`
(`CreateCustomThemeDto { name, layout, baseConfig }`) — el backend solo
persiste lo que el cliente ya resolvió:

- **Guardar tema**: el cliente arma el `baseConfig` mezclando el tema
  activo con `Appearance.themeOverrides` actual, lo manda, y cambia el
  `themeId` de `Appearance` al nuevo tema creado.
- **Duplicar tema**: el cliente resuelve el tema elegido en la galería
  (`getResolvedDefinition`) y lo manda tal cual, sin aplicarlo.
- **Restablecer**: `Appearance.themeOverrides = null` — vuelve a los
  valores por defecto del tema base.
- **Exportar**: descarga el `ThemeOverrides` resuelto actual como JSON
  (client-side, sin endpoint).
- **Importar**: lee un JSON subido y lo aplica sección por sección como
  `themeOverrides` (valida con `JSON.parse`, no un schema — un archivo
  mal formado muestra un toast de error en vez de aplicarse a medias).
- **Favorito**: `Profile.favoriteThemeKeys` (array nativo de Postgres),
  `POST /admin/themes/:key/favorite` alterna la key.

## Temas inteligentes (Claude + fallback determinístico)

`POST /admin/themes/suggest { prompt }` (`ThemeAiService`) llama a Claude
(modelo `claude-haiku-4-5-20251001`, suficiente para esta clasificación
cerrada) cuando hay `ANTHROPIC_API_KEY` configurada: le pasa el catálogo
de temas del sistema (key, nombre, categorías, tagline) y fuerza la
respuesta con `tool_choice` a una única herramienta `select_theme` cuyo
`input_schema` restringe `themeKey` a un enum con las keys del catálogo
más `"none"` — la respuesta nunca puede ser texto libre ni una key
inventada sin que el código lo detecte.

Sin la API key configurada, o si la llamada falla por cualquier motivo
(red, rate limit, key fuera de catálogo, respuesta sin `tool_use`), cae a
un match determinístico por palabras clave contra las categorías/tagline
de cada tema (mismo comportamiento que la versión original de esta
clase). Ambos caminos comparten la misma forma de salida
(`{ themeId, key, name, matched, reason }`), así que el endpoint, el DTO
y la UI que lo consume (el cuadro "Temas inteligentes" en la galería) no
necesitan saber cuál de los dos respondió.

## Cómo agregar un tema nuevo

1. Crea `apps/web/src/themes/<key>/theme.json` (name, tagline,
   categories) e `index.ts` (el resto de `ThemeDefinition`), copiando la
   estructura de un tema existente.
2. Impórtalo en `themes/registry.ts` y agrega una línea a
   `THEME_REGISTRY`.
3. Agrega la misma entrada liviana (`key`, `name`, `layout`, categories,
   tagline) al array `THEMES` en `apps/api/prisma/seed.ts` y corre
   `prisma db seed` — esto es la única duplicación real entre backend y
   frontend (ver "Decisión: dos fuentes para el catálogo" abajo).

Eso es todo. `profile-view.tsx`, `design-editor.tsx` y todos los bloques
siguen funcionando sin tocarlos.

## Decisión: dos fuentes para el catálogo de temas del sistema

El monorepo tiene un paquete `packages/types` pensado para compartir
tipos entre `apps/api` y `apps/web`, pero está sin usar en la práctica
(ninguna importación real lo referencia hoy). Conectar ese paquete solo
para no repetir `{ name, tagline, categories }` de 20 temas es más riesgo
arquitectónico (una nueva dependencia cruzada, dos tsconfig distintos)
que el problema que resuelve. La duplicación real es mínima —metadata
liviana, nunca colores/tipografía/efectos— y queda documentada aquí en
vez de oculta.
