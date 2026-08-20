# Flujo completo del sistema

## 1. Flujo de autenticación (panel admin)

```
Usuario → POST /api/auth/login {email, password}
        ← 200 { accessToken, refreshToken } (Nest: bcrypt.compare + JWT sign)
Next.js route handler /app/api/auth/login
        → guarda accessToken/refreshToken en cookies httpOnly
        → redirige a /admin/dashboard
Cada request desde Server Components a la API adjunta el accessToken
        leído de la cookie (nunca expuesto a JS de cliente).
Al expirar el accessToken → refresh silencioso vía /api/auth/refresh.
```

## 2. Flujo de edición del perfil (admin)

```
/admin/dashboard
   → GET /api/admin/profile           (perfil actual + resumen de stats)

/admin/links
   → GET    /api/admin/links          (lista ordenada)
   → POST   /api/admin/links          (crear enlace)
   → PATCH  /api/admin/links/:id      (editar título/url/icono/estado)
   → PATCH  /api/admin/links/reorder  (persistir drag-and-drop)
   → DELETE /api/admin/links/:id

/admin/design
   → GET  /api/admin/appearance       (tema actual + catálogo de plantillas)
   → PUT  /api/admin/appearance       (colores, fondo, tipografía, plantilla)
   → POST /api/admin/media/upload     (avatar / imágenes de fondo o de enlace)

Cada guardado en el editor dispara un preview en vivo (estado local en el
cliente) + persistencia real vía API; la página pública siempre lee el
último estado persistido (no hay "publicar" manual en la v1: guardar = publicar,
salvo que Profile.isPublished esté en false).
```

## 3. Flujo de la página pública

```
Visitante entra a midominio.com/jhon
   → Next.js Server Component: GET /api/public/jhon
   ← { profile, appearance, links[] } (404 si no existe o isPublished=false)
   → Render SSR con SEO (title/description dinámicos desde Profile)
   → Envía beacon: POST /api/public/jhon/track { type: PAGE_VIEW, device, ... }

Visitante hace click en un enlace
   → Client Component intercepta el click
   → POST /api/public/jhon/track { type: LINK_CLICK, linkId, device, ... }
     (no bloquea la navegación: se dispara con sendBeacon/fetch keepalive)
   → Redirige a la URL destino del enlace
```

## 4. Flujo de analítica

```
AnalyticsModule recibe eventos crudos (PAGE_VIEW / LINK_CLICK) con
device/browser/referrer derivados del User-Agent en el propio backend
(el cliente no reporta datos sensibles, solo dispara el evento).

/admin/analytics
   → GET /api/admin/analytics/summary?range=7d
     agregación en la capa de servicio (no vistas materializadas todavía;
     se documenta como próxima optimización si el volumen crece — ver Fase 5).
```

## 5. Flujo de subida de medios

```
Admin sube una imagen (avatar, fondo, imagen de un enlace)
   → POST /api/admin/media/upload (multipart/form-data)
   → MediaService valida tipo/tamaño → StorageProvider.save()
     (implementación local en disco para desarrollo; misma interfaz
     permite swap a S3/R2 en producción sin tocar controllers/services)
   → devuelve { url } → el frontend guarda esa url en Profile/Link/Appearance
```

## 6. Diagrama de dominio

```
User (1) ── (1) Profile ── (N) Link
              │                │
              │                └─(N) AnalyticsEvent (LINK_CLICK)
              ├─ (1) Appearance ── (N:1) Theme
              └─ (N) AnalyticsEvent (PAGE_VIEW)

User (1) ── (N) Media
```
