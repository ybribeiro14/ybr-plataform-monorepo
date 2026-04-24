# 08 — Docker & DevOps

**Date:** 2026-04-24 | **Updated:** 2026-07-07

---

## Overview

This guide covers the full containerization and CI/CD infrastructure for YBR Platform. The strategy adopts **Docker in every environment** — from local development to production — ensuring complete environment parity and eliminating "works on my machine" issues.

### Core Principles

1. **Environment parity** — Dev, staging, and production use the same Docker base
2. **Multi-stage builds** — Lean images; no dev dependencies in production
3. **Non-root user** — Security requirement; containers never run as `root`
4. **Health checks** — Every service has `HEALTHCHECK` defined for proper orchestration
5. **No secrets hardcoded** — Credentials always via environment variables
6. **Layer caching** — `package.json` copied before source code for dependency caching
7. **Minimal images** — Alpine base whenever possible

---

## File Structure

```
platform/
├── apps/
│   ├── api/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── web/
│       ├── Dockerfile
│       └── .dockerignore
├── docker-compose.yml            # Local development (PostgreSQL + Redis)
├── docker-compose.staging.yml    # Staging reference
├── .env.example                  # Variable template (root)
└── .github/
    └── workflows/
        ├── ci.yml                # Tests and lint on every PR
        └── deploy.yml            # Automated deploy on main
```

---

## Dockerfiles

### API — Fastify (apps/api/Dockerfile)

> **Note:** API port is `3002` in this project.

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

# Stage 2: Build TypeScript → JavaScript
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @ybr/database build
RUN pnpm --filter @ybr/schemas build
RUN pnpm --filter api build

# Stage 3: Production image
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup --system --gid 1001 appgroup \
  && adduser --system --uid 1001 --ingroup appgroup appuser
RUN apk add --no-cache wget
RUN corepack enable pnpm
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/packages/database/dist ./node_modules/@ybr/database/dist
COPY --from=build /app/packages/schemas/dist ./node_modules/@ybr/schemas/dist
COPY pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "dist/server.js"]
```

### Frontend — Next.js (apps/web/Dockerfile)

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/
COPY packages/hls-player/package.json ./packages/hls-player/
RUN pnpm install --frozen-lockfile

# Stage 2: Build Next.js
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
RUN pnpm --filter @ybr/ui build
RUN pnpm --filter @ybr/schemas build
RUN pnpm --filter @ybr/hls-player build
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web build

# Stage 3: Production image
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup --system --gid 1001 appgroup \
  && adduser --system --uid 1001 --ingroup appgroup appuser
RUN apk add --no-cache wget
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "apps/web/server.js"]
```

> **Required in `next.config.ts`:**
>
> ```typescript
> const config: NextConfig = {
>   output: "standalone",
> };
> ```

---

## Docker Compose — Local Development

The root `docker-compose.yml` starts only **infrastructure services** (database and cache). Next.js and Fastify run directly via `pnpm dev` for efficient hot-reload.

```yaml
# docker-compose.yml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: ybr_postgres_dev
    restart: unless-stopped
    environment:
      POSTGRES_DB: ybr_platform_dev
      POSTGRES_USER: ybr_user
      POSTGRES_PASSWORD: ybr_local_pass_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ybr_user -d ybr_platform_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7-alpine
    container_name: ybr_redis_dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 5s

  # Optional: Email capture for development (starts with --profile email)
  mailhog:
    image: mailhog/mailhog:latest
    container_name: ybr_mailhog_dev
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
    profiles:
      - email

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### Local Development Commands

```bash
# Start infrastructure
docker compose up -d

# Start with email capture (Mailhog)
docker compose --profile email up -d

# Check status
docker compose ps

# View logs
docker compose logs -f postgres
docker compose logs -f redis

# Stop everything
docker compose down

# Remove volumes (WARNING: deletes local data)
docker compose down -v
```

---

## Environment Variables

### apps/api/.env.example

```bash
# ─── Application ─────────────────────────────────────
NODE_ENV=development
PORT=3002
LOG_LEVEL=info

# ─── Database ────────────────────────────────────────
# Local dev (Docker Compose):
DATABASE_URL=postgresql://ybr_user:ybr_local_pass_dev@localhost:5432/ybr_platform_dev
# Production (Neon serverless):
# DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# ─── Cache (Upstash) ─────────────────────────────────
# Local dev (Docker Redis):
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=
# Production (Upstash — requires url + token):
# REDIS_URL=https://your-url.upstash.io
# REDIS_TOKEN=your-token

# ─── JWT Authentication ───────────────────────────────
# Minimum 32 characters. Generate with: openssl rand -base64 32
JWT_SECRET=REPLACE_WITH_REAL_VALUE_MIN_32_CHARS
JWT_REFRESH_SECRET=REPLACE_WITH_ANOTHER_REAL_VALUE_MIN_32_CHARS

# ─── Stripe ──────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── Bunny Stream (Phase 1 — Video) ──────────────────
BUNNY_STREAM_API_KEY=...
BUNNY_VIDEO_LIBRARY_ID=...
BUNNY_VIDEO_PULL_ZONE_URL=https://vz-XXXXXXXX.b-cdn.net/

# ─── Mux Video (Phase 2+) ────────────────────────────
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...

# ─── Cloudflare R2 (Storage) ─────────────────────────
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=ybr-platform

# ─── Resend (Email) ───────────────────────────────────
RESEND_API_KEY=re_...

# ─── App URLs ─────────────────────────────────────────
WEB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### apps/web/.env.example

```bash
# ─── API URL ─────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3002

# ─── Stripe (public key — safe in client) ────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ─── Bunny Stream (Phase 1) ───────────────────────────
NEXT_PUBLIC_BUNNY_PULL_ZONE_URL=https://vz-XXXXXXXX.b-cdn.net/
```

### Environment Variable Security Rules

| Rule                                | Detail                                                   |
| ----------------------------------- | -------------------------------------------------------- |
| Never commit `.env`                 | Only `.env.example` goes to the repository               |
| `NEXT_PUBLIC_` only for public data | Any `NEXT_PUBLIC_` is exposed in the client JS bundle    |
| Secrets minimum 32 characters       | Generate with `openssl rand -base64 32`                  |
| Periodic rotation                   | JWT secrets and API keys should be rotated every 90 days |
| Secrets in GitHub Actions           | Never hardcoded in `env:` in YAML files                  |

---

## CI/CD with GitHub Actions

### CI Pipeline (ci.yml)

Runs on every Pull Request to `main` and `develop`:

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "9"

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    name: Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: ybr_test
          POSTGRES_USER: ybr_test_user
          POSTGRES_PASSWORD: ybr_test_pass
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U ybr_test_user -d ybr_test"
          --health-interval 10s --health-timeout 5s --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s --health-timeout 5s --health-retries 3
    env:
      DATABASE_URL: postgresql://ybr_test_user:ybr_test_pass@localhost:5432/ybr_test
      REDIS_URL: redis://localhost:6379
      JWT_SECRET: test_secret_min_32_chars_for_ci_env
      JWT_REFRESH_SECRET: test_refresh_secret_32chars_ci
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @ybr/database migrate
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  docker-build:
    name: Docker Build Validation
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/api/Dockerfile
          push: false
          target: production
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/web/Dockerfile
          push: false
          target: production
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Deploy Pipeline (deploy.yml)

Runs only on push to `main` (after approved PR merge):

```yaml
name: Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/${{ github.repository_owner }}/ybr-platform

jobs:
  build-and-push:
    name: Build & Push Docker Images
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      api-image: ${{ steps.meta-api.outputs.tags }}
      web-image: ${{ steps.meta-web.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/setup-buildx-action@v3
      - id: meta-api
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_PREFIX }}/api
          tags: |
            type=sha,prefix=,suffix=,format=short
            type=raw,value=latest,enable={{is_default_branch}}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/api/Dockerfile
          push: true
          target: production
          tags: ${{ steps.meta-api.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-api:
    name: Deploy API (Railway)
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production
    steps:
      - uses: railwayapp/railway-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: ybr-platform-api
          image: ${{ needs.build-and-push.outputs.api-image }}

  deploy-web:
    name: Deploy Web (Vercel)
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_WEB }}
          vercel-args: "--prod"
          working-directory: apps/web
```

---

## Environment Strategy

| Environment    | Frontend               | API                        | Database               | Cache                  |
| -------------- | ---------------------- | -------------------------- | ---------------------- | ---------------------- |
| **Local**      | `pnpm dev` (port 3000) | `pnpm dev` (port 3002)     | Docker Compose (local) | Docker Compose (local) |
| **CI**         | Docker build (no push) | Docker build (no push)     | GitHub Actions service | GitHub Actions service |
| **Staging**    | Vercel preview branch  | Railway staging service    | Neon (staging branch)  | Upstash (staging)      |
| **Production** | Vercel production      | Railway production service | Neon (main branch)     | Upstash (production)   |

### Branch Strategy

```
main          → Automatic production deploy
develop       → Automatic staging deploy
feature/*     → Vercel preview deploys (PR previews)
hotfix/*      → Direct merge to main + develop
```

---

## Container Security

### Non-root User (required in production)

```dockerfile
RUN addgroup --system --gid 1001 appgroup \
  && adduser --system --uid 1001 --ingroup appgroup appuser
# ... copy and install files ...
RUN chown -R appuser:appgroup /app
USER appuser
```

### Secrets Management

- All secrets via environment variables
- GitHub Actions secrets for CI/CD (never in YAML directly)
- Railway + Vercel environment variable management for production
- Local `.env` files (never committed — only `.env.example`)
- Rotate JWT secrets and API keys every 90 days
