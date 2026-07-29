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
- Docker (para PostgreSQL local) — opcional si ya tienes Postgres

## Puesta en marcha

```bash
# 1. Instalar dependencias del monorepo
pnpm install

# 2. Levantar PostgreSQL local
docker compose up -d

# 3. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 4. Migrar la base de datos
pnpm db:migrate

# 5. Levantar backend y frontend (en dos terminales)
pnpm dev:api    # http://localhost:3001/api
pnpm dev:web    # http://localhost:3000
```

## Estado del proyecto

- [x] **Fase 1** — Arquitectura, estructura de carpetas y diseño de base de datos
- [ ] **Fase 2** — Backend NestJS (auth, perfiles, enlaces, apariencia, media, analítica)
- [ ] **Fase 3** — Frontend Next.js (landing, login, dashboard, editor, página pública)
- [ ] **Fase 4** — Integración completa frontend-backend
- [ ] **Fase 5** — Optimización y preparación para crecimiento
