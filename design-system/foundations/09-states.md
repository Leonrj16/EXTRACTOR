# Estados

Matriz de estados interactivos y de contenido. Todo componente que
interactúa con el usuario debe implementar los estados que le apliquen de
esta tabla — no un subconjunto ad hoc.

## Estados de interacción (por componente)

| Estado | Mecanismo | Ejemplo |
|---|---|---|
| **Default (reposo)** | `surface-2`/`surface-3` + `border` | Input sin foco, Card sin hover |
| **Hover** | Sube un escalón en la escala de superficie (`surface-5`/`surface-6`) y/o borde (`border-strong`/`border-hover`) | Botón, ítem de sidebar, fila de enlace |
| **Focus (teclado/lector)** | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40` — **nunca** `focus:` a secas (ese también dispara con click de mouse) | Input, Button, NativeSelect |
| **Active/Pressed** | `active:translate-y-px` (botones) o `surface-6` sostenido | Botón al hacer click |
| **Selected/Current** | `aria-current="page"` + pill animado (`layoutId`) | Ítem de sidebar activo |
| **Expanded** | `aria-expanded:bg-surface-6` | Trigger de dropdown abierto |
| **Disabled** | `disabled:pointer-events-none disabled:opacity-50` (o `disabled:cursor-not-allowed` en inputs) | Botón "Guardando…", campo bloqueado |
| **Invalid / error** | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20` | Input con validación fallida |

## Estados de contenido (a nivel de pantalla)

| Estado | Patrón visual | Ejemplo |
|---|---|---|
| **Loading (acción)** | Texto del botón cambia a gerundio + el propio `disabled` (`"Guardando…"`, `"Enviando…"`) — sin spinner adicional salvo en `Toaster` (`Loader2Icon` girando) | Guardar perfil, enviar formulario de contacto |
| **Loading (contenido)** | Reservado para Server Components con Suspense; hoy la mayoría de datos se resuelven en el servidor antes del render, por lo que no hay skeletons en el admin | — |
| **Empty (vacío)** | Caja con `border border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground` — mismo patrón exacto en las 4 pantallas que lo necesitan | "Todavía no hay clics…", "No hay mensajes…", lista de enlaces vacía |
| **Success (confirmación puntual)** | `toast.success(...)` (Sonner) — nunca un `alert()` ni un mensaje inline que desplace layout | Perfil guardado, enlace copiado |
| **Success (persistente)** | Reemplazo de contenido in-place con mensaje + icono | Formulario de contacto tras enviar (`FormBlock`: `sent === true`) |
| **Error (puntual)** | `toast.error(...)` | Fallo al subir imagen, fallo al guardar |
| **Error (de formulario)** | `<p className="text-xs text-destructive">` bajo el campo/bloque afectado | Envío fallido del formulario de contacto público |
| **Not published / draft** | `Badge variant="warning"` | "Sin publicar" en el dashboard |

## Reglas de uso

1. **Todo elemento clicable custom** (no solo `Button`/`Input`, también
   `<a>`/`<button>` a mano en `sidebar.tsx`, `header.tsx`,
   `sortable-link-row.tsx`) debe tener `outline-none` +
   `focus-visible:ring-2 focus-visible:ring-ring/40` explícito. Un
   elemento interactivo sin anillo de foco visible es un defecto de
   accesibilidad, no un detalle opcional.
2. **`disabled` siempre baja la opacidad a 50%** (`disabled:opacity-50`) —
   nunca se oculta el elemento ni se cambia solo el cursor.
3. **El estado vacío nunca es un simple texto suelto** — siempre la caja
   con borde punteado de la tabla de arriba, para que "no hay datos" se
   lea como un estado de diseño intencional y no como contenido faltante
   por error.
4. **Toasts para confirmaciones que no requieren decisión del usuario**;
   `Dialog` (con foco atrapado) solo cuando la acción necesita una
   decisión o entrada de datos.
