# 11 — Guia Completo de DevOps com Docker

**Data:** 2026-04-24

---

## Visão Geral

Este guia cobre toda a infraestrutura de containerização e CI/CD da YBR Platform. A estratégia adota **Docker em todos os ambientes** — do desenvolvimento local à produção — garantindo paridade total e eliminando o clássico problema "funciona na minha máquina".

### Princípios da Estratégia

1. **Paridade de ambientes** — Dev, staging e produção usam a mesma base Docker
2. **Multi-stage builds** — Imagens enxutas, sem dependências de desenvolvimento em produção
3. **Non-root user** — Segurança obrigatória; containers nunca rodam como `root`
4. **Health checks** — Todos os serviços com `HEALTHCHECK` definido para orquestração correta
5. **Secrets seguros** — Credenciais nunca hardcoded; sempre via variáveis de ambiente
6. **Layer caching** — `package.json` copiado antes do código fonte para cache de dependências
7. **Imagens mínimas** — Base `alpine` sempre que possível

---

## Estrutura de Arquivos

```
ybr-platform/
├── apps/
│   ├── api/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── web/
│       ├── Dockerfile
│       └── .dockerignore
├── docker-compose.yml          # Desenvolvimento local (PostgreSQL + Redis)
├── docker-compose.staging.yml  # Referência de staging
├── .env.example                # Template de variáveis (raiz)
└── .github/
    └── workflows/
        ├── ci.yml              # Testes e lint em todo PR
        └── deploy.yml          # Deploy automatizado na main
```

---

## Dockerfiles

### API — Fastify (apps/api/Dockerfile)

```dockerfile
# ═══════════════════════════════════════════
# Stage 1: Instalação de dependências
# ═══════════════════════════════════════════
FROM node:22-alpine AS deps

WORKDIR /app

# Habilita pnpm via corepack (sem instalação adicional)
RUN corepack enable pnpm

# Copia apenas arquivos de manifesto para cache de camada
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/

# Instala todas as dependências (dev + prod) para o build
RUN pnpm install --frozen-lockfile

# ═══════════════════════════════════════════
# Stage 2: Build TypeScript → JavaScript
# ═══════════════════════════════════════════
FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable pnpm

# Reutiliza node_modules do stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copia todo o código fonte
COPY . .

# Build do pacote de banco e schemas antes da API
RUN pnpm --filter @ybr/database build
RUN pnpm --filter @ybr/schemas build

# Build da API com tsup
RUN pnpm --filter api build

# ═══════════════════════════════════════════
# Stage 3: Imagem de produção
# ═══════════════════════════════════════════
FROM node:22-alpine AS production

WORKDIR /app

# Cria grupo e usuário não-root (segurança obrigatória)
RUN addgroup --system --gid 1001 appgroup \
  && adduser --system --uid 1001 --ingroup appgroup appuser

# Instala apenas utilitários necessários (wget para healthcheck)
RUN apk add --no-cache wget

RUN corepack enable pnpm

# Copia artefatos do build
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/packages/database/dist ./node_modules/@ybr/database/dist
COPY --from=build /app/packages/schemas/dist ./node_modules/@ybr/schemas/dist

# Instala apenas dependências de produção
COPY pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Aplica permissões ao usuário não-root
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

# Health check: verifica o endpoint /health a cada 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
```

### API — .dockerignore (apps/api/.dockerignore)

```
node_modules
dist
.env
.env.*
!.env.example
*.log
coverage
.turbo
```

### Frontend — Next.js (apps/web/Dockerfile)

```dockerfile
# ═══════════════════════════════════════════
# Stage 1: Instalação de dependências
# ═══════════════════════════════════════════
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

# ═══════════════════════════════════════════
# Stage 2: Build Next.js
# ═══════════════════════════════════════════
FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

COPY . .

# Build dos pacotes compartilhados primeiro
RUN pnpm --filter @ybr/ui build
RUN pnpm --filter @ybr/schemas build
RUN pnpm --filter @ybr/hls-player build

# Desativa telemetria do Next.js em builds
ENV NEXT_TELEMETRY_DISABLED=1

# Build do Next.js com modo standalone (gera servidor mínimo autocontido)
RUN pnpm --filter web build

# ═══════════════════════════════════════════
# Stage 3: Imagem de produção
# ═══════════════════════════════════════════
FROM node:22-alpine AS production

WORKDIR /app

RUN addgroup --system --gid 1001 appgroup \
  && adduser --system --uid 1001 --ingroup appgroup appuser

RUN apk add --no-cache wget

# Copia apenas o output standalone do Next.js (autocontido, sem node_modules completo)
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

> **Importante:** Para o modo `standalone` funcionar, adicione ao `next.config.ts`:
>
> ```typescript
> const config: NextConfig = {
>   output: "standalone",
> };
> ```

### Frontend — .dockerignore (apps/web/.dockerignore)

```
node_modules
.next
dist
.env
.env.*
!.env.example
*.log
coverage
.turbo
```

---

## Docker Compose — Desenvolvimento Local

O `docker-compose.yml` da raiz inicializa apenas os **serviços de infraestrutura** (banco de dados e cache). As aplicações Next.js e Fastify rodam diretamente com `pnpm dev` para hot-reload eficiente.

```yaml
# docker-compose.yml
version: "3.9"

services:
  # ─────────────────────────────────────────
  # PostgreSQL 16 — banco de dados principal
  # ─────────────────────────────────────────
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
      # Scripts de inicialização (executados uma vez)
      - ./scripts/db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ybr_user -d ybr_platform_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # ─────────────────────────────────────────
  # Redis 7 — cache e sessões
  # ─────────────────────────────────────────
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

  # ─────────────────────────────────────────
  # Mailhog — captura emails em desenvolvimento
  # ─────────────────────────────────────────
  mailhog:
    image: mailhog/mailhog:latest
    container_name: ybr_mailhog_dev
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Interface web
    profiles:
      - email # Inicia apenas com: docker compose --profile email up

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### Como usar em desenvolvimento

```bash
# Subir infraestrutura
docker compose up -d

# Subir com captura de emails
docker compose --profile email up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f postgres
docker compose logs -f redis

# Parar tudo
docker compose down

# Limpar volumes (CUIDADO: apaga dados locais)
docker compose down -v
```

---

## Docker Compose — Staging/Referência Completa

```yaml
# docker-compose.staging.yml
# USO: referência para staging e validação de imagens localmente
version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: production
    container_name: ybr_api
    restart: unless-stopped
    env_file: ./apps/api/.env.staging
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3001/health || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: production
    container_name: ybr_web
    restart: unless-stopped
    env_file: ./apps/web/.env.staging
    ports:
      - "3000:3000"
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test:
        ["CMD-SHELL", "wget -qO- http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ybr_platform_staging
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data
    healthcheck:
      test:
        ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ybr_platform_staging"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_staging_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_staging_data:
  redis_staging_data:
```

---

## Variáveis de Ambiente

### apps/api/.env.example

```bash
# ─── Aplicação ───────────────────────────────────────────
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# ─── Banco de Dados ──────────────────────────────────────
# Dev local (Docker Compose):
DATABASE_URL=postgresql://ybr_user:ybr_local_pass_dev@localhost:5432/ybr_platform_dev
# Produção (Neon serverless):
# DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# ─── Cache / Redis ───────────────────────────────────────
REDIS_URL=redis://localhost:6379
# Produção (Upstash):
# REDIS_URL=rediss://default:token@url.upstash.io:6379

# ─── Autenticação JWT ────────────────────────────────────
# MÍNIMO 32 caracteres. Gerar com: openssl rand -base64 32
JWT_SECRET=SUBSTITUA_POR_VALOR_REAL_MIN_32_CHARS
JWT_REFRESH_SECRET=SUBSTITUA_POR_OUTRO_VALOR_REAL_MIN_32_CHARS
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# ─── Stripe ──────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── Bunny Stream (Fase 1 — Vídeo) ──────────────────────
BUNNY_STREAM_API_KEY=...
BUNNY_VIDEO_LIBRARY_ID=...
BUNNY_VIDEO_PULL_ZONE_URL=https://vz-XXXXXXXX.b-cdn.net/

# ─── Mux Video (Fase 2+) ─────────────────────────────────
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
MUX_WEBHOOK_SECRET=...

# ─── Cloudflare R2 (Storage) ─────────────────────────────
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=ybr-platform
R2_PUBLIC_URL=https://assets.ybr-platform.com

# ─── Resend (Email) ──────────────────────────────────────
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@ybr-platform.com

# ─── Google OAuth ────────────────────────────────────────
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# ─── CORS ────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

### apps/web/.env.example

```bash
# ─── URLs ────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Stripe (chave pública — seguro no cliente) ──────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ─── Bunny Stream (Fase 1) ───────────────────────────────
NEXT_PUBLIC_BUNNY_PULL_ZONE_URL=https://vz-XXXXXXXX.b-cdn.net/

# ─── Analytics ───────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ─── Sentry ──────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
```

### Regras de Segurança para Variáveis

| Regra                                     | Detalhe                                                      |
| ----------------------------------------- | ------------------------------------------------------------ |
| Nunca commitar `.env`                     | Apenas `.env.example` vai ao repositório                     |
| `NEXT_PUBLIC_` apenas para dados públicos | Qualquer `NEXT_PUBLIC_` fica exposto no bundle JS do cliente |
| Secrets com mínimo de 32 caracteres       | Gerar com `openssl rand -base64 32`                          |
| Rotação periódica                         | JWT secrets e API keys devem ser rotacionados a cada 90 dias |
| Secrets no GitHub Actions                 | Nunca em `env:` hardcoded no YAML                            |

---

## CI/CD com GitHub Actions

### Pipeline de CI (ci.yml)

Executado em todo Pull Request para `main` e `develop`.

```yaml
# .github/workflows/ci.yml
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
  # ─────────────────────────────────────────────────────
  # Job 1: Qualidade de código (lint + tipos)
  # ─────────────────────────────────────────────────────
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint (Biome)
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

  # ─────────────────────────────────────────────────────
  # Job 2: Testes unitários e de integração
  # ─────────────────────────────────────────────────────
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
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 3

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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run migrations
        run: pnpm --filter @ybr/database migrate

      - name: Run tests
        run: pnpm test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # ─────────────────────────────────────────────────────
  # Job 3: Validação do build Docker (sem push)
  # ─────────────────────────────────────────────────────
  docker-build:
    name: Docker Build Validation
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build API image (sem push)
        uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/api/Dockerfile
          push: false
          target: production
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build Web image (sem push)
        uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/web/Dockerfile
          push: false
          target: production
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Pipeline de Deploy (deploy.yml)

Executado apenas em push para `main` (após merge de PR aprovado).

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "9"
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/${{ github.repository_owner }}/ybr-platform

jobs:
  # ─────────────────────────────────────────────────────
  # Job 1: Build e push das imagens Docker
  # ─────────────────────────────────────────────────────
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

      - name: Login no GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Metadados da imagem da API
        id: meta-api
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_PREFIX }}/api
          tags: |
            type=sha,prefix=,suffix=,format=short
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build e push da API
        uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/api/Dockerfile
          push: true
          target: production
          tags: ${{ steps.meta-api.outputs.tags }}
          labels: ${{ steps.meta-api.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Metadados da imagem Web
        id: meta-web
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_PREFIX }}/web
          tags: |
            type=sha,prefix=,suffix=,format=short
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build e push do Web
        uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          target: production
          tags: ${{ steps.meta-web.outputs.tags }}
          labels: ${{ steps.meta-web.outputs.labels }}
          build-args: |
            NEXT_PUBLIC_API_URL=${{ vars.NEXT_PUBLIC_API_URL }}
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ─────────────────────────────────────────────────────
  # Job 2: Deploy da API no Railway
  # ─────────────────────────────────────────────────────
  deploy-api:
    name: Deploy API (Railway)
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production

    steps:
      - name: Deploy no Railway
        uses: railwayapp/railway-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: ybr-platform-api
          image: ${{ needs.build-and-push.outputs.api-image }}

  # ─────────────────────────────────────────────────────
  # Job 3: Deploy do Frontend na Vercel
  # ─────────────────────────────────────────────────────
  deploy-web:
    name: Deploy Web (Vercel)
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy na Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_WEB }}
          vercel-args: "--prod"
          working-directory: apps/web

  # ─────────────────────────────────────────────────────
  # Job 4: Notificação de deploy
  # ─────────────────────────────────────────────────────
  notify:
    name: Notificação de Deploy
    runs-on: ubuntu-latest
    needs: [deploy-api, deploy-web]
    if: always()

    steps:
      - name: Notificar status
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deploy YBR Platform: ${{ needs.deploy-api.result == 'success' && needs.deploy-web.result == 'success' && '✅ Sucesso' || '❌ Falha' }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deploy YBR Platform*\nAPI: ${{ needs.deploy-api.result }} | Web: ${{ needs.deploy-web.result }}\nCommit: ${{ github.sha }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Estratégia de Ambientes

### Mapeamento de Ambientes

| Ambiente     | Frontend                | API                        | Banco                               | Cache                          |
| ------------ | ----------------------- | -------------------------- | ----------------------------------- | ------------------------------ |
| **Local**    | `pnpm dev` (porta 3000) | `pnpm dev` (porta 3001)    | Docker Compose (PostgreSQL local)   | Docker Compose (Redis local)   |
| **CI**       | Build Docker (sem push) | Build Docker (sem push)    | GitHub Actions Service (PostgreSQL) | GitHub Actions Service (Redis) |
| **Staging**  | Vercel Preview (branch) | Railway staging service    | Neon (branch staging)               | Upstash (staging instance)     |
| **Produção** | Vercel Production       | Railway production service | Neon (branch main)                  | Upstash (prod instance)        |

### Estratégia de Branches

```
main          → Deploy automático em produção
develop       → Deploy automático em staging
feature/*     → Preview deploys na Vercel (PR previews)
hotfix/*      → Merge direto para main + develop
```

### Configuração do Neon (Database Branching)

O Neon suporta branches de banco de dados, similar a branches Git. Use isso para staging e desenvolvimento paralelo:

```bash
# Criar branch para staging
neon branches create --name staging --project-id <project-id>

# Obter a connection string da branch
neon connection-string --branch staging
```

---

## Segurança em Containers

### Boas Práticas Implementadas

#### 1. Non-root User (obrigatório em produção)

Todo container de aplicação deve rodar como usuário não-root:

```dockerfile
RUN addgroup --system --gid 1001 appgroup \
  && adduser --system --uid 1001 --ingroup appgroup appuser

# ... copia e instala arquivos ...

RUN chown -R appuser:appgroup /app
USER appuser
```

#### 2. Read-only Filesystem (onde possível)

```yaml
# docker-compose.staging.yml
services:
  api:
    read_only: true
    tmpfs:
      - /tmp # Para arquivos temporários necessários
```

#### 3. Limitação de Recursos

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 128M
```

#### 4. Varredura de Vulnerabilidades

Adicione ao pipeline CI:

```yaml
- name: Scan de segurança (Trivy)
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.IMAGE_PREFIX }}/api:latest
    format: "sarif"
    exit-code: "1"
    ignore-unfixed: true
    severity: "CRITICAL,HIGH"
```

#### 5. Secrets no GitHub Actions

**Nunca** coloque secrets diretamente no YAML:

```yaml
# ❌ ERRADO
env:
  JWT_SECRET: meu_secret_aqui

# ✅ CORRETO
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

Variáveis de ambiente que são públicas (sem dados sensíveis) podem ir em `vars`:

```yaml
# GitHub Actions Settings → Variables (não Secrets)
env:
  NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
```

---

## Setup Inicial do Projeto

### Pré-requisitos

```bash
# Verificar versões mínimas
node --version   # >= 22.x
docker --version # >= 24.x
pnpm --version   # >= 9.x
```

### Primeiros passos

```bash
# 1. Clonar o repositório
git clone https://github.com/org/ybr-platform.git
cd ybr-platform

# 2. Copiar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Editar as variáveis (preencher valores locais)
nano apps/api/.env

# 4. Subir infraestrutura local
docker compose up -d

# 5. Aguardar health checks
docker compose ps
# STATUS: healthy para postgres e redis

# 6. Instalar dependências
pnpm install

# 7. Rodar migrations
pnpm --filter @ybr/database migrate

# 8. Rodar seeds
pnpm --filter @ybr/database seed

# 9. Iniciar desenvolvimento
pnpm dev
# web  → http://localhost:3000
# api  → http://localhost:3001
# docs → http://localhost:3001/docs (Swagger UI)
```

### Scripts Úteis

```bash
# Limpar e recriar banco local (CUIDADO: apaga todos os dados)
docker compose down -v && docker compose up -d
pnpm --filter @ybr/database migrate
pnpm --filter @ybr/database seed

# Build local de imagens Docker para validação
docker build -f apps/api/Dockerfile -t ybr-api:local .
docker build -f apps/web/Dockerfile -t ybr-web:local .

# Rodar imagem local de produção
docker run -p 3001:3001 --env-file apps/api/.env ybr-api:local

# Inspecionar container em execução
docker exec -it ybr_postgres_dev psql -U ybr_user -d ybr_platform_dev
docker exec -it ybr_redis_dev redis-cli

# Ver logs em tempo real
docker compose logs -f --tail=100
```

---

## Monitoramento e Observabilidade

### Health Endpoints

Ambos os serviços devem expor um endpoint `/health` (ou `/api/health`):

#### API (Fastify)

```typescript
// apps/api/src/routes/health.ts
const healthRoutes = async (app: FastifyInstance) => {
  app.get("/health", async (request, reply) => {
    const dbOk = await checkDatabaseConnection();
    const cacheOk = await checkCacheConnection();

    const status = dbOk && cacheOk ? "healthy" : "degraded";
    const statusCode = status === "healthy" ? 200 : 503;

    return reply.status(statusCode).send({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk ? "ok" : "error",
        cache: cacheOk ? "ok" : "error",
      },
    });
  });
};
```

#### Frontend (Next.js)

```typescript
// apps/web/src/app/api/health/route.ts
import { NextResponse } from "next/server";

export const GET = () => {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
};
```

### Logs Estruturados

A API usa `pino` (built-in no Fastify) com formato JSON em produção:

```typescript
// apps/api/src/server.ts
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    // JSON em produção, pretty em desenvolvimento
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});
```

---

## Referências

- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Railway Deployment Docs](https://docs.railway.app)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Neon Database Branching](https://neon.tech/docs/introduction/branching)
- [Turborepo Docker Guide](https://turbo.build/repo/docs/guides/tools/docker)
