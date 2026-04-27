# 14 — Complete Implementation Plan

**Date:** 2026-04-24  
**Last Updated:** 2026-04-27  
**Status:** 🟢 Phase 0 complete — Phase 0.5 (Swagger) complete — Phase 1.1 backend + auth tests complete — Phase 1.2 backend + admin UI complete — Phase 1.2 backend complete — Phase 1.2 frontend complete — Phase 1.3 backend complete — Phase 1.3 frontend complete  
**Monorepo:** `ybr-plataform/platform/`

> ℹ️ **SCOPE NOTE (2026-04-27):** Checkout, payment processing, and the sales/landing page have been removed from this project. Those concerns are handled by a separate project. Enrollments in this platform are managed externally (e.g., via webhook from the payment system) and must not depend on Stripe or any payment gateway here.

> ⚠️ **MANDATORY RULE:** Every agent that completes a task MUST immediately mark the corresponding item with `[x]` in this document before finishing. This file is the single source of truth for what has been done.

> 📖 **LANGUAGE STANDARD:** This is the canonical (English) version of the implementation plan. The Portuguese version is available at `docs/pt-br/14-implementation-plan.md`.

---

## How to Use This Document

This is the **master execution document** for YBR Platform. Each item is a concrete, sequential step. Mark `[x]` when complete. Before starting any step, consult the agent listed as **Owner**.

**Status legend:**

- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Complete

**Available agents:**

- `po-orchestrator` — Product decisions, architecture, orchestration
- `nodejs-especialist` — Backend (Fastify, Drizzle, integrations)
- `react-senior-engineer` — Frontend (Next.js, UI, integrations)
- `qa-tester` — Automated testing
- `full-stack-bug-fixer` — Bugs and broken integrations
- `react-native-specialist` — Mobile app (Phase 3+)

---

## PHASE 0 — Structure & Setup (Week 1–2)

### 0.1 — Monorepo Initial Scaffolding

> **Owner:** `po-orchestrator` + manual execution  
> **Location:** `ybr-plataform/platform/`

#### Root files checklist

- [x] `platform/package.json` — Workspace root
- [x] `platform/pnpm-workspace.yaml` — pnpm workspace config
- [x] `platform/turbo.json` — Turborepo pipeline
- [x] `platform/biome.json` — Global lint/format config
- [x] `platform/tsconfig.base.json` — Shared TypeScript base
- [x] `platform/.gitignore` — Ignore node_modules, .env, dist, .next
- [x] `platform/.env.example` — Root environment variables template
- [x] `platform/docker-compose.yml` — Postgres + Redis for local dev
- [x] `platform/README.md` — Setup instructions

---

### 0.2 — Root Configuration Files

> **Owner:** `nodejs-especialist`

**Checklist:**

- [x] `package.json` created and validated
- [x] `pnpm-workspace.yaml` created
- [x] `turbo.json` created
- [x] `biome.json` created
- [x] `tsconfig.base.json` created
- [x] `.gitignore` created

---

### 0.3 — Package: `packages/database`

> **Owner:** `nodejs-especialist`

**Entities defined in Drizzle schema:**

> ⚠️ **Scope note:** `payments` and `coupons` tables have been removed — payment processing is handled by a separate project. Enrollments are created via an external webhook (`POST /webhooks/enrollment`) triggered by the payment system.

| Table                | Key fields                                                                                         | Notes                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `users`              | id (uuidv7), email, password_hash, name, avatar_url, role, timestamps                              | role: `student \| creator \| admin`                                           |
| `creators`           | id, user_id FK, bio, website, plan, timestamps                                                     | plan: `starter \| growth \| pro \| agency`                                    |
| `courses`            | id, creator_id FK, title, slug, description, thumbnail_url, status, language, timestamps           | status: `draft \| published \| archived`                                      |
| `course_modules`     | id, course_id FK, title, description, position, is_published                                       | Ordered by `position`                                                         |
| `lessons`            | id, module_id FK, title, bunny_video_id, mux_asset_id, mux_playback_id, duration_seconds, position | Phase 1: bunny*video_id. Phase 2+: mux*\*                                     |
| `lesson_attachments` | id, lesson_id FK, title, file_url, file_type, file_size_bytes                                      | file_type: `pdf \| doc \| spreadsheet \| link`                                |
| `enrollments`        | id, user_id FK, course_id FK, status, expires_at, enrolled_at, completed_at, external_ref          | status: `active \| expired \| revoked`. external_ref = ID from payment system |
| `lesson_progress`    | id, user_id FK, lesson_id FK, watched_seconds, completed_at, last_watched_at                       |                                                                               |
| `certificates`       | id, user_id FK, course_id FK, enrollment_id FK, certificate_url, verification_code, issued_at      |                                                                               |

**Checklist:**

- [x] `packages/database/package.json` configured with Drizzle + Neon
- [x] `packages/database/src/client.ts` — connection via `DATABASE_URL`
- [x] All 9 table schemas defined (payments and coupons removed — managed externally)
- [x] `drizzle.config.ts` configured
- [x] Initial migration generated with `drizzle-kit generate` (`0000_fast_molten_man.sql`)
- [x] Migration applied to Neon (dev) _(local docker-compose — Neon pending for production)_
- [x] Basic seeds created (`pnpm db:seed` — admin@ybr.dev, criador@ybr.dev, aluno@ybr.dev)

---

### 0.4 — Package: `packages/schemas`

> **Owner:** `nodejs-especialist`

**Checklist:**

- [x] Auth schemas (`register`, `login`, `forgot-password`, `reset-password`)
- [x] Course, module and lesson schemas
- [x] Progress and certificate schemas
- [x] Enrollment schema (external webhook payload validation)
- [x] Package exporting all schemas with inferred types (`z.infer<typeof schema>`)

---

### 0.5 — Package: `packages/types`

> **Owner:** `nodejs-especialist`

**Checklist:**

- [x] `ApiResponse<T>` and `PaginatedResponse<T>` defined
- [x] Domain types for all entities
- [x] Package exporting everything via barrel export

---

### 0.6 — Package: `packages/hls-player`

> **Owner:** `react-senior-engineer`

**Checklist:**

- [x] `HLSPlayer.tsx` copied and adapted from `ybr-plataform/video-player/index.ts`
- [x] Props `HLSPlayerProps` and `HLSTrackProps` exported
- [ ] `tsup.config.ts` for dual build (ESM + CJS) _(not needed until publishing)_
- [ ] Package builds without errors _(not needed until publishing)_

---

### 0.7 — Package: `packages/ui`

> **Owner:** `react-senior-engineer`

**Checklist:**

- [x] `package.json` with React + TailwindCSS peer dependencies
- [x] `cn()` utility available via `@ybr/ui`
- [ ] Base Shadcn components installed _(to implement in Phase 1 with screens)_
- [x] Color tokens via CSS variables in `globals.css` of each app

---

### 0.8 — App: `apps/api` — Scaffold

> **Owner:** `nodejs-especialist`

**Checklist:**

- [x] Folder structure created
- [x] `package.json` with all dependencies
- [x] `server.ts` and `app.ts` with Fastify bootstrapped
- [x] JWT plugin configured
- [x] Swagger plugin configured
- [x] `GET /health` endpoint working
- [x] Multi-stage `Dockerfile` created
- [x] Local `biome.json` configured

---

### 0.9 — App: `apps/web` — Scaffold

> **Owner:** `react-senior-engineer`

**Checklist:**

- [x] Folder structure created
- [x] `package.json` with all dependencies
- [x] `globals.css` with all color tokens
- [x] `layout.tsx` with `next/font` loading DM Serif Display + Inter
- [x] `middleware.ts` protecting `/dashboard`, `/meus-cursos`, `/cursos/*`
- [x] `next.config.ts` configured (standalone output for Docker)
- [x] Multi-stage `Dockerfile` created
- [x] i18n setup with `next-intl` — `routing.ts`, `request.ts`, messages (`en/pt-BR/es`), `[locale]/layout.tsx`, `middleware.ts`, `next.config.ts` all configured

---

### 0.10 — App: `apps/admin` — Scaffold

> **Owner:** `react-senior-engineer`

**Checklist:**

- [x] Folder structure created
- [x] `package.json` with dependencies
- [x] `globals.css` with matching color tokens
- [x] i18n setup with `next-intl` — `routing.ts`, `request.ts`, messages (`en/pt-BR/es`), `[locale]/layout.tsx`, `middleware.ts`, `next.config.ts` all configured
- [ ] Admin shell with navigation sidebar _(implemented in 1.2)_
- [ ] Auth middleware + `creator`/`admin` role verification _(implemented in 1.2)_

---

### 0.11 — Docker Compose for Local Development

> **Owner:** `nodejs-especialist`

**Checklist:**

- [x] `docker-compose.yml` created
- [x] `.env.example` at root created
- [ ] `docker compose up -d` starts Postgres + Redis without errors _(requires local `.env` setup)_
- [ ] `.env.local` configured locally (not committed) _(manual user action)_
- [x] `pnpm install` runs without errors (519 packages installed)
- [ ] `pnpm dev` starts all apps _(requires Neon + Upstash accounts)_

---

### 0.12 — CI/CD: GitHub Actions

> **Owner:** `nodejs-especialist` + manual secrets setup

**Checklist:**

- [x] `ci.yml` created
- [x] `deploy.yml` created
- [ ] GitHub secrets configured: `VERCEL_TOKEN`, `RAILWAY_TOKEN`, `GHCR_TOKEN` _(manual user action)_
- [x] `pnpm type-check` passing on all 3 apps (admin, web, api)

---

### 0.13 — i18n: Internationalization Setup

> **Owner:** `react-senior-engineer`  
> **Supported locales:** `en` (English US — default), `pt-BR` (Portuguese Brazil), `es` (Spanish)

This setup uses `next-intl` for both `apps/web` and `apps/admin`.

**Approach:**

- `[locale]` dynamic segment in App Router
- Locale detection via middleware (Accept-Language header + cookie)
- Message files per locale in `messages/`
- TypeScript-safe message keys

**File structure for each app:**

```
apps/web/
├── messages/
│   ├── en.json         # English (default)
│   ├── pt-BR.json      # Portuguese (Brazil)
│   └── es.json         # Spanish
├── src/
│   ├── i18n/
│   │   ├── routing.ts  # Locale config
│   │   └── request.ts  # Server-side i18n request
│   ├── app/
│   │   └── [locale]/
│   │       ├── layout.tsx   # Root layout with NextIntlClientProvider
│   │       ├── page.tsx
│   │       ├── (auth)/
│   │       ├── (student)/
│   │       └── (public)/
│   └── middleware.ts    # next-intl middleware (replaces previous)
└── next.config.ts       # withNextIntl() plugin
```

**Checklist:**

- [x] `next-intl` installed in `apps/web` and `apps/admin`
- [x] `src/i18n/routing.ts` created in both apps
- [x] `src/i18n/request.ts` created in both apps
- [x] `messages/en.json`, `messages/pt-BR.json`, `messages/es.json` created in both apps
- [x] `src/app/[locale]/layout.tsx` created in both apps
- [x] `src/middleware.ts` updated to use `next-intl` middleware
- [x] `next.config.ts` updated with `withNextIntl()` plugin
- [x] `LocaleSwitcher` component created in both apps
- [ ] All user-facing strings extracted to message files _(done incrementally as pages are built)_

---

## PHASE 0.5 — API Documentation Standards (Week 2–3)

> **Owner:** `nodejs-especialist`  
> **Mandatory rule:** Every API route implemented from this point on MUST be documented in Swagger before the task is considered complete. No route is accepted without correct Swagger annotations in English.

### 0.14 — Swagger Configuration & Standards

This phase establishes the complete OpenAPI/Swagger foundation that all future API routes must follow. It runs in parallel with the end of Phase 0 and MUST be completed before any Phase 1 routes are implemented.

#### What to implement

1. **Enhanced Swagger bootstrap** in `apps/api/src/app.ts`:
   - Security schemes: `BearerAuth` (JWT)
   - Global tag definitions (one per domain)
   - Server URLs per environment
   - Contact and license metadata

2. **Swagger helper modules** in `apps/api/src/swagger/`:
   - `tags.ts` — Canonical tag list with descriptions
   - `security.ts` — Reusable security requirement objects
   - `responses.ts` — Standard response schema helpers (`ApiResponse<T>`, error bodies)

3. **Document all existing routes** (currently only `/health`)

4. **Developer guide** in `apps/api/src/swagger/README.md` — Pattern reference for annotating new routes

#### Tag definitions (all routes must use one of these)

| Tag             | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `health`        | Service health check                                       |
| `auth`          | Authentication — register, login, tokens, passwords        |
| `admin/courses` | Creator course management (protected: creator role)        |
| `admin/modules` | Module CRUD within courses (protected: creator role)       |
| `admin/lessons` | Lesson CRUD within modules (protected: creator role)       |
| `student`       | Student-facing data — enrollments, progress                |
| `webhooks`      | External system callbacks (enrollment from payment system) |
| `certificates`  | Certificate generation and verification                    |

#### Mandatory Swagger annotation pattern (all future routes)

Every route MUST include the following in its schema:

```typescript
schema: {
  tags: ['<domain-tag>'],          // Required — one of the canonical tags above
  summary: 'Short action summary', // Required — max 60 chars, plain English
  description: 'Full description', // Optional — longer context, markdown ok
  security: [{ BearerAuth: [] }],  // Required for protected routes only
  body: z.object({ ... }),         // Required if POST/PATCH/PUT
  params: z.object({ ... }),       // Required if route has URL params
  querystring: z.object({ ... }),  // Required if route has query params
  response: {
    200: z.object({ ... }),        // Required — document success shape
    400: z.object({ ... }),        // Required if validation errors possible
    401: z.object({ ... }),        // Required for protected routes
    404: z.object({ ... }),        // Required if resource can be not found
  },
}
```

#### Checklist

- [x] Swagger plugins installed (`@fastify/swagger`, `@fastify/swagger-ui`)
- [x] Basic Swagger registration in `app.ts`
- [x] Security scheme `BearerAuth` added to Swagger config
- [x] All canonical tags registered with descriptions
- [x] Server URLs added for dev, staging, and production
- [x] `src/swagger/tags.ts` created
- [x] `src/swagger/security.ts` created
- [x] `src/swagger/responses.ts` created
- [x] `GET /health` fully annotated with tag, summary, response schema
- [x] `src/swagger/README.md` developer guide created
- [x] Swagger UI accessible at `http://localhost:3002/docs` with no errors

---

## PHASE 1 — MVP (Week 3–8)

> ⚠️ **SWAGGER REQUIREMENT:** Every route implemented in Phase 1 and beyond MUST include complete Swagger annotations (tags, summary, response schemas, security) in English before the task can be marked `[x]`. Routes without Swagger docs are considered incomplete.

### 1.1 — Authentication (Week 3)

#### Backend — `nodejs-especialist`

| Method | Route                   | Description                                                                 |
| ------ | ----------------------- | --------------------------------------------------------------------------- |
| `POST` | `/auth/register`        | Register with email + password. bcrypt hash. Send welcome email.            |
| `POST` | `/auth/login`           | Returns `{ accessToken, refreshToken, user }`. Access: 15min, Refresh: 30d. |
| `POST` | `/auth/refresh`         | Receives refreshToken, returns new accessToken.                             |
| `POST` | `/auth/logout`          | Invalidates refreshToken in Redis.                                          |
| `POST` | `/auth/forgot-password` | Generates 6-char token, stores in Redis (TTL 1h), sends email.              |
| `POST` | `/auth/reset-password`  | Validates Redis token, updates password, invalidates token.                 |
| `GET`  | `/auth/me`              | Returns authenticated user data (requires JWT).                             |

**Security requirements:**

- Rate limiting on `/auth/login` and `/auth/forgot-password` (5 req/min)
- Constant-time password comparison (bcrypt)
- RefreshToken stored as hash in Redis (not raw token)
- Access token with minimal payload (`{ sub: userId, role }`)

**Checklist:**

- [x] Zod schemas for all endpoints
- [x] Functions layer: `registerUser`, `loginUser`, `refreshToken`, `forgotPassword`, `resetPassword`
- [x] Infrastructure: `email/auth-emails.ts` — Resend templates (welcome, recovery)
- [x] JWT plugin configured in `plugins/auth.ts`
- [x] Unit tests for each function (`qa-tester`)
- [x] Route integration tests for all 7 `/auth/*` endpoints (`qa-tester`) — 111 tests, 14 test files, all passing

#### Frontend — `react-senior-engineer`

**Layout reference:** `ybr-plataform/layout/desktop-layout/login_desktop/code.html`

Pages to implement (design: Artisanal Sophistication, all UI text via i18n):

| Page            | Route                | Base layout               |
| --------------- | -------------------- | ------------------------- |
| Login           | `/[locale]/login`    | `login_desktop/code.html` |
| Register        | `/[locale]/register` | Derived from login        |
| Forgot Password | `/[locale]/forgot`   | Derived from login        |
| Reset Password  | `/[locale]/reset`    | Derived from login        |

**Checklist:**

- [x] Pages created with React Hook Form + schemas from `packages/schemas`
- [x] API client: `lib/api/auth.ts` with methods `login()`, `register()`, `forgotPassword()`, `resetPassword()`
- [x] Zustand store for auth state (`useAuthStore`)
- [x] Next.js middleware protecting authenticated routes
- [x] Auto-redirect to `/dashboard` after login
- [x] All UI strings via `next-intl` message keys (no hardcoded text) — pt-BR, en, es
- [x] Placeholder `/dashboard` page in `apps/web` (avoids 404 on post-login redirect)
- [x] Placeholder `/dashboard` page in `apps/admin` (avoids 404 on post-login redirect)

---

### 1.2 — Course Management — Admin Panel (Week 3–4)

#### Backend — `nodejs-especialist`

| Method   | Route                              | Description                                   |
| -------- | ---------------------------------- | --------------------------------------------- |
| `GET`    | `/admin/courses`                   | List courses for the authenticated creator    |
| `POST`   | `/admin/courses`                   | Create new course (status: draft)             |
| `GET`    | `/admin/courses/:id`               | Full course details                           |
| `PATCH`  | `/admin/courses/:id`               | Update course data                            |
| `DELETE` | `/admin/courses/:id`               | Soft delete (status: archived)                |
| `POST`   | `/admin/courses/:id/publish`       | Publish course (status: published)            |
| `POST`   | `/admin/courses/:courseId/modules` | Create module                                 |
| `PATCH`  | `/admin/modules/:moduleId`         | Update module                                 |
| `DELETE` | `/admin/modules/:moduleId`         | Remove module                                 |
| `PATCH`  | `/admin/modules/reorder`           | Reorder modules (array of `{ id, position }`) |
| `POST`   | `/admin/modules/:moduleId/lessons` | Create lesson                                 |
| `PATCH`  | `/admin/lessons/:lessonId`         | Update lesson                                 |
| `DELETE` | `/admin/lessons/:lessonId`         | Remove lesson                                 |
| `POST`   | `/admin/courses/:id/thumbnail`     | Upload thumbnail to R2                        |
| `POST`   | `/admin/lessons/:id/video`         | Generate upload URL for Bunny Stream          |

**Checklist:**

- [x] All routes with Zod validation — 15 routes fully annotated with Swagger
- [x] Authorization middleware: `requireCreator` and `requireAdmin` decorators in `plugins/auth.ts`
- [x] Cloudflare R2 integration for thumbnails — `infrastructure/storage/r2.ts` + `upload-thumbnail.ts`
- [x] Bunny Stream API integration for video upload — `infrastructure/video/bunny.ts` with TUS credentials + SHA-256 signing
- [x] CRUD route tests — 31 new tests (142 total, all passing)

#### Frontend — `react-senior-engineer`

> ⚠️ **Layout references (mandatory):**
>
> | Screen                             | Layout file                                       |
> | ---------------------------------- | ------------------------------------------------- |
> | Dashboard                          | `layout/admin-layout/admin_dashboard_desktop/`    |
> | Gestão de Cursos                   | `layout/admin-layout/gest_o_de_cursos_desktop/`   |
> | Editor de Conteúdo (módulos/aulas) | `layout/admin-layout/editor_de_conte_do_desktop/` |
>
> For each screen: read `code.html` first, view `screen.png` as visual target. See `docs/15-layout-reference.md` for full instructions.

**Checklist:**

- [x] `apps/admin/src/lib/api/courses.ts` — Full fetch-based API client (courses, modules, lessons, thumbnail)
- [x] `apps/admin/src/lib/types/courses.ts` — TypeScript interfaces for Course, Module, Lesson, CourseWithModules
- [x] `apps/admin/src/app/[locale]/(admin)/layout.tsx` — Admin shell with responsive sidebar (lucide-react icons)
- [x] `apps/admin/src/components/layout/admin-sidebar.tsx` — Sidebar with nav links + logout
- [x] `/[locale]/(admin)/cursos/page.tsx` — Course list: table, status badges, publish/archive actions, loading/empty states
- [x] `/[locale]/(admin)/cursos/novo/page.tsx` — Create course form with thumbnail upload preview
- [x] `/[locale]/(admin)/cursos/[courseId]/editar/page.tsx` — Edit course form (pre-populated)
- [x] `/[locale]/(admin)/cursos/[courseId]/conteudo/page.tsx` — Module/lesson editor with ↑↓ reorder, inline forms
- [x] All UI strings via `next-intl` message keys (pt-BR, en, es)
- [x] Admin login page — `apps/admin/src/app/[locale]/login/page.tsx` with role validation (creator/admin only)
- [x] Admin auth store — `apps/admin/src/stores/auth.ts` (Zustand, cookie + localStorage)
- [ ] Drag-and-drop module reordering _(deferred to Phase 2 — implemented with ↑↓ buttons)_

#### Frontend — `react-senior-engineer` ✅ 2026-04-25

> ✅ **Layout review completed (2026-04-27):** Admin screens reviewed and updated to match layout references.

- [x] Admin screens reviewed and updated to match layout references

- [x] `apps/admin/src/lib/types/courses.ts` — TypeScript interfaces matching backend schemas
- [x] `apps/admin/src/lib/api/courses.ts` — Fetch-based API client for all course/module/lesson endpoints
- [x] `apps/admin/src/lib/utils/token.ts` — Cookie token reader utility
- [x] `apps/admin/src/components/layout/admin-sidebar.tsx` — Sidebar with navigation links (Client Component)
- [x] `apps/admin/src/app/[locale]/(admin)/layout.tsx` — Admin layout wrapping all protected pages
- [x] `apps/admin/src/app/[locale]/(admin)/dashboard/page.tsx` — Dashboard moved into admin route group
- [x] `apps/admin/src/app/[locale]/(admin)/cursos/page.tsx` — Course list with loading/empty/error states
- [x] `apps/admin/src/app/[locale]/(admin)/cursos/novo/page.tsx` — Create course form (title, description, price, currency, language, thumbnail)
- [x] `apps/admin/src/app/[locale]/(admin)/cursos/[courseId]/editar/page.tsx` — Edit course form (pre-populated)
- [x] `apps/admin/src/app/[locale]/(admin)/cursos/[courseId]/conteudo/page.tsx` — Module/lesson editor with ↑↓ reorder, inline add/edit/delete
- [x] i18n messages updated (pt-BR, en, es) with new keys: `courses.status.*`, `courses.form.currency*`, `courses.form.language*`, `courses.table.*`, `modules.deleteConfirm`, `lessons.deleteConfirm`
- [x] `apps/admin/globals.css` — Migrated from `:root {}` to `@theme {}` enabling Tailwind v4 utility classes (`bg-primary`, `text-on-surface`, etc.)
- [x] `pnpm --filter admin build` passes with 0 errors
- [x] Biome lint passes (0 errors)

---

### 1.3 — Video Player (Week 4)

#### Backend — `nodejs-especialist`

- [x] Streaming endpoint with Bunny token
- [x] Progress endpoint (upsert: create or update)
- [x] Rate limiting on progress endpoint (1 req/5s per user)

#### Frontend — `react-senior-engineer`

**Layout reference:** `layout/desktop-layout/player_de_aula_desktop/code.html`

- [x] `VideoPlayer.tsx` component using `@ybr/hls-player`
- [x] Lesson page: player + module/lesson sidebar
- [x] Auto-save progress every 10 seconds while watching
- [x] Mark lesson as complete when reaching 90% of video
- [x] Gold progress bar per module (design system gold)
- [x] Tabs: Lesson / Materials / My Notes
- [x] All UI strings via `next-intl` message keys

---

### 1.4 — Student Area (Week 4–5)

#### Backend — `nodejs-especialist`

| Method | Route                              | Description                                                                                                                                   |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/webhooks/enrollment`             | Receive enrollment notification from external payment system. Creates or updates enrollment record. Requires shared secret header validation. |
| `GET`  | `/student/enrollments`             | List enrolled courses with aggregated progress                                                                                                |
| `GET`  | `/student/courses/:id`             | Full details: modules, lessons, progress per lesson                                                                                           |
| `GET`  | `/student/lessons/:id/attachments` | List lesson materials                                                                                                                         |

**Security requirements:**

- `POST /webhooks/enrollment` must validate a shared secret header (`X-Webhook-Secret`) to prevent unauthorized enrollment injection
- Enrollment access verification middleware for all `/student/*` routes

**Checklist:**

- [ ] All endpoints with Zod validation
- [ ] `POST /webhooks/enrollment` with shared-secret validation + idempotency key
- [ ] Enrollment access verification middleware
- [ ] Aggregated progress calculation

#### Frontend — `react-senior-engineer`

**Layout references:**

- `layout/desktop-layout/dashboard_desktop/code.html`
- `layout/desktop-layout/meus_cursos_desktop/code.html`
- `layout/desktop-layout/vis_o_geral_do_curso_desktop/code.html`

- [ ] `/[locale]/dashboard` — Welcome, courses in progress, next lesson
- [ ] `/[locale]/my-courses` — Catalog of enrolled courses
- [ ] `/[locale]/courses/:slug` — Course overview (modules, overall progress)
- [ ] `/[locale]/courses/:slug/lessons/:lessonId` — Player + materials + notes
- [ ] Gold progress bars per module
- [ ] PDF material downloads
- [ ] All UI strings via `next-intl` message keys

---

### 1.5 — Transactional Emails (Week 5)

> **Owner:** `nodejs-especialist`

- [ ] Template: Welcome on account creation
- [ ] Template: Course access granted (triggered by enrollment webhook)
- [ ] Template: Password recovery
- [ ] Template: Lesson reminder (7 days without login)

---

### 1.6 — Certificates (Week 6)

#### Backend — `nodejs-especialist`

- [ ] `POST /certificates/generate` — Generate certificate at 100% completion
- [ ] `GET /certificates/:id/verify` — Public certificate verification
- [ ] PDF generation (branded with creator identity)

#### Frontend — `react-senior-engineer`

- [ ] `/[locale]/certificate/:id` — Download and sharing page
- [ ] Public `/[locale]/verify/:code` — Certificate validation page
- [ ] Direct LinkedIn sharing
- [ ] All UI strings via `next-intl` message keys

---

### 1.7 — Testing & Quality (Phase 1)

> **Owner:** `qa-tester`

- [x] Unit test coverage > 70% for backend — Auth functions: 7 unit test files + 1 integration test file (111 tests total, all passing)
- [x] Auth route integration tests (POST /register, /login, /refresh, /logout, /forgot-password, /reset-password, GET /me)
- [ ] E2E tests for critical flows: register → enroll (via webhook) → course access
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## PHASE 2 — Complete Experience (Week 9–16)

**Status:** 🔲 Not started

### Community (Week 9–10)

- [ ] Discussion forum per module (Q&A)
- [ ] Reply notifications via email
- [ ] Creator moderation (approve/remove posts)
- [ ] WhatsApp Business API (enrollment → automatic group addition)

### Advanced Analytics (Week 10–11)

**Layout reference:** `layout/admin-layout/analytics_de_performance_desktop/` (read `code.html` + `screen.png` before implementing UI)

- [ ] Admin analytics page `/[locale]/(admin)/analytics` using the layout reference

- [ ] Admin dashboard: active students, completion rates, engagement metrics
- [ ] Completion rate per module (dropout funnel)
- [ ] Retention cohort analysis
- [ ] Video engagement heatmap (Bunny Analytics or Mux)
- [ ] At-risk student alerts (7 days inactive → auto email)
- [ ] Automatic NPS at end of course

### Mux Video Migration (Week 11–12)

- [ ] Upload via Mux API (replacing Bunny for premium creators)
- [ ] Migrate `HLSPlayer` to consume Mux URLs (signed playback IDs)
- [ ] Auto subtitles via Mux Robots
- [ ] Per-video engagement analytics (Mux Data)
- [ ] Hybrid strategy: Mux for paid courses, Bunny for free previews

### Student Management — Admin (Week 11–12)

**Layout reference:** `layout/admin-layout/gest_o_de_alunas_desktop/` (read `code.html` + `screen.png` before implementing UI)

- [ ] `GET /admin/students` — List students enrolled in creator's courses
- [ ] Admin page `/[locale]/(admin)/alunas` — Student list with progress, enrollment status, search/filter

### Basic Multi-tenancy (Week 12–14)

- [ ] New creator registration (onboarding flow)
- [ ] Creator plan tiers (Starter/Growth/Pro/Agency) — billing managed externally
- [ ] Custom subdomain: `creator.ybr-platform.com`
- [ ] Creator-customizable theme (primary colors)
- [ ] Data isolation per creator (RLS in Neon)

### PWA (Week 14–15)

- [ ] Service Worker for offline lesson caching
- [ ] Web App Manifest for app installation
- [ ] Push notifications (new lesson published, community reply)
- [ ] Offline graceful degradation

---

## PHASE 3 — Scale & Native App (Month 5+)

**Status:** 🔲 Planned

- [ ] React Native/Expo app (delegate to `react-native-specialist`)
- [ ] DRM for premium content (Mux DRM)
- [ ] Semantic search inside courses (Algolia / pgvector)
- [ ] Live streaming integrated with player
- [ ] Creator marketplace (multiple sellers)
- [ ] Public API for third-party integrations

---

## Architecture Reference

- **Monorepo location:** `ybr-plataform/platform/`
- **API docs (Swagger):** `http://localhost:3002/documentation` (dev only)
- **Layout references:** `ybr-plataform/layout/`
- **Design system spec:** `ybr-plataform/layout/desktop-layout/artisanal_sophistication/DESIGN.md`
- **HLS Player source:** `ybr-plataform/video-player/index.ts`
- **Full docs (English):** `ybr-plataform/platform/docs/english/`
- **Full docs (Portuguese):** `ybr-plataform/platform/docs/pt-br/`
