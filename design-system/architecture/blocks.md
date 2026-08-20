# Arquitectura de bloques (Page Builder)

Desde esta pasada, la aplicación ya no piensa en "enlaces" sino en
**bloques**: cada elemento que un usuario agrega a su página pública —un
botón, un video, una galería, un formulario de contacto, un plan de
precios— es un componente independiente, configurable y reutilizable que
vive en `apps/web/src/components/blocks/`.

Esta carpeta documenta el contrato que sigue cada bloque y por qué está
diseñado así. Si vas a agregar un bloque nuevo, esto es lo único que
necesitas leer.

## Por qué existe esta arquitectura

Antes de esta pasada, cada tipo de enlace (`VIDEO`, `PRODUCT`, `FORM`...) se
renderizaba a través de una cadena de `if/else` dentro de
`profile-view.tsx` y de `link-form-dialog.tsx`. Agregar un tipo nuevo
significaba editar esos dos archivos y arriesgar romper los tipos
existentes. Eso viola el principio abierto/cerrado (Open/Closed) y no
escala a los 15 bloques que pide un Page Builder real.

La solución: un **contrato único** (`BlockDefinition`) que todo bloque
implementa, despachado a través de un **registro central**
(`BLOCK_REGISTRY` / `getBlockDefinition`). `profile-view.tsx` y
`link-form-dialog.tsx` nunca preguntan "¿qué tipo es este enlace?" —
preguntan "¿este tipo tiene una definición registrada?", y si la tiene,
delegan el renderizado completo a esa definición. Agregar un bloque nuevo
es: una carpeta nueva + una línea en `registry.ts`. Cero cambios en los
bloques existentes.

## Decisión de base de datos: evolucionar `Link`, no crear `Block`

Cada bloque se sigue persistiendo como una fila de la tabla `links`
(modelo `Link` en `schema.prisma`) — no se creó una tabla `Block` paralela.
El campo `type` (`LinkType` enum) identifica qué bloque renderiza esa fila,
y `metadata` (JSON) guarda los datos específicos de cada bloque.

Esto fue una decisión deliberada: reutiliza toda la infraestructura de
CRUD, reordenamiento (`/admin/links/reorder`) y analíticas que ya existía y
funcionaba, en vez de duplicarla para un concepto que, en la práctica, es
el mismo (una fila ordenable con un tipo y datos propios). El nombre de la
tabla y del campo se mantienen por compatibilidad con datos existentes,
pero conceptualmente cada `Link` es un bloque del Page Builder.

## El contrato: `BlockDefinition`

Definido en `blocks/types.ts`:

```ts
interface BlockDefinition<TMeta> {
  kind: BlockKind;          // el LinkType que este bloque renderiza
  label: string;            // nombre visible ("Galería", "Testimonio"...)
  description: string;      // una línea para el selector de tipo
  icon: LucideIcon;
  defaultMeta: TMeta;
  interactive?: boolean;    // ver "BlockFrame" más abajo
  Preview: ComponentType<BlockPreviewProps<TMeta>>;
  Settings: ComponentType<BlockSettingsProps<TMeta>>;
}
```

`TMeta` es el tipo de `metadata` específico de cada bloque (por ejemplo
`GalleryBlockMeta { images, layout }`). El registro central los borra a
todos a un `Record<string, unknown>` común para poder guardarlos juntos en
un mismo mapa — cada bloque, dentro de su propia carpeta, sigue trabajando
con su tipo específico sin castear nada raro.

## Estructura de una carpeta de bloque

Cada bloque vive en `blocks/<Nombre>Block/` con exactamente estos 7
archivos:

| Archivo | Contenido |
|---|---|
| `types.ts` | La interfaz `<Nombre>BlockMeta` — solo los campos que este bloque necesita y que no existen ya en `LinkItem` (`title`, `url`, `icon`, `imageUrl`). |
| `config.ts` | `<NOMBRE>_BLOCK_DEFAULT_META`, `_ICON`, `_LABEL`, `_DESCRIPTION` — las constantes que arma `index.tsx`. |
| `styles.ts` | Clases Tailwind reutilizadas por `preview.tsx` (nunca estilos inline sueltos ahí). |
| `animation.ts` | Un booleano `<NOMBRE>_BLOCK_INTERACTIVE` con un comentario explicando por qué (ver "BlockFrame"). |
| `preview.tsx` | Cómo se ve el bloque en la página pública y en la vista previa del editor. `"use client"` porque envuelve en `BlockFrame` (Framer Motion). |
| `settings.tsx` | El panel de configuración propio del bloque (sus campos específicos — el panel de estilo compartido se agrega aparte, ver abajo). |
| `index.tsx` | Junta todo lo anterior en un `BlockDefinition` exportado. |

No hay una carpeta "utils" ni un archivo de más — si algo se repite entre
dos o más bloques, se sube a `blocks/shared/` (ver siguiente sección) en
vez de copiarse.

## Qué es compartido (`blocks/shared/`) y por qué

Nada de esto se reimplementa dentro de un bloque individual:

- **`animation-presets.ts`** — `resolveEntranceVariant()` traduce la
  animación elegida (`fade`/`slide`/`scale`/`none`) a un `Variants` de
  Framer Motion. Un solo lugar para las curvas de entrada de todos los
  bloques y del layout de la propia página.
- **`style-resolver.ts`** — `resolveBlockStyle()` convierte
  `BlockStyleOverrides` (padding, margin, background, border, radius,
  shadow, align, width, opacity) en `CSSProperties`, y expone
  `resolveBorderStyle()`/`resolveShadowStyle()` por separado para que
  `profile-view.tsx` calcule el borde/sombra *de la página* con la misma
  lógica exacta que usa cada bloque para su propio override — nunca dos
  fórmulas de borde/sombra ligeramente distintas.
- **`style-panel.tsx`** — `<BlockStylePanel>` es el panel de "Estilo del
  bloque" (Padding, Margin, Fondo, Borde, Border Radius, Sombra,
  Alineación, Ancho, Animación) que se agrega después del panel propio de
  cada bloque en `link-form-dialog.tsx`. Un bloque nunca vuelve a
  implementar estos campos.
- **`block-frame.tsx`** — `<BlockFrame>` envuelve el contenido de todo
  `preview.tsx` en un `motion.div` con la animación de entrada resuelta y
  el hover/tap compartido. Si `interactive` es `true` (el bloque tiene sus
  propios elementos clicables adentro — un formulario, un acordeón, un
  mapa embebido), `BlockFrame` no aplica el scale de hover/tap para no
  competir con esa interacción interna.
- **`social-icons.ts`** — el mapa de plataforma → ícono (Instagram,
  TikTok, LinkedIn...) que usan tanto `SocialBlock` como `ProfileBlock`,
  para no mantener dos mapas idénticos. lucide-react no incluye íconos de
  marca, así que son estand-ins genéricos (una cámara para Instagram, una
  nota musical para TikTok) documentados en el propio archivo.
- **`ui/color-field.tsx`** y **`ui/field-select.tsx`** — controles de
  formulario genéricos (selector de color, select con label) usados tanto
  por `BlockStylePanel` como por los `settings.tsx` de cada bloque.

## El registro central (`registry.ts`)

```ts
export const BLOCK_REGISTRY: Partial<Record<BlockKind, AnyBlockDefinition>> = {
  LINK: buttonBlockDefinition,
  VIDEO: videoBlockDefinition,
  GALLERY: galleryBlockDefinition,
  // ...
};

export function getBlockDefinition(kind: BlockKind) {
  return BLOCK_REGISTRY[kind];
}
```

`profile-view.tsx` (la página pública) y `link-form-dialog.tsx` (el
formulario de edición del admin) llaman a `getBlockDefinition(link.type)`.
Si devuelve una definición, renderizan `<definition.Preview />` o
`<definition.Settings />` directamente. Si no (un tipo aún no migrado),
caen al camino legacy inline que existía antes de esta arquitectura. Los
dos caminos conviven sin conflicto — no hace falta migrar los 15 bloques
de una sola vez para que el patrón funcione.

## Cómo agregar un bloque nuevo

1. Si el bloque necesita un `LinkType` nuevo (no reutiliza uno existente),
   agrégalo al enum en `apps/api/prisma/schema.prisma` y corre
   `prisma migrate dev`. Si migra un tipo existente (por ejemplo,
   `ProductBlock` migrando `PRODUCT`), no hace falta tocar el schema.
2. Agrega el valor al tipo `LinkType` y a `LINK_TYPE_LABELS` en
   `apps/web/src/types/link.ts`.
3. Crea `blocks/<Nombre>Block/` con los 7 archivos de la tabla de arriba,
   copiando la estructura de un bloque existente similar como plantilla.
4. Importa su `<nombre>BlockDefinition` en `registry.ts` y agrega una
   línea al `BLOCK_REGISTRY`.

Eso es todo. No se toca `profile-view.tsx`, `link-form-dialog.tsx`, ni
ningún otro bloque.

## Bloques implementados

| Bloque | `LinkType` | Reutiliza de `LinkItem` | Datos propios (`meta`) |
|---|---|---|---|
| ButtonBlock | `LINK` | title, url, icon | color, size |
| VideoBlock | `VIDEO` | title, url, imageUrl (thumbnail) | source, autoplay |
| GalleryBlock | `GALLERY` | title | images[], layout |
| TestimonialBlock | `TESTIMONIAL` | title (cita), imageUrl (avatar) | authorName, authorRole, rating |
| FAQBlock | `FAQ` | title (opcional) | items[] (pregunta/respuesta) |
| HeroBlock | `HERO` | title, imageUrl (portada) | avatarUrl, description, buttons[] |
| ProfileBlock | `PROFILE` | title (nombre), imageUrl (foto) | role, location, socials[] |
| ProductBlock | `PRODUCT` | title, url, imageUrl | price, currency, discountPrice, description, buttonLabel |
| ServiceBlock | `SERVICE` | title, url | icon, description, price, currency, buttonLabel |
| ContactBlock | `FORM` | title | mode (form/whatsapp/email/phone), contact |
| SocialBlock | `SOCIAL` | title, url | platform |
| MapBlock | `LOCATION` | title, url (abrir en Maps) | address |
| CountdownBlock | `COUNTDOWN` | title | targetDate, expiredText |
| PricingBlock | `PRICING` | title, url | price, currency, period, features[], buttonLabel, highlighted |
| FooterBlock | `FOOTER` | title (copyright) | links[] |
| WhatsAppBlock | `WHATSAPP` | title, url (fallback) | phone, message |
| EmailBlock | `EMAIL` | title, url (fallback) | email, subject, body |
| MusicBlock | `MUSIC` | title, url | — (el embed se deriva de la URL) |
| TextBlock | `TEXT` | title (opcional) | body, size |
| ImageBlock | `IMAGE` | title (leyenda), imageUrl, url (enlace opcional) | fit |
| CalendarBlock | `CALENDAR` | title, url (link de reservas) | description, buttonLabel |
| CustomHtmlBlock | `CUSTOM_HTML` | — | html, height (ver nota de seguridad abajo) |
| CounterBlock | `COUNTER` | title (etiqueta) | value, prefix, suffix |
| DividerBlock | `DIVIDER` | — | style, label |

Los 24 valores de `LinkType` están registrados — no queda ningún camino
legacy en `profile-view.tsx` ni en `link-form-dialog.tsx`. WhatsAppBlock y
EmailBlock aceptan un teléfono/email (arman el link `wa.me`/`mailto:`
automáticamente) o, si se deja vacío, usan `link.url` tal cual — así las
filas creadas antes de que estos bloques existieran (que ya guardaban una
URL completa) siguen funcionando sin necesidad de una migración de datos.

## Nota de seguridad: `CustomHtmlBlock`

Este es el único bloque cuyo contenido es HTML arbitrario escrito por el
usuario — un vector de XSS obvio si se renderizara con
`dangerouslySetInnerHTML` directo en la página. En vez de eso,
`CustomHtmlBlock/preview.tsx` lo renderiza en un
`<iframe sandbox="allow-same-origin" srcDoc={html}>` sin `allow-scripts`:
un iframe con sandbox y sin ese permiso no ejecuta ningún `<script>` ni
manejador de eventos inline, así que no hay forma de que el HTML pegado
corra JavaScript — sin necesidad de una librería de sanitización nueva.
El costo es que el iframe no puede reportar su propia altura (eso
requeriría JS adentro), así que el usuario fija un alto en píxeles a
mano en vez de que se autoajuste.
