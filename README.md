# Bio Personal Platform

Plataforma tipo Linktree para gestionar una página de enlaces personalizada
(`midominio.com/tu-usuario`), pensada hoy para un único usuario administrador
pero arquitecturada para crecer a multiusuario/SaaS sin reescrituras.

Ver el diseño completo en [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) y el
flujo end-to-end en [`docs/FLOW.md`](./docs/FLOW.md).

> Nota: este repositorio también contiene una app Flask de extracción de PDF
> en la raíz (`main.py`, `requirements.txt`, `Procfile`), previa a este
> proyecto. Se dejó intacta; la plataforma Bio Personal vive en `apps/`.

## Estructura

```
apps/
  api/     NestJS — API REST
  web/     Next.js 15 — panel admin + página pública
packages/
  types/   Tipos/DTOs compartidos entre api y web (@bio/types)
docs/      Arquitectura, base de datos y flujo del sistema
```

## Requisitos

- Node.js >= 20
- pnpm 10.x (`corepack enable` si no lo tienes)
- PostgreSQL 14+ (local, Docker, o un proveedor gestionado)

## Puesta en marcha

```bash
# 1. Instalar dependencias del monorepo
pnpm install

# 2. Levantar PostgreSQL local (requiere Docker)
docker compose up -d

# 3. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 4. Migrar y sembrar la base de datos
pnpm db:migrate
pnpm --filter api exec prisma db seed

# 5. Levantar backend y frontend (en dos terminales)
pnpm dev:api    # http://localhost:3001/api
pnpm dev:web    # http://localhost:3000
```

El seed crea 4 temas por defecto y un usuario administrador
(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` en `apps/api/.env`, por defecto
`admin@example.com` / `ChangeMe123!`) con perfil público en `/me`
(`SEED_USERNAME`). **Cambia la contraseña por defecto antes de exponer la
app públicamente.** No uses `admin`, `api`, `login` ni otras rutas del
frontend como username (ver `docs/ARCHITECTURE.md`, sección "usernames
reservados") — el backend las rechaza igualmente.

## Pruebas

```bash
pnpm --filter api test        # unit tests (auth, ownership de enlaces)
pnpm --filter api build       # type-check + build backend
pnpm --filter web build       # type-check + build frontend
```

## Producción

- **Backend**: `pnpm --filter api build && pnpm --filter api start:prod`.
  Aplica migraciones con `prisma migrate deploy` (no `migrate dev`). Sirve
  detrás de HTTPS; `helmet`, CORS y rate limiting (`@nestjs/throttler`) ya
  están configurados, pero deben ejecutarse detrás de un proxy que termine
  TLS (Nginx/Caddy/el balanceador del proveedor).
- **Frontend**: `pnpm --filter web build && pnpm --filter web start`, o
  despliega en Vercel apuntando `API_URL`/`NEXT_PUBLIC_API_URL` al backend.
- **Media**: en un solo servidor, el volumen `STORAGE_LOCAL_PATH` debe
  persistir entre despliegues; para múltiples instancias, implementa un
  `StorageProvider` para S3/R2 (la interfaz ya está lista en
  `apps/api/src/modules/media/storage/`) en vez del local.
- **Secretos**: nunca reutilices los valores de `.env.example` — genera
  `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` aleatorios y una contraseña de
  base de datos propia.

## Estado del proyecto

- [x] **Fase 1** — Arquitectura, estructura de carpetas y diseño de base de datos
- [x] **Fase 2** — Backend NestJS (auth, perfiles, enlaces, apariencia, media, analítica)
- [x] **Fase 3** — Frontend Next.js (landing, login, dashboard, editor, página pública)
- [x] **Fase 4** — Integración completa frontend-backend
- [x] **Fase 5** — Optimización y preparación para crecimiento (rate limiting,
      health check, SEO técnico, tests unitarios)

El camino hacia multiusuario/SaaS (registro, planes, dominios propios) está
documentado en la tabla de `docs/ARCHITECTURE.md#5-preparado-para-saas-sin-implementarlo-ahora`
y no requiere tocar el modelo de datos existente.
