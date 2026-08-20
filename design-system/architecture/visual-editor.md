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

## Overrides responsive campo por campo (padding/margin/ancho)

`styleOverrides.responsive` extiende la idea de arriba más allá de
mostrar/ocultar: `{ mobile?, tablet?, desktop? }`, cada uno con su propio
`padding`/`margin`/`width` opcional. Cada dispositivo es independiente,
no cascada — un dispositivo sin su propio valor cae al valor base del
campo (`styleOverrides.padding` etc.), nunca a lo que haya resuelto un
breakpoint más chico, así que configurar solo "Escritorio" nunca sorprende
con el valor de tablet filtrándose a los 900px. La UI vive en
`BlockStylePanel`, debajo de "Ocultar este bloque en": pestañas
Escritorio/Tablet/Móvil, cada una con sus 3 selects (con "Usar valor
base" como opción para no-override).

Igual que `hiddenOn`, esto se resuelve con CSS real, no JS — pero acá el
mecanismo es distinto porque el valor no es un booleano de visibilidad
sino un valor de layout que el bloque ya está aplicando inline (via
`resolveBlockStyle`, en el elemento de contenido, no en `BlockFrame`).
Un `<style>` inyectado por bloque hubiese necesitado un id único por
bloque y competir en especificidad con ese inline style existente; en
vez de eso, `resolveResponsiveFrameClasses` (`shared/style-resolver.ts`)
pone clases Tailwind reales (`[--block-padding:...]`, `sm:[...]`,
`lg:[...]`) en `BlockFrame` — el ancestro directo del elemento de
contenido — para fijar `--block-padding`/`--block-margin`/`--block-width`
por breakpoint; `resolveBlockStyle` simplemente referencia
`var(--block-padding)` en vez de un valor literal cuando el campo tiene
algún override responsive. Las custom properties de CSS heredan por el
árbol del DOM, así que esto no necesita selector ni `<style>` propio, y
gana automáticamente contra cualquier clase (aunque igual nunca compite:
es la única fuente para ese campo una vez que es responsive).

Como Tailwind solo genera CSS para clases que ve como texto literal en
el código fuente (no arma las que se concatenan en tiempo de ejecución),
las combinaciones posibles (3 breakpoints × 4 valores de padding/margin,
2 de ancho) están escritas explícitamente como tablas de búsqueda en
`style-resolver.ts` — `resolveResponsiveFrameClasses` solo indexa esa
tabla, nunca arma un string.

Igual que con `hiddenOn`, el lienzo del editor no puede confiar en las
media queries reales (su "dispositivo" es un contenedor de ancho fijo
dentro del viewport real, casi siempre ancho). `BlockTheme.previewDevice`
(pasado por `Canvas` y por `ProfileView` en sus contextos de simulación)
hace que `BlockFrame` calcule el mismo resultado en JS
(`resolveResponsiveFrameVars`) y lo aplique como CSS custom properties
inline — un inline style siempre gana sobre las clases con media query,
así que esto pisa correctamente lo que el viewport real hubiera resuelto,
sin tocar el comportamiento de la página pública real (que nunca pasa
`previewDevice`).

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

## Historial persistido en servidor (versiones nombradas)

Complementa el undo/redo de arriba exactamente donde ese no llega: crear
y eliminar bloques. `PageVersion` (modelo Prisma, `page-versions.service.ts`)
guarda, a pedido explícito del usuario (botón "Guardar" en el diálogo
"Versiones guardadas", dentro del menú "Historial" de `EditorTopBar`), un
snapshot con los campos de Page Builder de cada `Link` del perfil en ese
momento — sin ids (una restauración siempre crea filas nuevas) y sin
Appearance/tema (esto es historial de bloques, no del Theme Engine).
`PageVersion.blockCount` guarda la cantidad de bloques por separado del
JSON del snapshot, para que listar versiones no tenga que traer el
snapshot completo solo para mostrar "8 bloques".

Restaurar (`POST /admin/page-versions/:id/restore`) reemplaza *todo* el
conjunto de bloques actuales del perfil en una sola transacción
(`deleteMany` + un `create` por bloque del snapshot) — no es un merge con
lo que exista en ese momento, es "volver a este punto". Por eso la UI pide
una confirmación extra (el botón "Restaurar" se convierte en "¿Confirmar?"
y hay que hacer clic de nuevo) en vez de ejecutar en un solo clic como el
resto de las acciones del editor: al ser una sustitución total, el costo
de un clic accidental es mucho mayor que el de un delete de un solo
bloque. Las versiones guardadas nunca se purgan automáticamente — a
diferencia del stack de undo (con tope de 50 entradas anónimas), estas
son artefactos nombrados y creados a propósito por el usuario, así que
solo desaparecen si el usuario mismo las borra.

## Selección múltiple y acciones en lote

`workspace.tsx` mantiene `selectedIds: string[]` en vez de un único id.
Clic simple reemplaza la selección; Ctrl/Cmd+clic agrega o quita un bloque
de la selección actual; Shift+clic selecciona el rango entre el último
bloque clicado (`selectionAnchor`) y el clicado ahora, en el orden del
lienzo — el mismo esquema de modificadores que Figma o Photoshop. Tanto
`Canvas` como `LayersPanel` reciben el mismo `selectedIds`/`onSelect`, así
que seleccionar desde cualquiera de los dos se refleja en ambos.

Con 2+ bloques seleccionados aparece `SelectionToolbar` (flotante, arriba
del lienzo) con Duplicar/Ocultar/Mostrar/Eliminar. Duplicar y Eliminar
excluyen los bloques bloqueados de la selección (igual que sus
equivalentes de un solo bloque en el overlay del lienzo); Ocultar/Mostrar
no — el toggle de visibilidad tampoco está bloqueado por `locked` para un
solo bloque. `InspectorPanel` no intenta edición de campos en lote: con
2+ seleccionados muestra un mensaje señalando la barra de acciones en vez
de listar controles ambiguos para bloques de distinto tipo.

Duplicar y Eliminar en lote **no** se registran en el historial — mismo
motivo que sus versiones de un solo bloque (ver más abajo: el servidor
asigna ids nuevos a cada fila creada). Ocultar/Mostrar en lote sí se
registra, como una sola entrada de historial (`recordBatch`, ver
`use-editor-history.ts`) que aplica los N cambios de `isActive` juntos —
así un solo Deshacer revierte el lote completo en vez de necesitar N
Deshacer para volver al estado anterior.

`useLinksManager` expone `handleBulkDelete`/`handleBulkDuplicate`/
`handleBulkSetActive`, que resuelven cada request del lote de forma
independiente (`Promise.allSettled`) y reconcilian el estado local
bloque por bloque en vez de revertir todo el lote ante cualquier fallo
parcial — revertir todo dejaría en la UI bloques "fantasma" que el
servidor ya procesó (ya borrados, o ya actualizados) y que fallarían en
la siguiente acción sobre ellos.

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

- **Agrupar/desagrupar bloques** — la selección múltiple (shift/ctrl+clic)
  y sus acciones en lote (duplicar/ocultar/mostrar/eliminar) sí están
  implementadas, ver más arriba; agrupar varios bloques bajo un contenedor
  propio es una estructura de datos distinta (anidamiento) que esta fase
  no cubre.
- **Historial de Appearance/tema** — las versiones nombradas sí están
  implementadas para bloques (ver arriba); un historial equivalente para
  cambios de tema/Appearance no existe todavía.
- **Orden de bloques por dispositivo** — padding/margin/ancho por
  dispositivo sí están implementados (ver más arriba); reordenar bloques
  distinto según el breakpoint es una estructura de datos aparte (un
  `order` por dispositivo, no un solo `Link.order`) que esta fase no
  cubre.
- **Virtualización de la lista de bloques** — no hace falta al tamaño
  realista de una página bio-link.
- **Guías inteligentes de alineación tipo Figma** (distancias, centrado,
  espaciado uniforme al arrastrar) — no aplican de la misma forma a una
  lista ordenada de ancho fijo como al posicionamiento freeform para el
  que existen en herramientas de diseño; el lienzo sí tiene indicador de
  destino al arrastrar (dnd-kit), pero no medidas de distancia en vivo.
