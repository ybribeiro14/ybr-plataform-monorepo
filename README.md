# YBR Platform

A white-label online course platform built for Brazilian creators in the US market. Creators can sell, host, and deliver video courses to their students under their own brand — with built-in checkout, a video player, student progress tracking, certificates, and a creator dashboard.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables Reference](#environment-variables-reference)
- [Available Commands](#available-commands)
- [API Documentation](#api-documentation)
- [Internationalization](#internationalization)
- [Documentation](#documentation)

---

## Tech Stack

### Frontend (`apps/web` + `apps/admin`)

| Technology            | Version | Purpose                             |
| --------------------- | ------- | ----------------------------------- |
| Next.js               | 15+     | App Router, Server Components, SSR  |
| React                 | 19      | UI framework                        |
| TypeScript            | 5.9+    | Type safety                         |
| TailwindCSS           | 4.x     | Utility-first styling               |
| Shadcn/UI + Radix UI  | latest  | Accessible component library        |
| next-intl             | 3.x     | i18n (English, Portuguese, Spanish) |
| TanStack Query        | v5      | Server state management             |
| Zustand               | latest  | Client state management             |
| React Hook Form + Zod | latest  | Form validation                     |

### Backend (`apps/api`)

| Technology      | Version | Purpose                        |
| --------------- | ------- | ------------------------------ |
| Fastify         | 5.6+    | HTTP framework                 |
| TypeScript      | 5.9+    | Type safety                    |
| Drizzle ORM     | 0.45+   | Database ORM (SQL-first)       |
| PostgreSQL      | 16      | Primary data store             |
| Upstash Redis   | latest  | Cache and session storage      |
| Zod             | 3.24+   | Request/response validation    |
| @fastify/jwt    | 9+      | JWT authentication             |
| @fastify/oauth2 | 8+      | Google OAuth2                  |
| Stripe          | 17+     | Payment processing             |
| Resend          | 4+      | Transactional email            |
| AWS SDK (S3)    | 3+      | File storage via Cloudflare R2 |
| bcrypt          | 5.1+    | Password hashing               |
| uuidv7          | latest  | UUID generation                |
| Vitest          | 4+      | Automated tests                |

### Infrastructure

| Service                 | Purpose                  |
| ----------------------- | ------------------------ |
| Docker + Docker Compose | Local PostgreSQL + Redis |
| Turborepo               | Monorepo build system    |
| Biome                   | Linting and formatting   |
| pnpm workspaces         | Package management       |

---

## Project Structure

```
platform/
├── apps/
│   ├── web/        # Next.js 15 — Student area, checkout, sales pages  (port 3000)
│   ├── admin/      # Next.js 15 — Creator dashboard                    (port 3001)
│   └── api/        # Fastify 5 — REST API                              (port 3002)
├── packages/
│   ├── database/   # Drizzle ORM schema, migrations, DB client
│   ├── schemas/    # Shared Zod validation schemas (API + frontend)
│   ├── types/      # Shared TypeScript types
│   ├── ui/         # Shared Shadcn components
│   └── hls-player/ # Custom HLS video player
├── docker-compose.yml   # PostgreSQL + Redis for local dev
├── turbo.json           # Turborepo pipeline config
├── biome.json           # Linter + formatter config
└── pnpm-workspace.yaml  # Workspace package definitions
```

---

## Local Development Setup

Follow these steps in order to go from zero to a running local environment.

### Prerequisites

Make sure the following are installed on your machine:

| Tool           | Min. Version | Check                    |
| -------------- | ------------ | ------------------------ |
| Node.js        | 22.x         | `node --version`         |
| pnpm           | 9.x          | `pnpm --version`         |
| Docker         | 24+          | `docker --version`       |
| Docker Compose | v2           | `docker compose version` |

> **Tip:** Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage Node versions. Run `corepack enable` to activate pnpm via Corepack.

---

### Step 1 — Clone and install dependencies

```bash
git clone https://github.com/ybribeiro14/ybr-plataform-monorepo.git
cd ybr-plataform-monorepo

pnpm install
```

This installs all dependencies across all apps and packages in the monorepo.

---

### Step 2 — Set up environment variables

Copy the environment template:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values. See the [Environment Variables Reference](#environment-variables-reference) section below for a description of each variable.

For a basic local setup (no external services), these are the **minimum required** values:

```bash
# Already set by docker-compose — no changes needed for local DB
DATABASE_URL=postgresql://ybr_user:ybr_local_pass@localhost:5432/ybr_platform_dev

# Generate with: openssl rand -base64 64
JWT_SECRET=<generate a random 32+ char string>
JWT_REFRESH_SECRET=<generate a different random 32+ char string>

# Upstash Redis (free tier available at https://console.upstash.com)
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your_upstash_redis_token

# Stripe test keys (from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Frontend URLs (already correct for local dev)
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

> **Note:** Bunny Stream, Cloudflare R2, Resend, Google OAuth, and Mux are only needed when implementing features that use those services. The API will not fail at startup if those keys are missing — they are loaded on demand.

---

### Step 3 — Start local infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d
```

This starts two containers:

| Container      | Service       | Port   |
| -------------- | ------------- | ------ |
| `ybr_postgres` | PostgreSQL 16 | `5432` |
| `ybr_redis`    | Redis 7       | `6379` |

Check that both are healthy:

```bash
docker compose ps
```

You should see `healthy` in the status column for both services.

---

### Step 4 — Run database migrations

```bash
pnpm db:migrate
```

This runs Drizzle ORM migrations against your local PostgreSQL instance, creating all tables defined in `packages/database/src/schema.ts`.

> If this is your first run, you may need to generate the migration first:
>
> ```bash
> pnpm --filter database generate
> pnpm db:migrate
> ```

---

### Step 5 — Start all apps in development mode

```bash
pnpm dev
```

Turborepo will start all three apps in parallel:

| App         | URL                        | Description                         |
| ----------- | -------------------------- | ----------------------------------- |
| Student Web | http://localhost:3000      | Student area, checkout, sales pages |
| Admin Panel | http://localhost:3001      | Creator dashboard                   |
| REST API    | http://localhost:3002      | Backend API                         |
| API Docs    | http://localhost:3002/docs | Swagger UI (dev only)               |

---

### Step 6 — Verify everything is working

**Check the API:**

```bash
curl http://localhost:3002/health
```

Expected response:

```json
{
  "status": "success",
  "message": "API is running",
  "data": { "timestamp": "2026-04-24T..." }
}
```

**Check the API docs:**

Open http://localhost:3002/docs in your browser to see the interactive Swagger UI.

**Run the test suite:**

```bash
pnpm test
```

All 63 tests should pass.

---

## Environment Variables Reference

All variables live in a single `.env.local` file at the monorepo root. The API reads them at startup; the Next.js apps read `NEXT_PUBLIC_*` variables at build time.

### General

| Variable   | Required | Example       | Description                                                    |
| ---------- | -------- | ------------- | -------------------------------------------------------------- |
| `NODE_ENV` | No       | `development` | Runtime environment. Set automatically by scripts.             |
| `PORT`     | No       | `3002`        | Port the API server listens on. Defaults to `3002`.            |
| `HOST`     | No       | `0.0.0.0`     | Host the API binds to. Use `0.0.0.0` to accept all interfaces. |

---

### Database

| Variable       | Required | Example                                    | Description                                                                                                                                      |
| -------------- | -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL` | **Yes**  | `postgresql://user:pass@localhost:5432/db` | PostgreSQL connection string. For local dev, use the docker-compose defaults. For production, use a Neon serverless URL with `?sslmode=require`. |

**Local docker-compose value:**

```
DATABASE_URL=postgresql://ybr_user:ybr_local_pass@localhost:5432/ybr_platform_dev
```

---

### Cache (Upstash Redis)

| Variable      | Required | Example                  | Description                                                                                                     |
| ------------- | -------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `REDIS_URL`   | **Yes**  | `https://xxx.upstash.io` | Upstash Redis REST URL. Get it from the [Upstash Console](https://console.upstash.com). Free tier is available. |
| `REDIS_TOKEN` | **Yes**  | `AX...`                  | Upstash Redis REST token. Found next to the URL in the Upstash Console.                                         |

> For a minimal local setup without Upstash, you can adapt `src/infrastructure/cache/redis.ts` to use a local Redis client — but Upstash's free tier is the recommended approach.

---

### Authentication (JWT)

| Variable             | Required | Example      | Description                                                                                                                    |
| -------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `JWT_SECRET`         | **Yes**  | `s3cr3t...`  | Secret used to sign access tokens (15-minute expiry). Must be at least 32 characters. Generate with: `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | **Yes**  | `r3fr3sh...` | Secret used to sign refresh tokens (30-day expiry). Must be different from `JWT_SECRET`.                                       |

---

### Payments (Stripe)

| Variable                             | Required | Example       | Description                                                                                                                                                                                                                                                                             |
| ------------------------------------ | -------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                  | **Yes**  | `sk_test_...` | Stripe secret key. Use `sk_test_...` for development, `sk_live_...` for production. Get it from [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys).                                                                                                               |
| `STRIPE_WEBHOOK_SECRET`              | **Yes**  | `whsec_...`   | Webhook signing secret. Used to verify that webhook events come from Stripe. Get it when creating a webhook endpoint in the Stripe dashboard. For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3002/payments/webhook` |
| `STRIPE_PUBLISHABLE_KEY`             | **Yes**  | `pk_test_...` | Stripe publishable key — used server-side for some operations.                                                                                                                                                                                                                          |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Yes**  | `pk_test_...` | Same publishable key, exposed to the browser for Stripe Elements.                                                                                                                                                                                                                       |

---

### Video Hosting — Bunny Stream (Phase 1)

| Variable                          | Required | Example                     | Description                                                                      |
| --------------------------------- | -------- | --------------------------- | -------------------------------------------------------------------------------- |
| `BUNNY_STREAM_API_KEY`            | Phase 1  | `abc123...`                 | Bunny Stream API key. Get it from the [Bunny dashboard](https://dash.bunny.net). |
| `BUNNY_VIDEO_LIBRARY_ID`          | Phase 1  | `123456`                    | The numeric ID of your Bunny Stream video library.                               |
| `BUNNY_VIDEO_PULL_ZONE_URL`       | Phase 1  | `https://vz-xxx.b-cdn.net/` | CDN base URL for streaming video files. Must end with `/`.                       |
| `NEXT_PUBLIC_BUNNY_PULL_ZONE_URL` | Phase 1  | `https://vz-xxx.b-cdn.net/` | Same CDN URL, exposed to the browser for the video player.                       |

---

### Video Hosting — Mux (Phase 2+)

| Variable             | Required | Example     | Description                                                                                                                     |
| -------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `MUX_TOKEN_ID`       | Phase 2+ | `abc123...` | Mux API token ID. Get it from [Mux Dashboard → Settings → API Access Tokens](https://dashboard.mux.com/settings/access-tokens). |
| `MUX_TOKEN_SECRET`   | Phase 2+ | `xyz...`    | Mux API token secret. Shown only once when creating the token — store it immediately.                                           |
| `MUX_WEBHOOK_SECRET` | Phase 2+ | `abc...`    | Used to verify Mux webhook payloads. Get it when creating a webhook in the Mux dashboard.                                       |

---

### File Storage (Cloudflare R2)

| Variable               | Required | Example                       | Description                                                                                                                            |
| ---------------------- | -------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `R2_ACCOUNT_ID`        | Phase 1  | `abc123...`                   | Your Cloudflare account ID. Found in the Cloudflare dashboard sidebar.                                                                 |
| `R2_ACCESS_KEY_ID`     | Phase 1  | `abc...`                      | R2 API token access key. Create under [Cloudflare R2 → Manage R2 API Tokens](https://dash.cloudflare.com/?to=/:account/r2/api-tokens). |
| `R2_SECRET_ACCESS_KEY` | Phase 1  | `xyz...`                      | R2 API token secret key. Shown once at creation time.                                                                                  |
| `R2_BUCKET_NAME`       | Phase 1  | `ybr-platform`                | The name of your R2 bucket.                                                                                                            |
| `R2_PUBLIC_URL`        | Phase 1  | `https://r2.ybr-platform.com` | Public base URL for accessing uploaded files (custom domain or R2 public URL).                                                         |

---

### Email (Resend)

| Variable            | Required | Example                    | Description                                                                                                               |
| ------------------- | -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`    | Phase 1  | `re_...`                   | Resend API key. Get it from [resend.com/api-keys](https://resend.com/api-keys). Free tier sends up to 3,000 emails/month. |
| `RESEND_FROM_EMAIL` | No       | `noreply@ybr-platform.com` | The sender address for transactional emails. Must be a verified domain in Resend. Defaults to `noreply@ybr-platform.com`. |

---

### Google OAuth

| Variable               | Required | Example                          | Description                                                                                                                                              |
| ---------------------- | -------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Phase 1  | `xxx.apps.googleusercontent.com` | Google OAuth client ID. Create credentials in [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials). |
| `GOOGLE_CLIENT_SECRET` | Phase 1  | `GOCSPX-...`                     | Google OAuth client secret. Found next to the client ID in Google Cloud Console.                                                                         |

---

### Frontend Public Variables (Next.js)

> Variables prefixed with `NEXT_PUBLIC_` are embedded in the browser bundle at build time.

| Variable                | Required | Example                 | Description                                                                                               |
| ----------------------- | -------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | **Yes**  | `http://localhost:3002` | Base URL for the REST API, used by frontend fetch calls. Change to your production API URL in production. |
| `NEXT_PUBLIC_APP_URL`   | **Yes**  | `http://localhost:3000` | Base URL for the student web app. Used for generating absolute URLs (e.g. email links).                   |
| `NEXT_PUBLIC_ADMIN_URL` | **Yes**  | `http://localhost:3001` | Base URL for the admin panel.                                                                             |

---

## Available Commands

Run all commands from the monorepo root (`platform/`).

### Development

```bash
pnpm dev              # Start all apps in development mode (web, admin, api)
pnpm dev --filter web # Start only the student web app
pnpm dev --filter api # Start only the API
```

### Build

```bash
pnpm build            # Production build for all apps
```

### Testing

```bash
pnpm test             # Run all tests (Vitest)
pnpm test:coverage    # Run tests with coverage report (from apps/api)
```

### Code Quality

```bash
pnpm lint             # Lint all packages with Biome
pnpm lint:fix         # Auto-fix lint issues
pnpm type-check       # TypeScript type checking across all apps
```

### Database

```bash
pnpm db:migrate       # Apply pending Drizzle migrations
pnpm db:studio        # Open Drizzle Studio (visual DB browser)

# From packages/database directly:
pnpm --filter database generate  # Generate new migration from schema changes
pnpm --filter database migrate   # Apply migrations
```

### Docker

```bash
docker compose up -d         # Start PostgreSQL + Redis
docker compose down          # Stop containers (data preserved)
docker compose down -v       # Stop containers and delete all data
docker compose ps            # Check container status and health
docker compose logs postgres # View PostgreSQL logs
```

---

## API Documentation

Interactive Swagger/OpenAPI documentation is served by the API in all non-production environments.

### Accessing the docs

| Environment | URL                                       |
| ----------- | ----------------------------------------- |
| Local dev   | http://localhost:3002/docs                |
| Staging     | https://api-staging.ybr-platform.com/docs |
| Production  | _(disabled — security hardening)_         |

Start the API and open the URL in your browser:

```bash
pnpm dev --filter api
# then open: http://localhost:3002/docs
```

### What's documented

Every endpoint exposes:

- **Summary** — one-line description of the action
- **Request schema** — body, URL params, and query string validated via Zod
- **Response schemas** — documented for all status codes (200, 400, 401, 404, etc.)
- **Authentication** — protected routes show the `BearerAuth` lock icon
- **Tags** — endpoints grouped by domain (auth, admin/courses, student, payments, etc.)

### Authenticating in the Swagger UI

1. Call `POST /auth/login` with your credentials — copy the `accessToken` from the response
2. Click the **Authorize** button (top right of the UI)
3. Paste the token in the `BearerAuth` field (without the `Bearer ` prefix)
4. Click **Authorize** — all subsequent requests will include the JWT header automatically

The UI saves the token across page refreshes (`persistAuthorization: true`).

### Raw OpenAPI spec

The machine-readable OpenAPI 3.0 JSON spec is available at:

```
GET http://localhost:3002/docs/json
```

Use it to generate client SDKs, import into Postman/Insomnia, or set up contract testing.

### Adding documentation to new routes

Every route MUST be documented before it can be considered complete. See the developer guide:

```
apps/api/src/swagger/README.md
```

Quick reference — annotate every route with:

```typescript
import { SWAGGER_TAGS } from "../swagger/tags";
import { BEARER_AUTH } from "../swagger/security";
import {
  successResponse,
  RESPONSE_401,
  RESPONSE_404,
} from "../swagger/responses";

app.get(
  "/courses/:id",
  {
    schema: {
      tags: [SWAGGER_TAGS.PUBLIC],
      summary: "Get course by ID",
      description: "Returns full course data including modules and lessons.",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: successResponse(courseSchema),
        401: RESPONSE_401,
        404: RESPONSE_404,
      },
    },
  },
  handler,
);
```

Shared helpers live in `apps/api/src/swagger/`:

| Module         | Exports                                                          |
| -------------- | ---------------------------------------------------------------- |
| `tags.ts`      | `SWAGGER_TAGS` — canonical tag names for each domain             |
| `security.ts`  | `BEARER_AUTH`, `NO_AUTH` — security requirement objects          |
| `responses.ts` | `successResponse()`, `errorResponse()`, `RESPONSE_401/403/404/…` |

---

## Internationalization

The platform supports three languages out of the box:

| Locale         | Language            |
| -------------- | ------------------- |
| `en` (default) | English             |
| `pt-BR`        | Portuguese (Brazil) |
| `es`           | Spanish             |

All routes are prefixed with the locale: `/en/dashboard`, `/pt-BR/login`, `/es/cursos`.

---

## Documentation

Full project documentation is organized in `docs/` by category:

### Architecture

| Document                                                                                         | Description                                               |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [docs/architecture/01-overview.md](docs/architecture/01-overview.md)                             | Project overview, vision, and current phase status        |
| [docs/architecture/02-tech-stack.md](docs/architecture/02-tech-stack.md)                         | Full technology stack with versions and rationale         |
| [docs/architecture/03-system-architecture.md](docs/architecture/03-system-architecture.md)       | System architecture, DB schema, core flows                |
| [docs/architecture/04-video-player-strategy.md](docs/architecture/04-video-player-strategy.md)   | Custom HLS player decision and implementation             |
| [docs/architecture/05-video-hosting.md](docs/architecture/05-video-hosting.md)                   | Bunny Stream vs Mux Video comparison                      |
| [docs/architecture/06-payment-processing.md](docs/architecture/06-payment-processing.md)         | Stripe integration and checkout strategy                  |
| [docs/architecture/07-hosting-infrastructure.md](docs/architecture/07-hosting-infrastructure.md) | Vercel, Railway, Neon, Upstash, R2                        |
| [docs/architecture/08-docker-devops.md](docs/architecture/08-docker-devops.md)                   | Docker setup, CI/CD pipelines, environments               |
| [docs/architecture/09-design-system.md](docs/architecture/09-design-system.md)                   | Artisanal Sophistication — colors, typography, components |

### Research & Business

| Document                                                                                       | Description                                      |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [docs/research/01-market-analysis.md](docs/research/01-market-analysis.md)                     | E-learning market, Hotmart analysis, competitors |
| [docs/research/02-cost-analysis.md](docs/research/02-cost-analysis.md)                         | Infrastructure costs, ROI, break-even analysis   |
| [docs/research/03-competitive-differentials.md](docs/research/03-competitive-differentials.md) | Platform differentials vs Hotmart and Kajabi     |
| [docs/research/04-project-scope.md](docs/research/04-project-scope.md)                         | Project phases, deliverables, definition of done |

### Implementation

| Document                                                         | Description                                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [docs/14-implementation-plan.md](docs/14-implementation-plan.md) | Master implementation plan with progress tracking (the source of truth for what's done) |

> Original Portuguese documentation is archived in [docs/pt-br/](docs/pt-br/).
