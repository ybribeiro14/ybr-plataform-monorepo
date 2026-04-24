# 14 — Plano de Implementação Completo

**Data:** 2026-04-24  
**Última atualização:** 2026-04-24  
**Status:** 🟢 Fase 0 concluída — Fase 1 em andamento  
**Monorepo:** `ybr-plataform/platform/`

> ⚠️ **REGRA OBRIGATÓRIA:** Todo agente que concluir uma tarefa DEVE imediatamente marcar o item correspondente com `[x]` neste documento antes de encerrar o trabalho. Este arquivo é o único ponto de verdade sobre o que foi feito.

---

## Como Usar Este Documento

Este é o **documento mestre de execução** da YBR Platform. Cada item é um passo concreto e sequencial. Marque `[x]` ao concluir. Antes de iniciar qualquer etapa, consulte o agente indicado na coluna **Responsável**.

**Legenda de status:**

- `[ ]` — Não iniciado
- `[~]` — Em andamento
- `[x]` — Concluído

**Agentes disponíveis:**

- `po-orchestrator` — Decisões de produto, arquitetura e orquestração
- `nodejs-especialist` — Backend (Fastify, Drizzle, integrações)
- `react-senior-engineer` — Frontend (Next.js, UI, integrações)
- `qa-tester` — Testes automatizados
- `full-stack-bug-fixer` — Bugs e integrações quebradas
- `react-native-specialist` — App mobile (Fase 3+)

---

## FASE 0 — Estrutura e Setup (Semana 1–2)

### 0.1 — Scaffolding Inicial do Monorepo

> **Responsável:** `po-orchestrator` + execução manual  
> **Onde:** `ybr-plataform/platform/`

#### Criação da estrutura de pastas

Execute os seguintes comandos a partir de `ybr-plataform/`:

```bash
mkdir -p platform
cd platform

# Inicializar o projeto Node
pnpm init

# Apps
mkdir -p apps/web apps/admin apps/api

# Packages compartilhados
mkdir -p packages/ui/src
mkdir -p packages/schemas/src
mkdir -p packages/database/src/schema
mkdir -p packages/database/src/migrations
mkdir -p packages/types/src
mkdir -p packages/hls-player/src

# Config e DevOps
mkdir -p .github/workflows
```

#### Checklist de criação de arquivos raiz

- [x] `platform/package.json` — Workspace root
- [x] `platform/pnpm-workspace.yaml` — Configuração do workspace pnpm
- [x] `platform/turbo.json` — Pipeline Turborepo
- [x] `platform/biome.json` — Configuração global de lint/format
- [x] `platform/tsconfig.base.json` — TypeScript base compartilhado
- [x] `platform/.gitignore` — Ignorar node_modules, .env, dist, .next
- [x] `platform/.env.example` — Template de variáveis de ambiente raiz
- [x] `platform/docker-compose.yml` — Postgres + Redis para dev local
- [x] `platform/README.md` — Instruções de setup

---

### 0.2 — Arquivos de Configuração Raiz

> **Responsável:** `nodejs-especialist`

#### `platform/package.json`

```json
{
  "name": "ybr-platform",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "test": "turbo run test",
    "type-check": "turbo run type-check",
    "db:migrate": "pnpm --filter database migrate",
    "db:studio": "pnpm --filter database studio"
  },
  "devDependencies": {
    "@biomejs/biome": "2.3.x",
    "turbo": "latest",
    "typescript": "5.9.x"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=9"
  }
}
```

#### `platform/pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

#### `platform/turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "lint:fix": {
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

#### `platform/biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": ["**/node_modules", "**/.next", "**/dist", "**/coverage"]
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noConsoleLog": "warn"
      },
      "style": {
        "useImportType": "error",
        "noDefaultExport": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "arrowParentheses": "asNeeded",
      "trailingCommas": "es5"
    }
  }
}
```

#### `platform/tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### `platform/.gitignore`

```
# Dependencies
node_modules/
.pnpm-store/

# Builds
dist/
.next/
.turbo/

# Env
.env
.env.local
.env.*.local

# Misc
*.log
.DS_Store
coverage/
```

**Checklist:**

- [x] `package.json` criado e validado
- [x] `pnpm-workspace.yaml` criado
- [x] `turbo.json` criado
- [x] `biome.json` criado
- [x] `tsconfig.base.json` criado
- [x] `.gitignore` criado

---

### 0.3 — Package: `packages/database`

> **Responsável:** `nodejs-especialist`

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── creators.ts
│   │   ├── courses.ts
│   │   ├── modules.ts
│   │   ├── lessons.ts
│   │   ├── enrollments.ts
│   │   ├── progress.ts
│   │   ├── payments.ts
│   │   ├── coupons.ts
│   │   ├── certificates.ts
│   │   ├── attachments.ts
│   │   └── index.ts
│   ├── migrations/
│   ├── client.ts          # Drizzle client (Neon)
│   └── index.ts
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

**Entidades a definir no schema Drizzle:**

| Tabela               | Campos-chave                                                                                                                                               | Observações                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `users`              | id (uuidv7), email, password_hash, name, avatar_url, role, timestamps                                                                                      | role: `student \| creator \| admin`                  |
| `creators`           | id, user_id FK, bio, website, stripe_account_id, plan, timestamps                                                                                          | plan: `starter \| growth \| pro \| agency`           |
| `courses`            | id, creator_id FK, title, slug, description, thumbnail_url, price_cents, currency, status, language, timestamps                                            | status: `draft \| published \| archived`             |
| `course_modules`     | id, course_id FK, title, description, position, is_published                                                                                               | Ordenado por `position`                              |
| `lessons`            | id, module_id FK, title, description, bunny_video_id, mux_asset_id, mux_playback_id, duration_seconds, position, is_free_preview, is_published, timestamps | Fase 1: bunny*video_id. Fase 2+: mux*\*              |
| `lesson_attachments` | id, lesson_id FK, title, file_url, file_type, file_size_bytes                                                                                              | file_type: `pdf \| doc \| spreadsheet \| link`       |
| `enrollments`        | id, user_id FK, course_id FK, payment_id FK, status, expires_at, enrolled_at, completed_at                                                                 | status: `active \| expired \| refunded`              |
| `lesson_progress`    | id, user_id FK, lesson_id FK, watched_seconds, completed_at, last_watched_at                                                                               |                                                      |
| `payments`           | id, user_id FK, course_id FK, stripe_payment_intent_id, stripe_charge_id, amount_cents, currency, status, installments, timestamps                         | status: `pending \| succeeded \| failed \| refunded` |
| `coupons`            | id, creator_id FK, code, discount_type, discount_value, max_uses, current_uses, expires_at, is_active                                                      | discount_type: `percentage \| fixed`                 |
| `certificates`       | id, user_id FK, course_id FK, enrollment_id FK, certificate_url, verification_code, issued_at                                                              |                                                      |

**Checklist:**

- [x] `packages/database/package.json` configurado com Drizzle + Neon
- [x] `packages/database/src/client.ts` — conexão com Neon via variável `DATABASE_URL`
- [x] Schema de todas as 11 tabelas definido
- [x] `drizzle.config.ts` configurado
- [ ] Migration inicial gerada com `drizzle-kit generate` _(aguarda conta Neon configurada)_
- [ ] Migration aplicada no Neon (dev) _(aguarda conta Neon configurada)_
- [ ] Seeds básicos criados (1 creator, 1 course, 1 module, 3 lessons) _(aguarda migration)_

---

### 0.4 — Package: `packages/schemas`

> **Responsável:** `nodejs-especialist`

```
packages/schemas/
├── src/
│   ├── auth.ts         # registerSchema, loginSchema, resetPasswordSchema
│   ├── courses.ts      # createCourseSchema, updateCourseSchema
│   ├── lessons.ts      # createLessonSchema, updateLessonSchema
│   ├── payments.ts     # createPaymentIntentSchema
│   ├── progress.ts     # updateProgressSchema
│   └── index.ts
├── package.json
└── tsconfig.json
```

Schemas Zod compartilhados entre `apps/api` (validação de request) e `apps/web` (validação de forms).

**Checklist:**

- [x] Schemas de autenticação (`register`, `login`, `forgot-password`, `reset-password`)
- [x] Schemas de cursos, módulos e aulas
- [x] Schemas de pagamento e cupom
- [x] Schemas de progresso e certificado
- [x] Package exportando todos os schemas com tipos inferidos (`z.infer<typeof schema>`)

---

### 0.5 — Package: `packages/types`

> **Responsável:** `nodejs-especialist`

```
packages/types/
├── src/
│   ├── api.ts          # ApiResponse<T>, PaginatedResponse<T>
│   ├── course.ts       # Course, Module, Lesson, Attachment
│   ├── user.ts         # User, Creator, Student
│   ├── payment.ts      # Payment, Enrollment, Coupon
│   ├── progress.ts     # LessonProgress, CourseProgress
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Tipo de resposta API padrão obrigatório:**

```typescript
interface ApiResponse<T = undefined> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: Array<{ code: string; detail: string }>;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    currentPage: number;
    totalPages: number;
    cursor?: string;
  };
}
```

**Checklist:**

- [x] `ApiResponse<T>` e `PaginatedResponse<T>` definidos
- [x] Tipos de domínio para todas as entidades
- [x] Package exportando tudo via barrel export

---

### 0.6 — Package: `packages/hls-player`

> **Responsável:** `react-senior-engineer`

Copiar e adaptar o player de `ybr-plataform/video-player/index.ts` para o pacote compartilhado.

```
packages/hls-player/
├── src/
│   ├── HLSPlayer.tsx      # Componente principal (copiado de video-player/index.ts)
│   ├── types.ts           # HLSPlayerProps, HLSTrackProps
│   └── index.ts           # Barrel export
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

**`packages/hls-player/package.json`:**

```json
{
  "name": "@ybr/hls-player",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "hls.js": "^1.5.x"
  },
  "devDependencies": {
    "tsup": "8.5.x"
  }
}
```

**Checklist:**

- [x] `HLSPlayer.tsx` copiado de `ybr-plataform/video-player/index.ts`
- [x] Props `HLSPlayerProps` e `HLSTrackProps` exportados
- [ ] `tsup.config.ts` configurado para dual build (ESM + CJS) _(package usa src diretamente via workspace — build necessário apenas para publicação)_
- [ ] Package buildando sem erros (`pnpm build`) _(idem acima)_

---

### 0.7 — Package: `packages/ui`

> **Responsável:** `react-senior-engineer`

```
packages/ui/
├── src/
│   ├── components/       # Componentes Shadcn customizados
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── progress.tsx
│   └── index.ts
├── package.json
└── tsconfig.json
```

Componentes base Shadcn/UI com customização para o tema "Artisanal Sophistication". **Os componentes aqui são APENAS os mais reutilizados entre `web` e `admin`** — componentes específicos de um app ficam no próprio app.

**Checklist:**

- [x] `package.json` com peer dependencies React + TailwindCSS
- [x] Utilitário `cn()` disponível via `@ybr/ui`
- [ ] Componentes base instalados via `shadcn@latest add button card input badge progress` _(a implementar na Fase 1 junto com as telas)_
- [x] Customização de cores via CSS variables no `globals.css` de cada app

---

### 0.8 — App: `apps/api` — Scaffold

> **Responsável:** `nodejs-especialist`

```
apps/api/
├── src/
│   ├── routes/
│   │   ├── auth/
│   │   │   └── index.ts
│   │   ├── public/
│   │   │   └── index.ts
│   │   ├── student/
│   │   │   └── index.ts
│   │   ├── admin/
│   │   │   └── index.ts
│   │   └── payments/
│   │       └── index.ts
│   ├── functions/
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── video/
│   │   ├── payments/
│   │   └── certificates/
│   ├── infrastructure/
│   │   ├── database/       # Re-export do packages/database
│   │   ├── cache/          # Upstash Redis client
│   │   ├── storage/        # Cloudflare R2 client
│   │   ├── video/          # Bunny Stream + Mux API clients
│   │   ├── email/          # Resend client + templates
│   │   └── payments/       # Stripe client
│   ├── plugins/
│   │   ├── auth.ts         # Plugin JWT Fastify
│   │   └── swagger.ts      # Plugin OpenAPI
│   ├── schemas/            # Re-export do packages/schemas
│   ├── server.ts           # Entry point Fastify
│   └── app.ts              # Configuração e plugins
├── tests/
│   ├── fixtures/
│   └── integration/
├── Dockerfile
├── .dockerignore
├── biome.json
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

**`apps/api/package.json` — dependências principais:**

```json
{
  "name": "api",
  "dependencies": {
    "@fastify/cors": "^10.x",
    "@fastify/jwt": "^9.x",
    "@fastify/multipart": "^9.x",
    "@fastify/oauth2": "^8.x",
    "@fastify/rate-limit": "^10.x",
    "@fastify/swagger": "^9.x",
    "@fastify/swagger-ui": "^5.x",
    "@aws-sdk/client-s3": "^3.x",
    "@upstash/redis": "^1.x",
    "bcrypt": "^5.1.x",
    "csv-stringify": "^6.x",
    "dayjs": "^1.x",
    "fastify": "^5.6.x",
    "fastify-type-provider-zod": "^4.x",
    "resend": "^4.x",
    "stripe": "^17.x",
    "uuidv7": "^1.x",
    "zod": "^4.3.x",
    "@ybr/database": "workspace:*",
    "@ybr/schemas": "workspace:*",
    "@ybr/types": "workspace:*"
  },
  "devDependencies": {
    "@faker-js/faker": "^9.x",
    "vitest": "^4.x",
    "tsup": "^8.5.x"
  }
}
```

**Checklist:**

- [x] Estrutura de pastas criada
- [x] `package.json` com todas as dependências
- [x] `server.ts` e `app.ts` com Fastify bootstrapped
- [x] Plugin JWT configurado
- [x] Plugin Swagger configurado
- [x] Endpoint `GET /health` funcionando
- [x] `Dockerfile` multi-stage criado (ver `docs/11-docker-devops.md`)
- [x] `biome.json` local configurado

---

### 0.9 — App: `apps/web` — Scaffold

> **Responsável:** `react-senior-engineer`

```
apps/web/
├── src/
│   ├── app/
│   │   ├── globals.css           # Tokens do design system (ver doc 13)
│   │   ├── layout.tsx            # RootLayout com fontes DM Serif + Inter
│   │   ├── page.tsx              # Redirect para /dashboard ou landing
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── cadastro/page.tsx
│   │   │   ├── esqueci-senha/page.tsx
│   │   │   └── nova-senha/page.tsx
│   │   ├── (student)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── meus-cursos/page.tsx
│   │   │   ├── cursos/[slug]/page.tsx
│   │   │   └── cursos/[slug]/aulas/[lessonId]/page.tsx
│   │   ├── (public)/
│   │   │   ├── [courseSlug]/page.tsx   # Página de vendas
│   │   │   └── checkout/[courseSlug]/page.tsx
│   │   ├── confirmacao/page.tsx
│   │   ├── certificado/[id]/page.tsx
│   │   └── verificar/[code]/page.tsx
│   ├── components/
│   │   ├── ui/                  # Shadcn locais
│   │   ├── player/
│   │   │   └── VideoPlayer.tsx  # Wrapper do @ybr/hls-player
│   │   ├── course/
│   │   ├── checkout/
│   │   └── layout/
│   │       ├── StudentNav.tsx
│   │       └── Header.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts        # Fetch wrapper tipado
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── payments.ts
│   │   │   └── progress.ts
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useCourses.ts
│   │       └── useProgress.ts
│   └── middleware.ts             # Proteção de rotas autenticadas
├── public/
├── Dockerfile
├── .dockerignore
├── biome.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

**`apps/web/package.json` — dependências principais:**

```json
{
  "name": "web",
  "dependencies": {
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-progress": "^1.x",
    "@radix-ui/react-accordion": "^1.x",
    "@stripe/react-stripe-js": "^3.x",
    "@stripe/stripe-js": "^5.x",
    "@tanstack/react-query": "^5.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "lucide-react": "^0.x",
    "next": "15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-hook-form": "^7.x",
    "tailwind-merge": "^2.x",
    "zustand": "^5.x",
    "@ybr/hls-player": "workspace:*",
    "@ybr/schemas": "workspace:*",
    "@ybr/types": "workspace:*",
    "@ybr/ui": "workspace:*"
  }
}
```

**`apps/web/src/app/globals.css`** — deve conter os tokens completos do design system (ver [doc 13](./13-design-system.md)):

```css
@import "tailwindcss";

@theme {
  --font-dm-serif: var(--font-dm-serif-display);
  --font-inter: var(--font-inter);

  /* Primary — Terracotta */
  --color-primary: #984207;
  --color-on-primary: #ffffff;
  --color-primary-container: #b85a21;

  /* Secondary — Gold */
  --color-secondary: #755b00;
  --color-secondary-container: #fed977;

  /* Surface */
  --color-background: #fff8f6;
  --color-surface: #fff8f6;
  --color-surface-container: #fdeae2;
  --color-on-surface: #231915;
  --color-on-surface-variant: #56433a;

  /* Tertiary — Ocean Blue */
  --color-tertiary: #006480;

  /* Error */
  --color-error: #ba1a1a;

  /* Outline */
  --color-outline: #897268;
  --color-outline-variant: #dcc1b5;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;
}
```

**Checklist:**

- [x] Estrutura de pastas criada
- [x] `package.json` com todas as dependências
- [x] `globals.css` com todos os tokens de cor
- [x] `layout.tsx` com `next/font` carregando DM Serif Display + Inter
- [x] `middleware.ts` protegendo rotas `/dashboard`, `/meus-cursos`, `/cursos/*`
- [x] `next.config.ts` configurado (output standalone para Docker)
- [x] `Dockerfile` multi-stage criado (ver `docs/11-docker-devops.md`)

---

### 0.10 — App: `apps/admin` — Scaffold

> **Responsável:** `react-senior-engineer`

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Redirect para /admin/dashboard
│   │   └── admin/
│   │       ├── layout.tsx        # Admin shell (sidebar + header)
│   │       ├── dashboard/page.tsx
│   │       ├── cursos/
│   │       │   ├── page.tsx             # Listagem
│   │       │   ├── novo/page.tsx        # Criar curso
│   │       │   └── [id]/
│   │       │       ├── editar/page.tsx  # Editar info
│   │       │       └── conteudo/page.tsx # Editor de módulos/aulas
│   │       ├── alunos/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── cupons/page.tsx
│   │       └── configuracoes/page.tsx
│   └── components/
│       ├── ui/
│       └── admin/
│           ├── AdminSidebar.tsx
│           └── CourseContentEditor.tsx
├── Dockerfile
├── biome.json
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Checklist:**

- [x] Estrutura de pastas criada
- [x] `package.json` com dependências (mesmo que `apps/web` + drag-and-drop para editor de conteúdo)
- [x] `globals.css` com mesmos tokens de cor
- [ ] Admin shell com sidebar (baseado em `layout/desktop-layout/dashboard_desktop/code.html`) _(a implementar na Fase 1)_
- [ ] Middleware de autenticação + verificação de role `creator` ou `admin` _(a implementar na Fase 1)_

---

### 0.11 — Docker Compose para Desenvolvimento Local

> **Responsável:** `nodejs-especialist`

Crie `platform/docker-compose.yml`:

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ybr_platform_dev
      POSTGRES_USER: ybr_user
      POSTGRES_PASSWORD: ybr_local_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ybr_user -d ybr_platform_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

**`platform/.env.example`** (raiz do monorepo):

```bash
# === API ===
DATABASE_URL=postgresql://ybr_user:ybr_local_pass@localhost:5432/ybr_platform_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace_with_min_32_chars_random_string_here
JWT_REFRESH_SECRET=replace_with_another_32_chars_random_string
NODE_ENV=development
PORT=3001

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Bunny Stream (Fase 1)
BUNNY_STREAM_API_KEY=...
BUNNY_VIDEO_LIBRARY_ID=...
BUNNY_VIDEO_PULL_ZONE_URL=https://vz-xxx.b-cdn.net/

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=ybr-platform
R2_PUBLIC_URL=https://assets.seu-dominio.com

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@seu-dominio.com

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# === FRONTEND (apps/web e apps/admin) ===
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BUNNY_PULL_ZONE_URL=https://vz-xxx.b-cdn.net/
```

**Checklist:**

- [x] `docker-compose.yml` criado e testado
- [x] `.env.example` na raiz criado
- [ ] `docker compose up -d` levanta Postgres + Redis sem erros _(requer configuração local do `.env`)_
- [ ] `.env.local` configurado localmente (não commitado) _(ação manual do usuário)_
- [x] `pnpm install` roda sem erros (519 pacotes instalados)
- [ ] `pnpm dev` sobe todos os apps _(requer conta Neon + Upstash configuradas)_

---

### 0.12 — CI/CD: GitHub Actions

> **Responsável:** `nodejs-especialist` + configuração manual de secrets

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: ybr_test
          POSTGRES_USER: ybr_user
          POSTGRES_PASSWORD: ybr_test_pass
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://ybr_user:ybr_test_pass@localhost:5432/ybr_test
      JWT_SECRET: test_secret_at_least_32_chars_long
      JWT_REFRESH_SECRET: test_refresh_secret_32_chars_long
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter database migrate
      - run: pnpm test
```

**Checklist:**

- [x] `ci.yml` criado
- [x] `deploy.yml` criado (ver `docs/11-docker-devops.md` para o template completo)
- [ ] Secrets configurados no GitHub: `VERCEL_TOKEN`, `RAILWAY_TOKEN`, `GHCR_TOKEN` _(ação manual do usuário)_
- [x] `pnpm type-check` passando em todos os 3 apps (admin, web, api)

---

### 0.14 — Testes Automatizados na API — `nodejs-especialist` + `qa-tester`

> **Objetivo:** Infraestrutura de testes configurada e testes das funcionalidades já entregues implementados e validados.
> **Framework:** Vitest 4.x + `@vitest/coverage-v8`

**Estrutura de testes criada:**

```
apps/api/
└── tests/
    ├── setup.ts                    # Env vars globais para testes (JWT, Redis, Stripe...)
    ├── helpers/
    │   └── build-test-app.ts       # buildTestApp() — instância Fastify pronta para inject()
    ├── health.test.ts              # GET /health + 404 para rotas desconhecidas
    ├── app.test.ts                 # Comportamentos de ambiente (Swagger, CORS fallbacks)
    └── schemas/
        ├── auth.test.ts            # registerSchema, loginSchema, forgotPassword, resetPassword
        ├── courses.test.ts         # createCourse, updateCourse, createModule, createLesson, reorder
        ├── payments.test.ts        # createPaymentIntent, validateCoupon
        └── progress.test.ts        # updateProgress
```

**Configuração:**

- `vitest.config.ts` — ambiente `node`, setupFiles, coverage com thresholds
- Coverage excluí `src/infrastructure/**` (wrappers de SDK externos, sem lógica de negócio)
- Thresholds: linhas ≥70%, funções ≥70%, branches ≥60%
- Scripts: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`

**Resultados:**

| Métrica    | Valor atual | Threshold |
| ---------- | ----------- | --------- |
| Statements | 100%        | 70%       |
| Functions  | 100%        | 70%       |
| Branches   | 91.66%      | 60%       |
| Lines      | 100%        | 70%       |

**Checklist:**

- [x] `@vitest/coverage-v8` instalado
- [x] `tests/setup.ts` configurado com todas as env vars necessárias
- [x] `vitest.config.ts` atualizado com cobertura + thresholds
- [x] `tests/helpers/build-test-app.ts` criado
- [x] `tests/health.test.ts` — 6 testes (endpoint health + 404s)
- [x] `tests/app.test.ts` — 4 testes (Swagger por ambiente, CORS fallbacks)
- [x] `tests/schemas/auth.test.ts` — 17 testes
- [x] `tests/schemas/courses.test.ts` — 21 testes
- [x] `tests/schemas/payments.test.ts` — 8 testes
- [x] `tests/schemas/progress.test.ts` — 7 testes
- [x] **63 testes passando** (`pnpm test`)
- [x] **Cobertura acima dos thresholds** (`pnpm test:coverage`)
- [x] `buildApp` silencia logger em `NODE_ENV=test`
- [x] Agentes `nodejs-especialist`, `backend-bug-fixer`, `qa-tester` atualizados com regras de testes obrigatórios

---

### 0.13 — Internacionalização (i18n) — `react-senior-engineer`

> **Objetivo:** Suporte multi-idiomas desde o início — Inglês (padrão), Português BR e Espanhol.
> **Biblioteca:** `next-intl` (App Router nativo, TypeScript-safe)

**Idiomas suportados:**

| Código  | Idioma             | Padrão |
| ------- | ------------------ | ------ |
| `en`    | English (US)       | ✅ Sim |
| `pt-BR` | Português (Brasil) | ❌ Não |
| `es`    | Español            | ❌ Não |

**Estrutura de arquivos criados:**

```
apps/web/
├── messages/
│   ├── en.json           # Inglês (padrão) — textos de UI
│   ├── pt-BR.json        # Português BR
│   └── es.json           # Espanhol
├── src/
│   ├── i18n/
│   │   ├── routing.ts    # defineRouting({ locales, defaultLocale: 'en' })
│   │   └── request.ts    # getRequestConfig (carrega mensagens do locale ativo)
│   ├── app/
│   │   ├── layout.tsx    # Root layout mínimo (sem lang, sem fonts)
│   │   ├── page.tsx      # Redireciona para /en
│   │   └── [locale]/
│   │       ├── layout.tsx  # Layout com NextIntlClientProvider + fonts
│   │       └── page.tsx    # Página home do locale
│   ├── components/
│   │   └── locale-switcher.tsx  # Seletor de idioma (EN/PT/ES)
│   └── middleware.ts    # next-intl + auth combinados
└── next.config.ts        # withNextIntl() plugin

apps/admin/  (mesma estrutura)
```

**Padrão de uso em componentes:**

```tsx
// Server Component
import { getTranslations } from "next-intl/server";
const MyPage = async () => {
  const t = await getTranslations("auth.login");
  return <h1>{t("title")}</h1>;
};

// Client Component
("use client");
import { useTranslations } from "next-intl";
const MyForm = () => {
  const t = useTranslations("auth.login");
  return <button>{t("submitButton")}</button>;
};
```

**Regra obrigatória:** NUNCA escrever texto de UI hardcoded em componentes. Sempre usar chaves de mensagens.

**Checklist:**

- [x] `next-intl` instalado em `apps/web` e `apps/admin`
- [x] `apps/web/src/i18n/routing.ts` criado
- [x] `apps/web/src/i18n/request.ts` criado
- [x] `apps/web/messages/en.json` criado (todas as seções: auth, dashboard, myCourses, course, checkout, etc.)
- [x] `apps/web/messages/pt-BR.json` criado
- [x] `apps/web/messages/es.json` criado
- [x] `apps/web/src/app/layout.tsx` refatorado para root mínimo
- [x] `apps/web/src/app/page.tsx` redirecionando para `/en`
- [x] `apps/web/src/app/[locale]/layout.tsx` criado com `NextIntlClientProvider`
- [x] `apps/web/src/app/[locale]/page.tsx` criado
- [x] `apps/web/src/middleware.ts` atualizado com `next-intl` + auth
- [x] `apps/web/next.config.ts` atualizado com `withNextIntl()`
- [x] `apps/web/src/components/locale-switcher.tsx` criado
- [x] `apps/admin/src/i18n/routing.ts` criado
- [x] `apps/admin/src/i18n/request.ts` criado
- [x] `apps/admin/messages/en.json` criado (seções: auth, dashboard, courses, modules, lessons, students, analytics, settings)
- [x] `apps/admin/messages/pt-BR.json` criado
- [x] `apps/admin/messages/es.json` criado
- [x] `apps/admin/src/app/layout.tsx` refatorado
- [x] `apps/admin/src/app/page.tsx` redirecionando para `/en`
- [x] `apps/admin/src/app/[locale]/layout.tsx` criado com `NextIntlClientProvider`
- [x] `apps/admin/src/app/[locale]/page.tsx` criado
- [x] `apps/admin/src/middleware.ts` criado (novo — admin não tinha)
- [x] `apps/admin/next.config.ts` atualizado com `withNextIntl()`
- [x] `apps/admin/src/components/locale-switcher.tsx` criado
- [x] Type-check passando em `apps/web` e `apps/admin`

---

## FASE 1 — MVP (Semana 3–8)

### 1.1 — Autenticação (Semana 3)

#### Backend — `nodejs-especialist`

**Rotas a implementar:**

| Método | Rota                    | Descrição                                                                   |
| ------ | ----------------------- | --------------------------------------------------------------------------- |
| `POST` | `/auth/register`        | Registro com email + senha. Hash bcrypt. Enviar email de boas-vindas.       |
| `POST` | `/auth/login`           | Retorna `{ accessToken, refreshToken, user }`. Access: 15min, Refresh: 30d. |
| `POST` | `/auth/refresh`         | Recebe refreshToken, retorna novo accessToken.                              |
| `POST` | `/auth/logout`          | Invalida refreshToken no Redis.                                             |
| `POST` | `/auth/forgot-password` | Gera token de 6 chars, armazena no Redis (TTL 1h), envia email.             |
| `POST` | `/auth/reset-password`  | Verifica token Redis, atualiza senha, invalida token.                       |
| `GET`  | `/auth/me`              | Retorna dados do usuário autenticado (requer JWT).                          |

**Segurança obrigatória:**

- Rate limiting em `/auth/login` e `/auth/forgot-password` (5 req/min)
- Comparação de senha em tempo constante (bcrypt)
- RefreshToken armazenado como hash no Redis (não o token raw)
- Access token com payload mínimo (`{ sub: userId, role }`)

- [ ] Schemas Zod para todos os endpoints
- [ ] Functions layer: `registerUser`, `loginUser`, `refreshToken`, `forgotPassword`, `resetPassword`
- [ ] Infrastructure: `email/auth-emails.ts` — templates Resend (boas-vindas, recuperação)
- [ ] Plugin JWT configurado em `plugins/auth.ts`
- [ ] Testes unitários para cada function (`qa-tester`)

#### Frontend — `react-senior-engineer`

**Referência de layout:** `ybr-plataform/layout/desktop-layout/login_desktop/code.html`

Páginas a implementar (todas em PT-BR, design Artisanal Sophistication):

| Página          | Rota                    | Layout base               |
| --------------- | ----------------------- | ------------------------- |
| Login           | `/login`                | `login_desktop/code.html` |
| Cadastro        | `/cadastro`             | Derivado do login         |
| Esqueci a Senha | `/esqueci-senha`        | Derivado do login         |
| Nova Senha      | `/nova-senha?token=...` | Derivado do login         |

- [ ] Páginas criadas com React Hook Form + schemas do `packages/schemas`
- [ ] API client: `lib/api/auth.ts` com métodos `login()`, `register()`, `forgotPassword()`, `resetPassword()`
- [ ] TanStack Query mutation hooks: `useLogin`, `useRegister`
- [ ] Zustand store para auth state (`useAuthStore`)
- [ ] Middleware Next.js protegendo rotas autenticadas
- [ ] Redirect automático para `/dashboard` após login

**Checklist geral auth:**

- [ ] Backend: todos os endpoints funcionando com testes
- [ ] Frontend: todas as telas implementadas e integradas
- [ ] Fluxo completo testado E2E: register → login → access protected route → logout

---

### 1.2 — Gestão de Cursos — Admin (Semana 3–4)

#### Backend — `nodejs-especialist`

| Método   | Rota                               | Descrição                                      |
| -------- | ---------------------------------- | ---------------------------------------------- |
| `GET`    | `/admin/courses`                   | Lista cursos do criador autenticado (paginado) |
| `POST`   | `/admin/courses`                   | Cria novo curso (status: draft)                |
| `GET`    | `/admin/courses/:id`               | Detalhes completos do curso                    |
| `PATCH`  | `/admin/courses/:id`               | Atualiza dados do curso                        |
| `DELETE` | `/admin/courses/:id`               | Soft delete (status: archived)                 |
| `POST`   | `/admin/courses/:id/publish`       | Publica curso (status: published)              |
| `POST`   | `/admin/courses/:courseId/modules` | Cria módulo                                    |
| `PATCH`  | `/admin/modules/:moduleId`         | Atualiza módulo                                |
| `DELETE` | `/admin/modules/:moduleId`         | Remove módulo                                  |
| `PATCH`  | `/admin/modules/reorder`           | Reordena módulos (array de `{ id, position }`) |
| `POST`   | `/admin/modules/:moduleId/lessons` | Cria aula                                      |
| `PATCH`  | `/admin/lessons/:lessonId`         | Atualiza aula                                  |
| `DELETE` | `/admin/lessons/:lessonId`         | Remove aula                                    |
| `POST`   | `/admin/courses/:id/thumbnail`     | Upload de thumbnail para R2                    |
| `POST`   | `/admin/lessons/:id/video`         | Gera URL de upload para Bunny Stream           |

**Upload de thumbnail — fluxo:**

1. Frontend envia `multipart/form-data` para `/admin/courses/:id/thumbnail`
2. API faz upload para Cloudflare R2 via `@aws-sdk/client-s3`
3. Retorna URL pública salva em `courses.thumbnail_url`

**Upload de vídeo — fluxo Bunny Stream (Fase 1):**

1. Frontend chama `POST /admin/lessons/:id/video` → API cria vídeo no Bunny Stream API → retorna `{ uploadUrl, videoId }`
2. Frontend faz upload diretamente para o `uploadUrl` do Bunny
3. Quando upload completa, Bunny processa o vídeo
4. Frontend chama `PATCH /admin/lessons/:id` com `{ bunny_video_id: videoId }`

- [ ] Todas as rotas implementadas com Zod validation
- [ ] Middleware de autorização: apenas `creator` acessa `/admin/*`
- [ ] Integração com Cloudflare R2 para thumbnails
- [ ] Integração com Bunny Stream API para upload de vídeo
- [ ] Testes das rotas CRUD

#### Frontend — `react-senior-engineer`

**Referência de layout:** `layout/desktop-layout/dashboard_desktop/code.html`

| Página Admin       | Rota                         | Descrição                                       |
| ------------------ | ---------------------------- | ----------------------------------------------- |
| Dashboard Admin    | `/admin/dashboard`           | KPIs: cursos, alunos, receita                   |
| Listagem de Cursos | `/admin/cursos`              | Tabela com status, alunos, ações                |
| Criar Curso        | `/admin/cursos/novo`         | Formulário: título, descrição, preço, thumbnail |
| Editar Curso       | `/admin/cursos/:id/editar`   | Mesmo formulário com dados preenchidos          |
| Editor de Conteúdo | `/admin/cursos/:id/conteudo` | Drag-and-drop de módulos e aulas                |

- [ ] Admin Shell com sidebar de navegação
- [ ] Listagem de cursos com TanStack Query
- [ ] Formulário de criação/edição de curso com upload de thumbnail
- [ ] Editor de conteúdo com accordion de módulos + aulas (drag-and-drop com `@dnd-kit/core`)
- [ ] Upload de vídeo com progress bar

---

### 1.3 — Player de Vídeo (Semana 4)

#### Backend — `nodejs-especialist`

| Método | Rota                   | Descrição                                                 |
| ------ | ---------------------- | --------------------------------------------------------- |
| `GET`  | `/student/lessons/:id` | Retorna dados da aula + URL de streaming tokenizada       |
| `POST` | `/student/progress`    | Salva progresso `{ lessonId, watchedSeconds, completed }` |

**Geração de URL tokenizada Bunny Stream:**

```typescript
// Bunny Token Authentication
const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1h
const token = crypto
  .createHash("sha256")
  .update(`${BUNNY_TOKEN_KEY}${videoId}${expirationTime}`)
  .digest("hex");

const streamUrl = `${BUNNY_PULL_ZONE_URL}${videoId}/playlist.m3u8?token=${token}&expires=${expirationTime}`;
```

- [ ] Endpoint de streaming com token Bunny
- [ ] Endpoint de progresso (upsert: cria ou atualiza)
- [ ] Rate limiting no endpoint de progresso (1 req/5s por usuário)

#### Frontend — `react-senior-engineer`

**Referência de layout:** `layout/desktop-layout/player_de_aula_desktop/code.html`

- [ ] Componente `VideoPlayer.tsx` usando `@ybr/hls-player`
- [ ] Página de aula: player + sidebar de módulos/aulas
- [ ] Auto-save de progresso a cada 10 segundos enquanto assiste
- [ ] Marcação de aula como concluída ao atingir 90% do vídeo
- [ ] Progress bar dourada por módulo (Gold do design system)
- [ ] Tabs: Aula / Materiais / Minhas Notas

---

### 1.4 — Checkout e Pagamentos (Semana 4–5)

#### Backend — `nodejs-especialist`

| Método | Rota                      | Descrição                                                           |
| ------ | ------------------------- | ------------------------------------------------------------------- |
| `GET`  | `/public/courses/:slug`   | Dados públicos do curso para a landing page e checkout              |
| `POST` | `/payments/create-intent` | Cria PaymentIntent no Stripe. Body: `{ courseId, couponCode? }`     |
| `POST` | `/payments/webhook`       | Webhook Stripe. Ação em `payment_intent.succeeded`: cria enrollment |
| `POST` | `/coupons/validate`       | Valida cupom e retorna desconto aplicado                            |

**Fluxo de checkout:**

1. Aluno visita `/checkout/:courseSlug`
2. Frontend chama `GET /public/courses/:slug` para dados do curso
3. Frontend chama `POST /payments/create-intent` → recebe `clientSecret`
4. Stripe Elements renderiza com `clientSecret`
5. Aluno preenche cartão e confirma
6. Stripe chama `POST /payments/webhook` com `payment_intent.succeeded`
7. API cria `enrollment` no banco e envia email de confirmação (Resend)
8. Frontend redireciona para `/confirmacao`

**Segurança obrigatória:**

```typescript
// SEMPRE validar assinatura do webhook Stripe
const event = stripe.webhooks.constructEvent(
  rawBody,
  request.headers["stripe-signature"],
  STRIPE_WEBHOOK_SECRET,
);
```

- [ ] `POST /payments/create-intent` com cálculo de desconto de cupom
- [ ] `POST /payments/webhook` com validação de assinatura
- [ ] Criação de enrollment após pagamento confirmado
- [ ] Email de confirmação de compra (Resend)
- [ ] Endpoint de validação de cupom
- [ ] Testes do webhook Stripe com stripe-cli

#### Frontend — `react-senior-engineer`

**Referência de layout:** `layout/desktop-layout/checkout_desktop/code.html`

- [ ] Página de checkout com Stripe Elements embutido
- [ ] Display "6x de $37" em destaque (parcelamento)
- [ ] Campo de cupom de desconto com validação em tempo real
- [ ] Apple Pay / Google Pay (Payment Request Button)
- [ ] Página de confirmação `/confirmacao` com resumo da compra
- [ ] Loading state e error handling

---

### 1.5 — Área do Aluno (Semana 5–6)

#### Backend — `nodejs-especialist`

| Método | Rota                               | Descrição                                              |
| ------ | ---------------------------------- | ------------------------------------------------------ |
| `GET`  | `/student/enrollments`             | Lista cursos matriculados com progresso agregado       |
| `GET`  | `/student/courses/:id`             | Detalhes completos: módulos, aulas, progresso por aula |
| `GET`  | `/student/lessons/:id/attachments` | Lista materiais da aula                                |

**Middleware de acesso ao curso:**

```typescript
// Verificar enrollment antes de liberar aula
const enrollment = await db.query.enrollments.findFirst({
  where: and(
    eq(enrollments.userId, request.user.id),
    eq(enrollments.courseId, lesson.module.courseId),
    eq(enrollments.status, "active"),
  ),
});
if (!enrollment) throw new ForbiddenError("Acesso negado");
```

- [ ] Endpoints com enrollment check middleware
- [ ] Cálculo de progresso: `completedLessons / totalLessons * 100`
- [ ] "Próxima aula" calculada (primeira aula não concluída do módulo em andamento)

#### Frontend — `react-senior-engineer`

**Referências de layout:**

- Dashboard: `layout/desktop-layout/dashboard_desktop/code.html`
- Meus Cursos: `layout/desktop-layout/meus_cursos_desktop/code.html`
- Visão Geral: `layout/desktop-layout/vis_o_geral_do_curso_desktop/code.html`

| Tela                 | Rota                            | Descrição                                      |
| -------------------- | ------------------------------- | ---------------------------------------------- |
| Dashboard            | `/dashboard`                    | Boas-vindas, cursos em andamento, próxima aula |
| Meus Cursos          | `/meus-cursos`                  | Grid de cards de curso com progresso           |
| Visão Geral do Curso | `/cursos/:slug`                 | Módulos accordion + progresso por módulo       |
| Player de Aula       | `/cursos/:slug/aulas/:lessonId` | Player + sidebar + tabs                        |

- [ ] Dashboard com "continuar de onde parou"
- [ ] Cards de curso com barra de progresso gold
- [ ] Módulos expandíveis com lista de aulas e ícone de conclusão
- [ ] Download de materiais (link direto para R2)

---

### 1.6 — Página de Vendas (Semana 6–7)

#### Backend — `nodejs-especialist`

| Método | Rota                    | Descrição                                                                          |
| ------ | ----------------------- | ---------------------------------------------------------------------------------- |
| `GET`  | `/public/courses/:slug` | Dados públicos: título, descrição, módulos públicos, instrutor, preço, depoimentos |

- [ ] Endpoint público (sem autenticação)
- [ ] Cache Redis por 5 minutos (cursos publicados mudam raramente)
- [ ] SEO: dados para `<title>`, `<meta description>`, Open Graph

#### Frontend — `react-senior-engineer`

**Referência de layout:** `layout/desktop-layout/p_gina_de_vendas_desktop/code.html`

Seções obrigatórias:

1. Hero (título, subtítulo, CTA, thumbnail do curso)
2. Dores / Transformação
3. Para quem é este curso
4. Módulos e conteúdo (accordion)
5. Instrutor (bio, foto)
6. Depoimentos (testimonials)
7. Preço com parcelamento destacado
8. Garantia (15 dias)
9. FAQ (accordion)
10. CTA final

- [ ] Landing page com todas as seções
- [ ] Countdown timer configurável
- [ ] CTA fixo no mobile
- [ ] Metadata dinâmica com `generateMetadata()` do Next.js
- [ ] Schema.org `Course` para SEO

---

### 1.7 — Emails Transacionais (Semana 7)

> **Responsável:** `nodejs-especialist`

**Templates a criar com Resend + React Email:**

| Template                    | Trigger                            | Assunto                             |
| --------------------------- | ---------------------------------- | ----------------------------------- |
| `welcome.tsx`               | `POST /auth/register`              | "Bem-vinda ao Ateliê YBR! 🎉"       |
| `purchase-confirmation.tsx` | Webhook `payment_intent.succeeded` | "Sua compra foi confirmada!"        |
| `course-access.tsx`         | Enrollment criado                  | "Seu acesso ao curso está liberado" |
| `password-reset.tsx`        | `POST /auth/forgot-password`       | "Recuperação de senha"              |
| `lesson-reminder.tsx`       | Job agendado (7 dias sem login)    | "Sentimos sua falta na cozinha! 👨‍🍳" |

**Padrão visual:** Mesma paleta do design system (Terracotta + Warm Cream). Templates em PT-BR.

- [ ] 5 templates criados em `infrastructure/email/templates/`
- [ ] Utilitário `sendEmail({ to, template, data })` encapsulando Resend
- [ ] Testados com preview local via React Email

---

### 1.8 — Certificados (Semana 8)

#### Backend — `nodejs-especialist`

| Método | Rota                                | Descrição                                       |
| ------ | ----------------------------------- | ----------------------------------------------- |
| `POST` | `/certificates/generate`            | Dispara ao concluir 100% do curso. Idempotente. |
| `GET`  | `/certificates/:id`                 | Dados do certificado (protegido — só o dono)    |
| `GET`  | `/public/certificates/:code/verify` | Verificação pública por código                  |

**Geração do certificado:**

- Código de verificação: UUID v7 (curto e único)
- PDF gerado com `pdf-lib` ou `puppeteer` (HTML renderizado)
- PDF salvo no Cloudflare R2
- URL pública salva em `certificates.certificate_url`

- [ ] Lógica de verificação de 100% de conclusão do curso
- [ ] Geração de PDF com identidade visual da plataforma
- [ ] Upload do PDF para R2
- [ ] Endpoints de consulta e verificação pública

#### Frontend — `react-senior-engineer`

- [ ] Página `/certificado/:id` com visualização e botão de download
- [ ] Botão "Compartilhar no LinkedIn" (link pré-formatado)
- [ ] Página pública `/verificar/:code` mostrando dados do certificado

---

### 1.9 — Testes e Qualidade (Semana 8)

> **Responsável:** `qa-tester`

**Cobertura mínima obrigatória antes do launch:**

- Unitários backend: > 70%
- E2E fluxos críticos: 100% dos fluxos abaixo

**Fluxos E2E obrigatórios:**

| Fluxo            | Passos                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Registro → Login | Criar conta → Login → Ver dashboard                                                                |
| Compra de curso  | Acessar landing page → Checkout com cartão teste Stripe → Confirmar compra → Acessar área de aluno |
| Assistir aula    | Login → Meus cursos → Abrir aula → Player carrega → Progresso salvo                                |
| Certificado      | Completar todas as aulas → Certificado gerado → Download PDF → Verificar URL pública               |

**Performance obrigatória (Lighthouse):**

- LCP < 2.5s
- FID/INP < 100ms
- CLS < 0.1
- Acessibilidade > 90

- [ ] Testes unitários para todas as functions do backend
- [ ] Testes de integração para endpoints críticos (auth, payments, enrollments)
- [ ] Auditoria de acessibilidade (WCAG 2.1 AA)
- [ ] Auditoria de performance com Lighthouse

---

## FASE 2 — Experiência Completa (Semana 9–16)

### 2.1 — Comunidade (Semana 9–10)

> **Responsável:** `nodejs-especialist` + `react-senior-engineer`

**Backend:**

- [ ] Tabela `forum_posts` (id, lesson_id, user_id, content, parent_id FK recursivo, timestamps)
- [ ] `GET /student/lessons/:id/posts` — lista perguntas da aula
- [ ] `POST /student/lessons/:id/posts` — cria pergunta ou resposta
- [ ] Notificação por email quando resposta recebida

**Frontend:**

- [ ] Tab "Comunidade" na página de aula
- [ ] Thread de perguntas com respostas aninhadas
- [ ] Input de nova pergunta com markdown básico

---

### 2.2 — Analytics Avançado (Semana 10–11)

> **Responsável:** `nodejs-especialist` + `react-senior-engineer`

**Backend:**

- [ ] View materializada: `course_analytics` (vendas, receita, conclusão por módulo)
- [ ] `GET /admin/analytics` — dashboard com todos os KPIs
- [ ] Job diário: identificar alunos sem login há 7 dias → disparar email de lembrete

**Frontend:**

- [ ] Dashboard admin com gráficos (Recharts ou Chart.js)
- [ ] Funil de abandono por módulo
- [ ] Tabela de alunos com última atividade

---

### 2.3 — Migração para Mux Video (Semana 11–12)

> **Responsável:** `nodejs-especialist` + `react-senior-engineer`

**Decisão de migração:** Trigger quando MRR > $500/mês ou necessidade de legendas automáticas.

**Backend:**

- [ ] Adicionar campos `mux_asset_id`, `mux_playback_id` na tabela `lessons`
- [ ] `POST /admin/lessons/:id/video/mux` — cria upload direto via Mux API
- [ ] Webhook Mux: `video.asset.ready` → salva `mux_playback_id` na aula
- [ ] Endpoint de streaming: gera signed URL Mux (JWT Token)

**Frontend:**

- [ ] `VideoPlayer.tsx` já usa `@ybr/hls-player` — **apenas trocar a prop `src`**:

  ```tsx
  // Fase 1 (Bunny)
  src={`${BUNNY_PULL_ZONE_URL}${lesson.bunny_video_id}/playlist.m3u8?token=...`}

  // Fase 2 (Mux) — mesmo componente, URL diferente
  src={`https://stream.mux.com/${lesson.mux_playback_id}.m3u8?token=${signedToken}`}
  ```

- [ ] Zero mudança no componente player — apenas a URL muda

---

### 2.4 — Cupons e Promoções (Semana 12)

> **Responsável:** `nodejs-especialist` + `react-senior-engineer`

**Backend:**

- [ ] CRUD completo de cupons no admin
- [ ] Validação: data de expiração, limite de usos, tipo (percentual/fixo)
- [ ] Rastreamento de uso por cupom (analytics de afiliados)

**Frontend:**

- [ ] Painel admin: `/admin/cupons`
- [ ] Campo de cupom no checkout com desconto aplicado em tempo real

---

### 2.5 — Multi-tenancy Básico (Semana 13–15)

> **Responsável:** `nodejs-especialist` + `react-senior-engineer`

**Backend:**

- [ ] Tabela `creator_plans` com limites por plano (Starter/Growth/Pro/Agency)
- [ ] Stripe Billing: webhook `customer.subscription.updated` → atualiza plano no banco
- [ ] RLS (Row Level Security) no Neon: dados de alunos e cursos isolados por `creator_id`
- [ ] Subdomínio: lógica de resolução de tenant por hostname

**Frontend:**

- [ ] Onboarding flow para novo criador
- [ ] Painel de configurações de conta e plano
- [ ] Customização de tema (cor primária)

---

### 2.6 — PWA (Semana 15–16)

> **Responsável:** `react-senior-engineer`

- [ ] `next-pwa` configurado no `next.config.ts`
- [ ] Service Worker com cache de assets e aulas visitadas
- [ ] `manifest.json` com ícone da plataforma
- [ ] Notificações push via Web Push API (nova aula publicada)

---

## FASE 3 — Escala e App Nativo (Mês 5+)

> **Responsável:** `react-native-specialist`

- [ ] Projeto Expo criado em `apps/mobile/`
- [ ] Autenticação JWT (mesmo backend)
- [ ] Player de vídeo nativo via `expo-av` ou wrapper HLS
- [ ] Download offline de aulas
- [ ] Push notifications via Expo Notifications
- [ ] Deploy na App Store e Play Store via EAS

---

## Referências Rápidas

| Documento                | Localização                                        |
| ------------------------ | -------------------------------------------------- |
| Arquitetura do sistema   | `docs/03-architecture.md`                          |
| Stack técnica            | `docs/02-tech-stack.md`                            |
| Design system completo   | `docs/13-design-system.md`                         |
| Estratégia Docker/DevOps | `docs/11-docker-devops.md`                         |
| Estratégia do player HLS | `docs/12-video-player-strategy.md`                 |
| Análise de custos        | `docs/07-cost-analysis.md`                         |
| Layouts de referência    | `layout/desktop-layout/` e `layout/mobile-layout/` |
| Player HLS fonte         | `video-player/index.ts`                            |
| Design reference store   | `priscila-bravin-store/src/`                       |
| Agent PO                 | `.claude/agents/po-orchestrator.agent.md`          |

---

## Ordem de Execução Recomendada

```
Semana 1–2: FASE 0 completa
             ↓
Semana 3:   Auth (backend + frontend) — qa-tester valida
             ↓
Semana 3–4: Admin de cursos (backend + frontend)
             ↓
Semana 4:   Player de vídeo (backend + frontend + hls-player package)
             ↓
Semana 4–5: Checkout e pagamentos (backend + frontend) — qa-tester valida webhooks
             ↓
Semana 5–6: Área do aluno (backend + frontend)
             ↓
Semana 6–7: Página de vendas (backend + frontend)
             ↓
Semana 7:   Emails transacionais (backend)
             ↓
Semana 8:   Certificados (backend + frontend) + QA geral + Performance
             ↓
            🚀 LAUNCH MVP
             ↓
Semana 9+:  Fase 2 conforme demanda e métricas
```
