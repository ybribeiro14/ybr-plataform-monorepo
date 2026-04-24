# 03 — System Architecture

**Date:** 2026-04-24 | **Updated:** 2026-07-07

---

## 3.1 High-Level Architecture

```
                              INTERNET
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼──────┐        ┌────────▼────────┐
              │  CDN/Edge  │        │   Cloudflare    │
              │  (Vercel)  │        │  (Protection)   │
              └─────┬──────┘        └────────┬────────┘
                    │                         │
         ┌──────────▼──────────────────────────▼──────────┐
         │                FRONTEND                         │
         │          Next.js 15 (App Router)                │
         │    Server Components + [locale] i18n routing    │
         │    apps/web (student) + apps/admin (creator)    │
         │         Deployed on Vercel                      │
         └────────────────────┬────────────────────────────┘
                              │ HTTP/REST + Server Actions
         ┌────────────────────▼────────────────────────────┐
         │                   API                            │
         │              Fastify 5 (Node.js)                │
         │         TypeScript + Zod + JWT                  │
         │       Port 3002 — Deployed on Railway           │
         └──┬─────────────┬──────────────┬─────────────────┘
            │             │              │
    ┌───────▼──┐  ┌───────▼──┐  ┌───────▼──────┐
    │PostgreSQL│  │  Redis   │  │ Bunny/Mux    │
    │  (Neon)  │  │(Upstash) │  │   (Video)    │
    └──────────┘  └──────────┘  └──────────────┘
            │             │              │
    ┌───────▼──┐  ┌───────▼──┐  ┌───────▼──────┐
    │Cloudflare│  │  Stripe  │  │   Resend     │
    │    R2    │  │(Payments)│  │   (Email)    │
    └──────────┘  └──────────┘  └──────────────┘
```

---

## 3.2 Monorepo Structure (Turborepo)

**Location:** `ybr-plataform/platform/`

```
platform/
├── apps/
│   ├── web/              # Next.js 15 — Student portal + Checkout + Landing pages
│   ├── admin/            # Next.js 15 — Creator dashboard
│   └── api/              # Fastify 5 — Backend REST API
├── packages/
│   ├── ui/               # Shared Shadcn/UI components
│   ├── schemas/          # Shared Zod schemas (frontend + backend)
│   ├── database/         # Drizzle schema + migrations
│   ├── hls-player/       # Custom HLS player package
│   └── types/            # Shared TypeScript types
├── docs/
│   ├── architecture/     # Technical architecture docs (this folder)
│   ├── research/         # Market research and business docs
│   ├── pt-br/            # Original Portuguese docs (archived)
│   └── 14-implementation-plan.md
├── turbo.json
├── pnpm-workspace.yaml
└── biome.json
```

**Why a monorepo?**

- Shared types between frontend and backend (no duplication)
- Single source of truth for validation schemas
- Coordinated deployments
- Unified commit history and CI/CD

---

## 3.3 Database Schema

### Core Entities

```sql
-- Users
users
  id (uuidv7)
  email
  password_hash
  name
  avatar_url
  role (student | creator | admin)
  created_at
  updated_at

-- Creator Profile
creators
  id (uuidv7)
  user_id (FK users)
  bio
  website
  stripe_account_id
  plan (starter | growth | pro | agency)
  created_at

-- Courses
courses
  id (uuidv7)
  creator_id (FK creators)
  title
  slug
  description
  thumbnail_url
  price_cents
  currency (USD | BRL)
  status (draft | published | archived)
  language (pt-BR | en-US | es)
  created_at
  updated_at

-- Course Modules
course_modules
  id (uuidv7)
  course_id (FK courses)
  title
  description
  position
  is_published

-- Lessons
lessons
  id (uuidv7)
  module_id (FK course_modules)
  title
  description
  video_asset_id        -- Provider-specific video asset ID
  video_playback_id     -- Provider-specific playback ID
  duration_seconds
  position
  is_free_preview
  is_published
  created_at

-- Lesson Attachments
lesson_attachments
  id (uuidv7)
  lesson_id (FK lessons)
  title
  file_url
  file_type (pdf | doc | spreadsheet | link)
  file_size_bytes

-- Enrollments
enrollments
  id (uuidv7)
  user_id (FK users)
  course_id (FK courses)
  payment_id (FK payments)
  status (active | expired | refunded)
  expires_at (nullable — null = lifetime access)
  enrolled_at
  completed_at

-- Lesson Progress
lesson_progress
  id (uuidv7)
  user_id (FK users)
  lesson_id (FK lessons)
  watched_seconds
  completed_at
  last_watched_at

-- Payments
payments
  id (uuidv7)
  user_id (FK users)
  course_id (FK courses)
  stripe_payment_intent_id
  stripe_charge_id
  amount_cents
  currency
  status (pending | succeeded | failed | refunded)
  installments (1–12)
  created_at
  updated_at

-- Discount Coupons
coupons
  id (uuidv7)
  creator_id (FK creators)
  code
  discount_type (percentage | fixed)
  discount_value
  max_uses
  current_uses
  expires_at
  is_active

-- Certificates
certificates
  id (uuidv7)
  user_id (FK users)
  course_id (FK courses)
  enrollment_id (FK enrollments)
  certificate_url
  issued_at
```

---

## 3.4 Core Flows

### Course Purchase Flow

```
1. Student visits the course sales page
2. Clicks "Buy Now"
3. Frontend creates Stripe PaymentIntent via API
4. Student fills in payment details (Stripe Elements)
5. Stripe processes the payment
6. Stripe webhook → API backend
7. Backend validates webhook (HMAC signature)
8. Backend creates Enrollment in database
9. Backend sends confirmation email (Resend)
10. Student redirected to member area
```

### Video Upload Flow (Creator)

```
1. Creator uploads video via Admin panel
2. Frontend requests upload URL from backend
3. Backend creates upload slot with Bunny/Mux, returns upload URL
4. Frontend uploads directly to video provider
5. Provider processes and transcodes the video
6. Webhook from provider → backend (asset ready)
7. Backend saves video asset ID and playback ID on lesson
8. Admin displays video preview
```

### Video Playback Flow (Student)

```
1. Student opens a lesson
2. Backend verifies active enrollment
3. Backend generates signed playback URL (expiry: 1h)
4. Frontend renders HLS Player with signed URL
5. Video starts streaming via HLS (adaptive bitrate)
6. Frontend sends progress events to backend (debounced every 30s)
7. Backend updates lesson_progress
```

---

## 3.5 Authentication & Authorization

### JWT Strategy

```
Access Token:  15 minutes (stored in memory — never localStorage)
Refresh Token: 30 days (HTTP-only cookie — secure, SameSite=Strict)
```

**Flow:**

1. Login → API returns `access_token` + sets `refresh_token` cookie
2. Authenticated request → `Authorization: Bearer <access_token>`
3. Token expired → Frontend detects 401, calls `POST /auth/refresh`
4. `/auth/refresh` → validates refresh token cookie, returns new access token
5. Logout → invalidates refresh token in Redis

### Roles & Permissions

| Role      | Permissions                                            |
| --------- | ------------------------------------------------------ |
| `student` | View purchased courses, mark progress                  |
| `creator` | CRUD courses, upload video, view analytics             |
| `admin`   | Everything (manage creators, plans, platform settings) |

### Route Protection (Next.js Middleware)

The middleware in `apps/web/src/middleware.ts` and `apps/admin/src/middleware.ts` combines:

1. **Locale detection** — redirects to default locale if missing
2. **Auth guard** — checks JWT for protected routes, strips locale prefix before matching

```typescript
// Simplified middleware logic
const pathname = request.nextUrl.pathname;
const pathnameWithoutLocale = stripLocale(pathname, locales);

if (isProtectedRoute(pathnameWithoutLocale) && !isAuthenticated(request)) {
  return redirectToLogin(request, currentLocale);
}

return intlMiddleware(request);
```

---

## 3.6 Security

| Threat              | Mitigation                                           |
| ------------------- | ---------------------------------------------------- |
| SQL Injection       | Drizzle ORM (parameterized queries only)             |
| XSS                 | Content Security Policy + output sanitization        |
| CSRF                | Double submit cookie + SameSite=Strict               |
| Video Piracy        | Signed URLs + expiry + DRM (Phase 2)                 |
| Brute Force         | Rate limiting (`@fastify/rate-limit`)                |
| Webhook Spoofing    | HMAC signature validation (Stripe + video providers) |
| Data Exposure       | Zod validation on all API inputs                     |
| Credential Exposure | Environment variables — never hardcoded              |
| Unauthorized Access | JWT + role-based middleware                          |

---

## 3.7 Performance & Scalability

### Frontend (Next.js)

- **ISR** for course pages (revalidation every 60s)
- **Static Generation** for sales/marketing pages
- **Server Components** for member area (zero extra JS)
- **Streaming SSR** with `<Suspense>` for loading states
- **Image optimization** via `next/image` (automatic WebP)

### Backend (Fastify)

- **PostgreSQL connection pool** via Drizzle
- **Redis cache** for frequent reads (course catalog: TTL 5min)
- **HTTP compression** enabled
- **Horizontal scaling** via Railway replicas

### Video (Bunny/Mux)

- **Global CDN** with 100+ PoPs
- **Adaptive Bitrate** streaming based on user connection speed
- **Token authentication** to prevent hotlinking

### Phase 1 Capacity Estimates

| Metric                  | Estimate    |
| ----------------------- | ----------- |
| Concurrent students     | 100–500     |
| Active videos           | 50–200      |
| API requests/min        | 1,000–5,000 |
| Average video size      | 500MB–2GB   |
| Monthly video bandwidth | 500GB–5TB   |

---

## 3.8 API Response Format

All API responses follow this standard format:

```typescript
// Success response
{
  status: 'success',
  message: 'Users retrieved successfully',
  data: {
    items: [...],
    pagination: {
      total: 50,
      limit: 10,
      currentPage: 1,
      totalPages: 5,
    }
  }
}

// Error response
{
  status: 'error',
  message: 'Validation failed',
  errors: [
    {
      code: 'INVALID_EMAIL',
      detail: 'The email address provided is not valid.'
    }
  ]
}
```
