# 02 — Stack Tecnológica Recomendada 2026

**Data:** 2026-04-24

---

## 2.1 Visão Geral da Stack

A stack foi selecionada com base em:

- Familiaridade da equipe (Node.js + React/Next.js + TypeScript)
- Performance e experiência do aluno
- Custo de infraestrutura
- Velocidade de desenvolvimento
- Ecossistema ativo em 2026

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                │
│  React 19 + TypeScript + TailwindCSS + Shadcn/UI        │
│  App Router + Server Components + Server Actions        │
├─────────────────────────────────────────────────────────┤
│                      BACKEND (Fastify)                   │
│  Node.js + TypeScript + Fastify 5 + Drizzle ORM         │
│  JWT Auth + Zod Validation + REST API                   │
├──────────────┬──────────────────────────────────────────┤
│  PostgreSQL  │  Redis/Upstash  │  S3/R2  │  Mux Video  │
│  (primary)   │  (cache/session)│(uploads)│  (streaming)│
└──────────────┴──────────────────────────────────────────┘
```

---

## 2.2 Frontend

### Next.js 15 (App Router)

**Por que Next.js 15?**

- Server Components reduzem JavaScript no cliente → carregamento mais rápido
- Streaming SSR melhora Time to First Byte (TTFB)
- PPR (Partial Prerendering) — páginas estáticas com ilhas dinâmicas
- React 19 com Compiler automático (menos re-renders)
- Turbopack estável → 76% mais rápido no dev
- Suporte nativo a TypeScript 5.9+

**Features críticas para a plataforma:**

- `use cache` directive para invalidação granular de cache
- Server Actions para formulários sem APIs extras
- Streaming de dados de cursos (skeleton loaders nativos)
- Otimização de imagens built-in (thumbs dos cursos)
- Middleware para controle de acesso aos cursos

### React 19

- React Compiler automático → não precisa de `useMemo`/`useCallback` manual
- `useOptimistic` para UI otimista nas interações do aluno
- `useFormStatus` para estados de formulário
- Melhorias de Hydration Error para debug mais rápido

### UI & Estilo

| Biblioteca    | Versão | Uso                   |
| ------------- | ------ | --------------------- |
| TailwindCSS   | 4.x    | Estilo principal      |
| Shadcn/UI     | Latest | Componentes base      |
| Radix UI      | Latest | Primitivos acessíveis |
| Lucide React  | Latest | Ícones                |
| Framer Motion | 12.x   | Animações             |

### State Management

- **Server State:** TanStack Query v5 (React Query) para cache e sincronização
- **Client State:** Zustand (leve, simples) para estado global de UI
- **Forms:** React Hook Form + Zod para validação
- **Sem Redux** — over-engineering para este caso de uso

### Player de Vídeo (Frontend)

- **Primário:** `@mux/mux-player-react` — integração nativa com Mux
- **Fallback:** `video.js` para casos edge

---

## 2.3 Backend

### Fastify 5.6+

**Por que Fastify vs Express?**

- 2x mais rápido que Express em benchmarks
- Schema validation nativo com Zod
- Plugin ecosystem robusto
- TypeScript first
- Menor footprint de memória

**Plugins utilizados:**

- `@fastify/cors` — CORS para frontend
- `@fastify/jwt` — Autenticação JWT
- `@fastify/multipart` — Upload de arquivos
- `@fastify/swagger` + `@fastify/swagger-ui` — Documentação automática OpenAPI
- `@fastify/rate-limit` — Proteção contra abuso
- `@fastify/oauth2` — Login social (Google)
- `fastify-type-provider-zod` — Integração Zod + Fastify

### Arquitetura de Camadas

```
src/
├── routes/          # Endpoints HTTP (controllers)
│   ├── auth/
│   ├── courses/
│   ├── enrollments/
│   ├── payments/
│   └── users/
├── functions/       # Lógica de negócio
│   ├── auth/
│   ├── courses/
│   ├── video/
│   └── payments/
├── infrastructure/  # Integrações externas
│   ├── database/    # Drizzle ORM
│   ├── cache/       # Redis/Upstash
│   ├── storage/     # S3/R2
│   ├── video/       # Mux API
│   ├── email/       # Resend
│   └── payments/    # Stripe
├── schemas/         # Schemas Zod compartilhados
└── plugins/         # Plugins Fastify customizados
```

### Validação — Zod 4.3+

- Todos os inputs de API validados com Zod
- Tipos gerados automaticamente via `z.infer`
- Compartilhado entre frontend (forms) e backend (API)
- Integração nativa com Fastify via `fastify-type-provider-zod`

---

## 2.4 Banco de Dados

### PostgreSQL (Principal)

**Por que PostgreSQL?**

- ACID compliance para transações financeiras
- JSON/JSONB nativo para dados flexíveis (metadados de curso)
- Full-text search nativo (busca de cursos)
- Extensões úteis: `uuid-ossp`, `pg_trgm`
- Suporte excelente no Drizzle ORM

**Provedor recomendado:** Neon (Serverless PostgreSQL) ou Supabase

### Drizzle ORM 0.45+

- Type-safe SQL — erros em tempo de compilação
- Migrations automatizadas
- Zero overhead de runtime
- Schema-first approach
- Suporte a `drizzle-zod` para geração automática de schemas Zod

### Redis / Upstash (Cache)

**Uso:**

- Cache de sessões de usuário
- Rate limiting
- Cache de respostas de API frequentes (catálogo de cursos)
- Fila de tarefas simples (Upstash QStash)

**Provedor:** Upstash (serverless Redis, paga por request)

---

## 2.5 Infraestrutura de Vídeo

### Mux (Primário — Recomendado)

- API-first, desenvolvido para developers
- SDK oficial para Node.js e Next.js
- Adaptive bitrate streaming (HLS)
- DRM para proteção de conteúdo
- Mux Player customizável
- Analytics de engajamento por vídeo
- IA: legendas automáticas, capítulos, resumos (Mux Robots)
- Webhooks para eventos de vídeo

→ Análise completa em [04-video-hosting.md](./04-video-hosting.md)

---

## 2.6 Pagamentos

### Stripe (Primário)

- 2.9% + $0.30 por transação (US)
- Subscriptions nativas
- Checkout customizável
- Parcelamento via Stripe Installments
- Webhooks robustos

→ Análise completa em [05-payment-processing.md](./05-payment-processing.md)

---

## 2.7 Serviços Auxiliares

| Serviço             | Provedor                      | Uso                                    |
| ------------------- | ----------------------------- | -------------------------------------- |
| Email transacional  | Resend                        | Confirmação de compra, acesso ao curso |
| Storage de arquivos | Cloudflare R2 ou AWS S3       | PDFs, materiais do curso               |
| CDN de assets       | Cloudflare CDN                | Imagens, assets estáticos              |
| Search              | Algolia ou Typesense          | Busca no catálogo                      |
| Analytics           | PostHog                       | Comportamento do aluno                 |
| Error tracking      | Sentry                        | Monitoramento de erros                 |
| Logs                | Better Stack                  | Logging centralizado                   |
| Auth                | Custom JWT (Fastify) ou Clerk | Autenticação                           |

---

## 2.8 Tooling e Qualidade

| Ferramenta      | Versão | Uso                                                |
| --------------- | ------ | -------------------------------------------------- |
| Biome           | 2.3+   | Linting + Formatting (substitui ESLint + Prettier) |
| Vitest          | 4.0+   | Testes unitários e de integração                   |
| Playwright      | Latest | Testes E2E                                         |
| tsup            | 8.5+   | Build do backend                                   |
| tsx             | Latest | TypeScript execution no dev                        |
| @faker-js/faker | Latest | Fixtures para testes                               |

---

## 2.9 Requisitos de Ambiente

### Node.js

- **Versão mínima:** 22.x LTS
- **Runtime no servidor:** Node.js com tsx (dev) / tsup (produção)

### TypeScript

- **Versão:** 5.9+
- **Strict mode:** ON
- **No `any`:** Enforced via Biome

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=
REDIS_URL=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Video
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
API_URL=
```
