# 14 — Complete Implementation Plan

**Date:** 2026-04-24  
**Last Updated:** 2026-04-24  
**Status:** 🟢 Phase 0 complete — Phase 0.5 (Swagger) complete — Phase 1 in progress  
**Monorepo:** `ybr-plataform/platform/`

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

| Table                | Key fields                                                                                            | Notes                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `users`              | id (uuidv7), email, password_hash, name, avatar_url, role, timestamps                                 | role: `student \| creator \| admin`                  |
| `creators`           | id, user_id FK, bio, website, stripe_account_id, plan, timestamps                                     | plan: `starter \| growth \| pro \| agency`           |
| `courses`            | id, creator_id FK, title, slug, description, thumbnail_url, price_cents, currency, status, language   | status: `draft \| published \| archived`             |
| `course_modules`     | id, course_id FK, title, description, position, is_published                                          | Ordered by `position`                                |
| `lessons`            | id, module_id FK, title, bunny_video_id, mux_asset_id, mux_playback_id, duration_seconds, position    | Phase 1: bunny*video_id. Phase 2+: mux*\*            |
| `lesson_attachments` | id, lesson_id FK, title, file_url, file_type, file_size_bytes                                         | file_type: `pdf \| doc \| spreadsheet \| link`       |
| `enrollments`        | id, user_id FK, course_id FK, payment_id FK, status, expires_at, enrolled_at, completed_at            | status: `active \| expired \| refunded`              |
| `lesson_progress`    | id, user_id FK, lesson_id FK, watched_seconds, completed_at, last_watched_at                          |                                                      |
| `payments`           | id, user_id FK, course_id FK, stripe_payment_intent_id, amount_cents, currency, status, installments  | status: `pending \| succeeded \| failed \| refunded` |
| `coupons`            | id, creator_id FK, code, discount_type, discount_value, max_uses, current_uses, expires_at, is_active | discount_type: `percentage \| fixed`                 |
| `certificates`       | id, user_id FK, course_id FK, enrollment_id FK, certificate_url, verification_code, issued_at         |                                                      |

**Checklist:**

- [x] `packages/database/package.json` configured with Drizzle + Neon
- [x] `packages/database/src/client.ts` — connection via `DATABASE_URL`
- [x] All 11 table schemas defined
- [x] `drizzle.config.ts` configured
- [ ] Initial migration generated with `drizzle-kit generate` _(pending Neon account)_
- [ ] Migration applied to Neon (dev) _(pending Neon account)_
- [ ] Basic seeds created _(pending migration)_

---

### 0.4 — Package: `packages/schemas`

> **Owner:** `nodejs-especialist`

**Checklist:**

- [x] Auth schemas (`register`, `login`, `forgot-password`, `reset-password`)
- [x] Course, module and lesson schemas
- [x] Payment and coupon schemas
- [x] Progress and certificate schemas
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
- [ ] i18n setup with `next-intl` _(in progress)_

---

### 0.10 — App: `apps/admin` — Scaffold

> **Owner:** `react-senior-engineer`

**Checklist:**

- [x] Folder structure created
- [x] `package.json` with dependencies
- [x] `globals.css` with matching color tokens
- [ ] Admin shell with navigation sidebar _(Phase 1)_
- [ ] Auth middleware + `creator`/`admin` role verification _(Phase 1)_
- [ ] i18n setup with `next-intl` _(in progress)_

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

| Tag             | Description                                          |
| --------------- | ---------------------------------------------------- |
| `health`        | Service health check                                 |
| `auth`          | Authentication — register, login, tokens, passwords  |
| `admin/courses` | Creator course management (protected: creator role)  |
| `admin/modules` | Module CRUD within courses (protected: creator role) |
| `admin/lessons` | Lesson CRUD within modules (protected: creator role) |
| `student`       | Student-facing data — enrollments, progress          |
| `public`        | Public endpoints — course landing pages, catalog     |
| `payments`      | Stripe checkout and webhooks                         |
| `coupons`       | Coupon validation and management                     |
| `certificates`  | Certificate generation and verification              |

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

- [ ] Zod schemas for all endpoints
- [ ] Functions layer: `registerUser`, `loginUser`, `refreshToken`, `forgotPassword`, `resetPassword`
- [ ] Infrastructure: `email/auth-emails.ts` — Resend templates (welcome, recovery)
- [ ] JWT plugin configured in `plugins/auth.ts`
- [ ] Unit tests for each function (`qa-tester`)

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

- [ ] Pages created with React Hook Form + schemas from `packages/schemas`
- [ ] API client: `lib/api/auth.ts` with methods `login()`, `register()`, `forgotPassword()`, `resetPassword()`
- [ ] TanStack Query mutation hooks: `useLogin`, `useRegister`
- [ ] Zustand store for auth state (`useAuthStore`)
- [ ] Next.js middleware protecting authenticated routes
- [ ] Auto-redirect to `/dashboard` after login
- [ ] All UI strings via `next-intl` message keys (no hardcoded text)

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

- [ ] All routes with Zod validation
- [ ] Authorization middleware: only `creator` accesses `/admin/*`
- [ ] Cloudflare R2 integration for thumbnails
- [ ] Bunny Stream API integration for video upload
- [ ] CRUD route tests

---

### 1.3 — Video Player (Week 4)

#### Backend — `nodejs-especialist`

- [ ] Streaming endpoint with Bunny token
- [ ] Progress endpoint (upsert: create or update)
- [ ] Rate limiting on progress endpoint (1 req/5s per user)

#### Frontend — `react-senior-engineer`

**Layout reference:** `layout/desktop-layout/player_de_aula_desktop/code.html`

- [ ] `VideoPlayer.tsx` component using `@ybr/hls-player`
- [ ] Lesson page: player + module/lesson sidebar
- [ ] Auto-save progress every 10 seconds while watching
- [ ] Mark lesson as complete when reaching 90% of video
- [ ] Gold progress bar per module (design system gold)
- [ ] Tabs: Lesson / Materials / My Notes
- [ ] All UI strings via `next-intl` message keys

---

### 1.4 — Checkout & Payments (Week 4–5)

#### Backend — `nodejs-especialist`

| Method | Route                     | Description                                                       |
| ------ | ------------------------- | ----------------------------------------------------------------- |
| `GET`  | `/public/courses/:slug`   | Public course data for landing page and checkout                  |
| `POST` | `/payments/create-intent` | Create PaymentIntent in Stripe. Body: `{ courseId, couponCode? }` |
| `POST` | `/payments/webhook`       | Stripe webhook. On `payment_intent.succeeded`: create enrollment  |
| `POST` | `/coupons/validate`       | Validate coupon and return applied discount                       |

**Security — mandatory:**

```typescript
// ALWAYS validate Stripe webhook signature
const event = stripe.webhooks.constructEvent(
  rawBody,
  request.headers["stripe-signature"],
  STRIPE_WEBHOOK_SECRET,
);
```

**Checklist:**

- [ ] `POST /payments/create-intent` with coupon discount calculation
- [ ] `POST /payments/webhook` with signature validation
- [ ] Enrollment creation after confirmed payment
- [ ] Purchase confirmation email (Resend)
- [ ] Coupon validation endpoint
- [ ] Stripe webhook tests with stripe-cli

#### Frontend — `react-senior-engineer`

**Layout reference:** `layout/desktop-layout/checkout_desktop/code.html`

- [ ] Checkout page with embedded Stripe Elements
- [ ] "6x of $37" installment display (prominent)
- [ ] Coupon discount field with real-time validation
- [ ] Apple Pay / Google Pay (Payment Request Button)
- [ ] Confirmation page `/confirmacao` with purchase summary
- [ ] Loading state and error handling
- [ ] All UI strings via `next-intl` message keys

---

### 1.5 — Student Area (Week 5–6)

#### Backend — `nodejs-especialist`

| Method | Route                              | Description                                         |
| ------ | ---------------------------------- | --------------------------------------------------- |
| `GET`  | `/student/enrollments`             | List enrolled courses with aggregated progress      |
| `GET`  | `/student/courses/:id`             | Full details: modules, lessons, progress per lesson |
| `GET`  | `/student/lessons/:id/attachments` | List lesson materials                               |

**Checklist:**

- [ ] All endpoints with Zod validation
- [ ] Enrollment access verification middleware
- [ ] Aggregated progress calculation

#### Frontend — `react-senior-engineer`

**Layout references:**

- `layout/desktop-layout/dashboard_desktop/code.html`
- `layout/desktop-layout/meus_cursos_desktop/code.html`
- `layout/desktop-layout/vis_o_geral_do_curso_desktop/code.html`

- [ ] `/[locale]/dashboard` — Welcome, courses in progress, next lesson
- [ ] `/[locale]/my-courses` — Catalog of purchased courses
- [ ] `/[locale]/courses/:slug` — Course overview (modules, overall progress)
- [ ] `/[locale]/courses/:slug/lessons/:lessonId` — Player + materials + notes
- [ ] Gold progress bars per module
- [ ] PDF material downloads
- [ ] All UI strings via `next-intl` message keys

---

### 1.6 — Sales Page (Week 6–7)

#### Backend — `nodejs-especialist`

- [ ] `GET /public/courses/:slug` — Public course data
- [ ] Configurable landing page template

#### Frontend — `react-senior-engineer`

**Layout reference:** `layout/desktop-layout/p_gina_de_vendas_desktop/code.html`

- [ ] Sections: Hero, About the Course, Modules, Testimonials, Instructor, Price, FAQ
- [ ] Urgency countdown timer
- [ ] Fixed CTA button on mobile
- [ ] SEO: meta tags, Open Graph, Schema.org
- [ ] All UI strings via `next-intl` message keys

---

### 1.7 — Transactional Emails (Week 7)

> **Owner:** `nodejs-especialist`

- [ ] Template: Welcome on account creation
- [ ] Template: Purchase confirmation + access link
- [ ] Template: Course access granted
- [ ] Template: Password recovery
- [ ] Template: Lesson reminder (7 days without login)

---

### 1.8 — Certificates (Week 8)

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

### 1.9 — Testing & Quality (Phase 1)

> **Owner:** `qa-tester`

- [ ] Unit test coverage > 70% for backend
- [ ] E2E tests for critical flows: register → purchase → course access
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

- [ ] Admin dashboard: sales, revenue, active students, MRR
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

### Coupons & Promotions (Week 12)

- [ ] Coupon CRUD in admin panel
- [ ] Percentage and fixed-value coupons
- [ ] Expiration date and usage limit
- [ ] Affiliate coupon tracking
- [ ] Automatic discount display at checkout

### Basic Multi-tenancy (Week 13–15)

- [ ] New creator registration (onboarding flow)
- [ ] Subscription plans via Stripe Billing (Starter/Growth/Pro/Agency)
- [ ] Custom subdomain: `creator.ybr-platform.com`
- [ ] Creator-customizable theme (primary colors)
- [ ] Data isolation per creator (RLS in Neon)

### PWA (Week 15–16)

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
