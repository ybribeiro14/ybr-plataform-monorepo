# 02 — Technology Stack

**Date:** 2026-04-24 | **Updated:** 2026-07-07

---

## 2.1 Stack Overview

The stack was selected based on:

- Team familiarity (Node.js + React/Next.js + TypeScript)
- Student experience and performance
- Infrastructure cost efficiency
- Development velocity
- Active ecosystem in 2026

```
┌────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 15)                     │
│  React 19 + TypeScript + TailwindCSS 4.x + Shadcn/UI      │
│  App Router + Server Components + [locale] i18n routing    │
├────────────────────────────────────────────────────────────┤
│                    BACKEND (Fastify 5)                      │
│  Node.js + TypeScript + Fastify 5 + Drizzle ORM            │
│  JWT Auth + Zod Validation + REST API                      │
├──────────────┬──────────────────────────────────────────────┤
│  PostgreSQL  │  Redis/Upstash  │  S3/R2  │  Video Stream   │
│  (primary)   │  (cache/session)│(uploads)│ (Bunny→Mux)     │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 2.2 Frontend

### Next.js 15 (App Router)

**Why Next.js 15?**

- Server Components reduce client-side JavaScript → faster page loads
- Streaming SSR improves Time to First Byte (TTFB)
- PPR (Partial Prerendering) — static pages with dynamic islands
- React 19 with automatic Compiler (fewer unnecessary re-renders)
- Turbopack stable → 76% faster in dev
- Native TypeScript 5.9+ support

**Critical platform features:**

- `use cache` directive for granular cache invalidation
- Server Actions for forms without extra API routes
- Streaming for course data (native skeleton loaders)
- Built-in image optimization for course thumbnails
- Middleware for course access control + locale detection

### Internationalization (i18n)

**Library:** `next-intl` 3.x  
**Locales:** `en` (default), `pt-BR`, `es`  
**Routing:** All pages under `app/[locale]/` segment  
**Middleware:** Combines locale detection with authentication guard

```
apps/web/src/
├── app/
│   ├── layout.tsx          # Root layout (minimal, no lang attr)
│   ├── page.tsx            # Redirects to /en
│   └── [locale]/
│       ├── layout.tsx      # Full layout: fonts + NextIntlClientProvider
│       └── page.tsx        # Locale-specific home page
├── i18n/
│   ├── routing.ts          # defineRouting with locales
│   └── request.ts          # getRequestConfig loading messages
├── messages/
│   ├── en.json
│   ├── pt-BR.json
│   └── es.json
└── middleware.ts            # next-intl + auth guard
```

### React 19

- Automatic React Compiler → no manual `useMemo`/`useCallback` needed
- `useOptimistic` for optimistic UI in student interactions
- `useFormStatus` for form states
- Improved Hydration Error messages for faster debugging

### UI & Styling

| Library       | Version | Usage                  |
| ------------- | ------- | ---------------------- |
| TailwindCSS   | 4.x     | Primary styling        |
| Shadcn/UI     | Latest  | Base component library |
| Radix UI      | Latest  | Accessible primitives  |
| Lucide React  | Latest  | Icons                  |
| Framer Motion | 12.x    | Animations             |

### State Management

- **Server state:** TanStack Query v5 (React Query) for cache and sync
- **Client state:** Zustand (lightweight) for global UI state
- **Forms:** React Hook Form + Zod for validation
- **No Redux** — over-engineering for this use case

### Video Player

Custom HLS player based on `hls.js` — works with both Bunny Stream (Phase 1) and Mux Video (Phase 2+).  
→ See [04-video-player-strategy.md](./04-video-player-strategy.md) for the full decision rationale.

---

## 2.3 Backend

### Fastify 5.6+

**Why Fastify over Express?**

- 2× faster than Express in benchmarks
- Native schema validation with Zod
- Robust plugin ecosystem
- TypeScript-first
- Smaller memory footprint

**Plugins used:**

| Plugin                      | Purpose                            |
| --------------------------- | ---------------------------------- |
| `@fastify/cors`             | CORS for frontend origins          |
| `@fastify/jwt`              | JWT authentication middleware      |
| `@fastify/multipart`        | File upload handling               |
| `@fastify/swagger`          | Automatic OpenAPI documentation    |
| `@fastify/swagger-ui`       | Interactive API docs UI            |
| `@fastify/rate-limit`       | Rate limiting for public endpoints |
| `@fastify/oauth2`           | Google OAuth2 social login         |
| `fastify-type-provider-zod` | Zod integration with Fastify       |

**API port:** `3002` (development)  
**API docs:** Available at `http://localhost:3002/docs` in development

### Layer Architecture

```
apps/api/src/
├── routes/          # HTTP endpoints (controllers)
│   ├── auth/
│   ├── courses/
│   ├── enrollments/
│   ├── payments/
│   └── users/
├── functions/       # Business logic
│   ├── auth/
│   ├── courses/
│   ├── video/
│   └── payments/
├── infrastructure/  # External integrations
│   ├── database/    # Drizzle ORM + Neon
│   ├── cache/       # Upstash Redis
│   ├── storage/     # Cloudflare R2
│   ├── video/       # Bunny Stream / Mux API
│   ├── email/       # Resend
│   └── payments/    # Stripe
├── schemas/         # Shared Zod schemas
└── plugins/         # Custom Fastify plugins
```

### Validation — Zod ^3.24.x

- All API inputs validated with Zod schemas
- Types auto-generated via `z.infer<>`
- Shared between frontend (forms) and backend (API) via `packages/schemas`
- Native Fastify integration via `fastify-type-provider-zod`

> **Note:** The project uses Zod v3 (^3.24.x), not v4.

---

## 2.4 Database

### PostgreSQL (Primary)

**Why PostgreSQL?**

- ACID compliance for financial transactions
- Native JSONB for flexible metadata (course metadata)
- Native full-text search for course catalog
- Excellent Drizzle ORM support

**Provider:** Neon (Serverless PostgreSQL)

### Drizzle ORM 0.45+

- Type-safe SQL — errors caught at compile time
- Automated migrations
- Zero runtime overhead
- Schema-first approach
- `drizzle-zod` integration for auto-generated Zod schemas

### Redis / Upstash (Cache Layer)

**Uses:**

- User session cache
- Rate limiting counters
- Frequent API response cache (course catalog: TTL 5min)
- Simple task queues (Upstash QStash)

**Provider:** Upstash (serverless Redis, pay-per-request)  
**Client:** `@upstash/redis` — requires `url` + `token` (not a standard Redis URL)

---

## 2.5 Video Infrastructure

### Phase 1 — Bunny Stream

- API-simple, extremely cost-effective (~$1–10/month at launch scale)
- Custom HLS player for branded UI
- Token authentication for content protection
- No React SDK needed — our custom player handles HLS directly

### Phase 2+ — Mux Video

- Mux Robots: automatic PT-BR subtitles, chapters, summaries
- Engagement analytics per video
- Signed playback URLs
- DRM for premium content protection

→ Full analysis in [05-video-hosting.md](./05-video-hosting.md)

---

## 2.6 Payments

### Stripe

- 2.9% + $0.30 per transaction (US cards)
- Native subscriptions (for SaaS plans)
- Customizable checkout (Stripe Elements embedded in page)
- Installments via Klarna/Afterpay/Affirm
- Robust webhooks

**Current Stripe API version:** `2025-02-24.acacia`

→ Full analysis in [06-payment-processing.md](./06-payment-processing.md)

---

## 2.7 Supporting Services

| Service             | Provider            | Usage                                         |
| ------------------- | ------------------- | --------------------------------------------- |
| Transactional email | Resend 4.0+         | Purchase confirmation, access, password reset |
| File storage        | Cloudflare R2       | PDFs, course materials                        |
| CDN / DNS           | Cloudflare          | Static assets, DNS, DDoS protection           |
| Search              | Algolia / Typesense | Course catalog search (Phase 2+)              |
| Analytics           | PostHog             | Student behavior tracking                     |
| Error tracking      | Sentry              | Runtime error monitoring                      |

---

## 2.8 Tooling & Quality

| Tool                | Version | Purpose                                                  |
| ------------------- | ------- | -------------------------------------------------------- |
| Biome               | 2.3+    | Linting + formatting (replaces ESLint + Prettier)        |
| Vitest              | 4.0+    | Unit and integration tests                               |
| @vitest/coverage-v8 | 4.0+    | Code coverage reporting (threshold: 70% lines/functions) |
| Playwright          | Latest  | E2E tests                                                |
| tsup                | 8.5+    | API production build                                     |
| tsx                 | Latest  | TypeScript execution in dev                              |
| @faker-js/faker     | Latest  | Test fixtures                                            |

### Test Infrastructure

Tests use Fastify's `inject()` API — no real HTTP server started, very fast.

```typescript
// tests/helpers/build-test-app.ts
import { buildApp } from "../../src/app";

const buildTestApp = async () => {
  const app = buildApp();
  await app.ready();
  return app;
};
```

All test environment variables are set in `tests/setup.ts`. Coverage excludes `src/infrastructure/**` (thin SDK wrappers with no business logic).

**Current test status:** 63 tests passing, 100% statements/functions/lines, 91.66% branches.

---

## 2.9 Environment Requirements

### Node.js

- **Minimum version:** 22.x LTS
- **Dev runtime:** Node.js with `tsx`
- **Production runtime:** Node.js with `tsup` build output

### TypeScript

- **Version:** 5.9+
- **Strict mode:** ON
- **No `any`:** Enforced via Biome

### Key Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/ybr_platform

# Cache (Upstash — requires url + token format)
REDIS_URL=https://your-upstash-url.upstash.io
REDIS_TOKEN=your-upstash-token

# Authentication
JWT_SECRET=<min-32-chars-random>
JWT_REFRESH_SECRET=<min-32-chars-random>

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Video (Phase 1)
BUNNY_STREAM_API_KEY=...
BUNNY_VIDEO_LIBRARY_ID=...
BUNNY_VIDEO_PULL_ZONE_URL=https://vz-xxx.b-cdn.net/

# Video (Phase 2+)
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...

# Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=ybr-platform

# Email
RESEND_API_KEY=re_...

# App
PORT=3002
NODE_ENV=development
WEB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```
