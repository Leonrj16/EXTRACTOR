# Editor Visual (Constructor No-Code)

La pestaña que antes se llamaba "Bloques" — una lista simple con un modal
para editar cada enlace — es ahora "Editor Visual": un lienzo de
manipulación directa con biblioteca de bloques, capas, historial de
deshacer/rehacer, vista previa por dispositivo y validación antes de
publicar. Esta carpeta documenta esa arquitectura.

## Por qué existe esta arquitectura

Antes de esta pasada, agregar o editar un bloque abría `LinkFormDialog` —
un modal con un formulario. Eso funciona, pero no es "un constructor
visual": no hay selección directa sobre el contenido, no hay capas, no hay
deshacer, no hay validación antes de publicar. El pedido fue explícito:
llevar el producto de "gestor de enlaces" a "constructor visual no-code",
con una experiencia comparable a Framer/Webflow/Canva/Notion/Figma —
adaptada al tipo de página que Aura produce (un bio-link, no un sitio
freeform).

## Reutilización: qué NO se reconstruyó

El Editor Visual agrega una capa de interacción nueva sobre arquitectura
que ya existía y seguía funcionando:

- **El registro de bloques** (`components/blocks/registry.ts`,
  `BlockDefinition`, `BlockSettingsProps`, `BlockStylePanel`) — el panel
  derecho (`InspectorPanel`) renderiza exactamente `definition.Settings` +
  `BlockStylePanel`, el mismo par que `LinkFormDialog` ya usaba. Ningún
  bloque tuvo que cambiar.
- **`useLinksManager`** (`components/admin/use-links-manager.ts`) — sigue
  siendo el único lugar que habla con `/admin/links/*`. Se le agregaron
  3 funciones de bajo nivel (`patchLink`, `applyOrder`, `createBlock`) que
  el Editor Visual necesita para editar en vivo en vez de por formulario,
  pero `handleSubmit`/`handleToggleActive`/`handleDelete`/`handleDuplicate`/
  `handleDragEnd` siguen exactamente igual — la página `/admin/links`
  (`links-manager.tsx`, `LinkFormDialog`, `SortableLinkRow`) no se tocó y
  sigue funcionando sin saber que el Editor Visual existe.
- **`resolveTheme()` / `getResolvedDefinition()`** — el lienzo calcula el
  tema resuelto exactamente igual que `ProfileView` (la página pública),
  así que el look nunca se desincroniza entre "lo que edito" y "lo que se
  publica".

## Decisión de aislamiento en `design-editor.tsx`

Las pestañas Perfil/Galería/Tema/Estructura siguen renderizando dentro de
la cuadrícula original de 3 columnas (`220px_1fr_360px`) sin ningún
cambio — cero riesgo de regresión ahí. Solo la pestaña "Editor Visual"
toma una rama de `return` completamente separada: la cuadrícula pasa a
`220px_1fr` (el riel de pestañas + un único espacio para
`VisualEditorWorkspace`, que subdivide ese espacio en sus propias 4 áreas).
La razón: un constructor visual profesional con biblioteca + lienzo +
panel de propiedades + barra superior no cabe dentro de la columna central
angosta que las demás pestañas usan — necesita el ancho completo.

## Las 4 áreas

1. **`EditorTopBar`** (`editor-top-bar.tsx`) — nombre del proyecto, estado
   de guardado, Deshacer/Rehacer, selector de dispositivo, Vista previa,
   Compartir (reutiliza `CopyLinkButton`), Publicar.
2. **`BlockLibraryPanel`** (`block-library-panel.tsx`) — buscador +
   categorías colapsables (`blocks/categories.ts`) + Favoritos/Recientes
   persistidos en `localStorage` (una preferencia de UI de bajo riesgo, no
   justifica una columna nueva en la base de datos). Clic en un bloque lo
   agrega al lienzo de inmediato — sin modal — vía
   `useLinksManager.createBlock`.
3. **`Canvas`** (`canvas.tsx`) — ver "El lienzo" abajo.
4. **Columna derecha** — `LayersPanel` (capas, arriba) +
   `InspectorPanel` (propiedades del bloque seleccionado, abajo).

## El lienzo: lista ordenada, no freeform

**La decisión de alcance más importante de esta fase**: el lienzo es una
lista ordenada con manipulación directa (seleccionar, reordenar,
indicador de posición al arrastrar) — **no** un lienzo freeform de
posicionamiento x/y absoluto como Framer/Webflow/Editor X. El modelo de
datos de Aura es una lista ordenada de bloques (una página bio-link), no
un lienzo de diseño libre; adoptar posicionamiento freeform exigiría un
modelo de renderizado completamente distinto que no encaja con lo que
este producto es. Arrastrar un bloque en el lienzo (o en `LayersPanel`)
reordena esa lista — no lo mueve a coordenadas libres.

`Canvas` duplica (no reutiliza) el "chrome" de página de `ProfileView`
(fondo, avatar, nombre, bio) — unas ~70 líneas — en vez de agregarle a
`ProfileView` un modo `editable`. Ambos consumen exactamente
`getResolvedDefinition()` + `resolveTheme()`, así que el look nunca se
desincroniza, pero la página pública ya en producción no corre ningún
riesgo por este feature: su código de render no se tocó.

## Vista previa por dispositivo y `hiddenOn`

`styleOverrides.hiddenOn` (`"desktop"|"tablet"|"mobile"`) oculta un bloque
en la página pública vía clases de Tailwind reales
(`resolveResponsiveVisibility` en `blocks/shared/style-resolver.ts`) — una
media query de verdad, no un chequeo en JS, así que un visitante real
nunca ve un parpadeo.

El lienzo del editor, en cambio, simula el dispositivo con un contenedor
de ancho fijo (`DEVICE_MAX_WIDTH` en `workspace.tsx`) — sus media queries
evaluarían contra el viewport real del navegador, no el ancho simulado, lo
que daría un resultado incorrecto dentro del editor. Por eso tanto
`ProfileView` (prop `previewDevice`, usada solo por el frame de vista
previa de las demás pestañas) como `Canvas` (prop `device`, siempre activa
en modo Vista previa) aplican el ocultamiento explícitamente en JS cuando
están en un contexto de simulación — la página pública real nunca pasa
esa prop y depende solo de las clases CSS.

En modo edición (no Vista previa), un bloque oculto en el dispositivo
activo no desaparece — se muestra atenuado con una etiqueta "Oculto en
este dispositivo", para que se pueda seguir seleccionando y ajustando.

## Historial (deshacer/rehacer)

`use-editor-history.ts` mantiene una pila en memoria (no persistida en el
servidor) de **ediciones de campo** (título/url/ícono/metadata/
styleOverrides/visibilidad) y **reordenamientos** — deliberadamente no
incluye crear ni eliminar un bloque. El servidor asigna un id nuevo a cada
fila creada, así que "rehacer una eliminación" o "deshacer una creación"
necesitaría resucitar una fila bajo su id anterior para no romper
cualquier entrada de historial posterior que la referencie — algo que una
pila puramente de cliente no puede garantizar con seguridad. Crear/
eliminar siguen siendo inmediatos y definitivos, exactamente como se
comportaban antes de este feature. El bloqueo de un bloque
(`styleOverrides.locked`) tampoco se registra en el historial — es una
conveniencia del editor, no contenido.

Cada edición de texto en `InspectorPanel` se debounce 500ms (con `flush`
al cambiar de bloque o desmontar) para no disparar un PATCH por cada
tecla — pero el historial registra la edición completa como una sola
entrada, no una por tecla.

## Publicación y validación

`publish-validation.ts#validateForPublish` corre en memoria contra el
`profile` y los `links` ya cargados — sin request extra. Los errores
(nombre vacío, cero bloques activos, bloque activo sin título) bloquean
"Publicar"; las advertencias (falta foto de perfil, falta SEO, un botón
sin URL, un Hero sin imagen, una galería sin fotos) se muestran pero no
bloquean — el usuario decide. `PublishDialog` es la UI de esta validación.

## Actualización: los 24 bloques de la biblioteca

Las 6 categorías que al lanzar el Editor Visual mostraban "Próximamente"
(Texto, Imagen, Calendario, HTML personalizado, Contador, Separadores) ya
tienen un bloque real cada una — `TextBlock`, `ImageBlock`,
`CalendarBlock`, `CustomHtmlBlock`, `CounterBlock`, `DividerBlock`,
siguiendo exactamente el contrato de `blocks.md`. `CustomHtmlBlock` es el
único caso especial: renderiza HTML arbitrario del usuario dentro de un
`<iframe sandbox="allow-same-origin">` sin `allow-scripts` — ningún
`<script>` pegado ahí se ejecuta nunca, así que no es un vector de XSS (ver
la nota de seguridad en `blocks.md`).

## Qué queda fuera de esta fase (explícitamente diferido)

- **Selección múltiple real y agrupar/desagrupar bloques** — el lienzo
  selecciona un bloque a la vez.
- **Historial persistido en servidor** — solo en memoria de esta sesión de
  edición (ver arriba).
- **Overrides responsive campo por campo** (padding/margin/tamaño/orden
  por dispositivo) — esta fase solo cubre visibilidad (`hiddenOn`).
- **Virtualización de la lista de bloques** — no hace falta al tamaño
  realista de una página bio-link.
- **Guías inteligentes de alineación tipo Figma** (distancias, centrado,
  espaciado uniforme al arrastrar) — no aplican de la misma forma a una
  lista ordenada de ancho fijo como al posicionamiento freeform para el
  que existen en herramientas de diseño; el lienzo sí tiene indicador de
  destino al arrastrar (dnd-kit), pero no medidas de distancia en vivo.
