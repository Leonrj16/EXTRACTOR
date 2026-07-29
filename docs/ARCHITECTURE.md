# Arquitectura — Bio Personal Platform

## 1. Visión general

Plataforma tipo Linktree para uso **personal** hoy, con una arquitectura que **no
necesita reescritura** para convertirse en un producto multiusuario / SaaS mañana.

La estrategia central es: **modelar el dominio como si ya fuera multiusuario**
(cada recurso cuelga de un `User` → `Profile`), pero **exponer solo un usuario
administrador** en la capa de aplicación (auth, UI, rutas). Cuando se decida
abrir registro público, se agregan endpoints de signup, roles y billing — el
esquema de datos y los módulos del backend no cambian de forma.

```
                    ┌─────────────────────────┐
                    │        Cliente          │
                    │  Next.js 15 (App Router)│
                    │  /admin/*   /[username]  │
                    └────────────┬────────────┘
                                 │ REST (JSON, HTTPS)
                                 ▼
                    ┌─────────────────────────┐
                    │        NestJS API        │
                    │  Auth · Profile · Links   │
                    │  Appearance · Media       │
                    │  Analytics · Public       │
                    └────────────┬────────────┘
                                 │ Prisma Client
                                 ▼
                    ┌─────────────────────────┐
                    │       PostgreSQL          │
                    └─────────────────────────┘
```

## 2. Monorepo

```
/
├── apps/
│   ├── api/     → NestJS (backend, API REST)
│   └── web/     → Next.js 15 (frontend, admin + página pública)
├── packages/
│   └── types/   → DTOs / tipos TypeScript compartidos entre api y web
├── docs/        → Documentación de arquitectura, BD y flujos
├── docker-compose.yml → Postgres local
└── pnpm-workspace.yaml
```

Se usa **pnpm workspaces** (sin Turborepo por ahora, se puede añadir después
sin fricción) porque:
- Un solo lockfile, instalación rápida por hard-linking.
- `packages/types` permite compartir DTOs/interfaces entre frontend y backend
  sin duplicar contratos ni acoplar los proyectos entre sí.
- Cada app mantiene su propio ciclo de build/deploy (el frontend puede vivir
  en Vercel, el backend en Railway/Render/Fly.io, cada uno con su propio
  Dockerfile).

Frontend y backend están **completamente separados**: el frontend nunca toca
la base de datos directamente, solo habla HTTP con la API. Esto es lo que
permite, más adelante, tener múltiples frontends (app pública, app móvil,
panel interno) contra la misma API sin duplicar lógica de negocio.

## 3. Backend (NestJS)

### 3.1 Principios
- **Arquitectura modular por dominio**, no por capa técnica: cada módulo de
  Nest (`auth`, `users`, `profiles`, `links`, `appearance`, `media`,
  `analytics`, `public`) encapsula su controller, service, DTOs y tests.
- **Nada de lógica de negocio en los controllers.** Los controllers solo
  validan input (DTOs + `class-validator`) y delegan a servicios.
- **Prisma como única puerta a la base de datos**, encapsulado en un
  `PrismaModule` global inyectable — ningún otro módulo importa `@prisma/client`
  directamente fuera de sus propios repositorios/servicios.
- **Guards y decoradores para auth/roles desde el día uno**, aunque hoy solo
  exista el rol `ADMIN`. Así, cuando se agreguen usuarios normales, no hay que
  tocar cada endpoint: solo se relaja el guard existente.

### 3.2 Estructura de carpetas (`apps/api/src`)

```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/       (@CurrentUser, @Roles, @Public)
│   ├── guards/           (JwtAuthGuard, RolesGuard)
│   ├── filters/          (HttpExceptionFilter)
│   ├── interceptors/     (TransformInterceptor, LoggingInterceptor)
│   └── pipes/
├── config/               (env validation, configuración tipada)
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── modules/
│   ├── auth/             (login, refresh, JWT strategy)
│   ├── users/             (usuario administrador, futuros roles)
│   ├── profiles/          (perfil público administrable)
│   ├── links/              (CRUD de enlaces/bloques)
│   ├── appearance/         (temas, colores, tipografía)
│   ├── media/               (subida de imágenes)
│   ├── analytics/            (tracking de visitas/clics)
│   └── public/                (endpoints públicos de solo lectura para /:username)
└── prisma/schema.prisma
```

Cada carpeta de `modules/*` es autocontenida (`*.module.ts`, `*.controller.ts`,
`*.service.ts`, `dto/`, `entities/`), evitando el acoplamiento típico donde un
"UserService" gigante termina conociendo todo el sistema.

### 3.3 Autenticación

- Login con email + password (`bcrypt` para el hash).
- JWT de acceso de corta duración + refresh token (rotable, guardado
  hasheado) — preparado para revocación de sesiones cuando haya multiusuario.
- `RolesGuard` + decorador `@Roles('ADMIN')` ya protegiendo `/admin/*`, aunque
  hoy solo exista un usuario con rol `ADMIN`.
- Endpoint de **signup deliberadamente no existe todavía**: el usuario admin
  se crea por seed (`prisma db seed`). Cuando el producto se abra a más
  usuarios, se agrega `POST /auth/register` sin tocar el resto del módulo.

### 3.4 API pública vs. API administrativa

- `/api/admin/**` → protegida por JWT, CRUD completo sobre el perfil propio.
- `/api/public/:username` → sin auth, solo lectura, cacheable (usada por la
  página pública `/[username]` y sirve de base a un futuro rate limiting por
  IP para evitar scraping).
- `/api/public/:username/track` → registra visitas/clics (analítica),
  también sin auth pero con rate limiting.

## 4. Frontend (Next.js 15)

### 4.1 Estructura de carpetas (`apps/web/src`)

```
src/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx              → landing "/"
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx             → layout protegido (chequea sesión)
│   │   ├── dashboard/page.tsx
│   │   ├── links/page.tsx
│   │   ├── design/page.tsx        → editor visual
│   │   └── analytics/page.tsx
│   └── [username]/
│       └── page.tsx               → página pública del perfil
├── components/
│   ├── ui/                        → primitivas shadcn/ui
│   ├── admin/                     → componentes del panel
│   └── public-profile/            → componentes de la página pública
├── lib/
│   ├── api-client.ts               → wrapper fetch tipado hacia la API
│   ├── auth.ts                     → manejo de sesión (cookies httpOnly)
│   └── utils.ts
├── hooks/
├── types/                          → reexporta packages/types
└── styles/
```

- **App Router** con Server Components por defecto; la página pública
  `/[username]` se renderiza en el servidor (SSR/ISR) para SEO y velocidad,
  y solo los bloques interactivos (botones con animación, formularios) son
  Client Components.
- **Server Actions / route handlers propios de Next.js NO se usan para
  hablar con Postgres.** Todo pasa por la API NestJS, incluso desde Server
  Components (`fetch` server-side hacia `apps/api`). Esto mantiene una única
  fuente de verdad para las reglas de negocio y permite reusar la API desde
  otros clientes en el futuro.
- Sesión del panel admin vía **cookie httpOnly** seteada por un route handler
  puente (`/app/api/auth/*`) que reenvía a NestJS — así el JWT nunca queda
  expuesto a JS en el navegador.

### 4.2 UI/UX

- Tailwind CSS + shadcn/ui como sistema de componentes base (consistente,
  accesible, fácil de theming vía CSS variables).
- Framer Motion para micro-interacciones (entrada de botones, hover states,
  transición del editor).
- El editor visual escribe una configuración de `Appearance` (colores, fondo,
  tipografía, plantilla) que la página pública consume — el mismo modelo de
  datos alimenta preview en vivo dentro del admin y el render público.

## 5. Preparado para SaaS (sin implementarlo ahora)

No se implementa pagos/planes/suscripciones, pero el diseño no los bloquea:

| Futuro | Cómo se agrega sin romper nada |
|---|---|
| Registro de usuarios | `POST /auth/register` nuevo + relajar `RolesGuard` en rutas ya existentes |
| Múltiples perfiles por usuario (agencias) | `Profile.userId` ya es FK 1-N lista para dejar de ser 1-1 |
| Planes / suscripciones | Nueva tabla `Subscription` + `Plan`, referenciando `User.id`; no toca `Profile`, `Link`, `Analytics` |
| Feature flags por plan | Guard adicional (`PlanGuard`) que lee `Subscription.plan` — se añade a los mismos controllers ya modulares |
| Dominios personalizados | Campo `Profile.customDomain` (ya nullable en el schema) + verificación DNS como módulo nuevo |
| Multi-tenant a nivel de datos | Ya existe: cada fila de `Link`/`Analytics`/`Media` cuelga de `profileId`/`userId`, nunca de un singleton global |

## 6. Stack y decisiones clave

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js 15 + React + TS | SSR/ISR para SEO en la página pública, App Router moderno |
| UI | Tailwind + shadcn/ui + Framer Motion | Velocidad de desarrollo con diseño premium y consistente |
| Backend | NestJS + TS | Arquitectura modular, DI, guards/interceptors listos para crecer |
| ORM | Prisma | Migraciones versionadas, tipado end-to-end, DX excelente |
| DB | PostgreSQL | Relacional, robusto, soporta bien el crecimiento a multiusuario |
| Auth | JWT (access + refresh) vía Passport | Estándar, stateless, fácil de escalar a OAuth social después |
| Imágenes | Almacenamiento local en dev vía `MediaModule`, abstraído detrás de un `StorageProvider` | Cambiar a S3/Cloudflare R2 en producción sin tocar el resto del código |
