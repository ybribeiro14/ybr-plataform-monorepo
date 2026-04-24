# 03 — Arquitetura do Sistema

**Data:** 2026-04-24

---

## 3.1 Visão Macro da Arquitetura

```
                              INTERNET
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼──────┐        ┌────────▼────────┐
              │  CDN/Edge  │        │   Cloudflare    │
              │  (Vercel)  │        │   (Proteção)    │
              └─────┬──────┘        └────────┬────────┘
                    │                         │
         ┌──────────▼──────────────────────────▼──────────┐
         │                FRONTEND                         │
         │          Next.js 15 (App Router)                │
         │    Server Components + Client Components        │
         │         Deployed on Vercel                      │
         └────────────────────┬────────────────────────────┘
                              │ HTTP/REST + Server Actions
         ┌────────────────────▼────────────────────────────┐
         │                   API                            │
         │              Fastify 5 (Node.js)                │
         │           TypeScript + Zod + JWT                │
         │          Deployed on Railway/Render             │
         └──┬─────────────┬──────────────┬─────────────────┘
            │             │              │
    ┌───────▼──┐  ┌───────▼──┐  ┌───────▼──────┐
    │PostgreSQL│  │  Redis   │  │  Mux Video   │
    │  (Neon)  │  │(Upstash) │  │   (Stream)   │
    └──────────┘  └──────────┘  └──────────────┘
            │             │              │
    ┌───────▼──┐  ┌───────▼──┐  ┌───────▼──────┐
    │Cloudflare│  │  Stripe  │  │   Resend     │
    │    R2    │  │(Payments)│  │   (Email)    │
    └──────────┘  └──────────┘  └──────────────┘
```

---

## 3.2 Repositórios

### Estrutura Monorepo (Turborepo)

```
ybr-platform/
├── apps/
│   ├── web/              # Next.js 15 — Plataforma do aluno
│   ├── admin/            # Next.js 15 — Painel do criador
│   └── api/              # Fastify — Backend API
├── packages/
│   ├── ui/               # Componentes compartilhados (Shadcn)
│   ├── schemas/          # Schemas Zod compartilhados
│   ├── database/         # Drizzle schema + migrations
│   └── types/            # TypeScript types compartilhados
├── turbo.json
├── package.json
└── biome.json
```

**Por que Monorepo?**

- Compartilhamento de tipos entre frontend e backend
- Uma única fonte de verdade para schemas de validação
- Facilidade de deploy coordenado
- Histórico de commits unificado

---

## 3.3 Schema do Banco de Dados

### Entidades Principais

```sql
-- Usuários
users
  id (uuidv7)
  email
  password_hash
  name
  avatar_url
  role (student | creator | admin)
  created_at
  updated_at

-- Perfil do Criador
creators
  id (uuidv7)
  user_id (FK users)
  bio
  website
  stripe_account_id
  plan (starter | growth | pro | agency)
  created_at

-- Cursos
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
  language (pt-BR | en-US)
  created_at
  updated_at

-- Módulos do Curso
course_modules
  id (uuidv7)
  course_id (FK courses)
  title
  description
  position
  is_published

-- Aulas
lessons
  id (uuidv7)
  module_id (FK course_modules)
  title
  description
  mux_asset_id        -- ID do vídeo no Mux
  mux_playback_id     -- ID de reprodução do Mux
  duration_seconds
  position
  is_free_preview
  is_published
  created_at

-- Materiais Complementares
lesson_attachments
  id (uuidv7)
  lesson_id (FK lessons)
  title
  file_url
  file_type (pdf | doc | spreadsheet | link)
  file_size_bytes

-- Matrículas
enrollments
  id (uuidv7)
  user_id (FK users)
  course_id (FK courses)
  payment_id (FK payments)
  status (active | expired | refunded)
  expires_at (nullable — para lifetime access: null)
  enrolled_at
  completed_at

-- Progresso do Aluno
lesson_progress
  id (uuidv7)
  user_id (FK users)
  lesson_id (FK lessons)
  watched_seconds
  completed_at
  last_watched_at

-- Pagamentos
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

-- Cupons de Desconto
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

-- Certificados
certificates
  id (uuidv7)
  user_id (FK users)
  course_id (FK courses)
  enrollment_id (FK enrollments)
  certificate_url
  issued_at
```

---

## 3.4 Fluxos Principais

### Fluxo de Compra de Curso

```
1. Aluno acessa página de vendas do curso
2. Clica em "Comprar"
3. Frontend cria Stripe PaymentIntent via API
4. Aluno preenche dados de pagamento (Stripe Elements)
5. Stripe processa o pagamento
6. Webhook Stripe → API Backend
7. Backend valida webhook (assinatura HMAC)
8. Backend cria Enrollment no banco
9. Backend envia email de confirmação (Resend)
10. Aluno redirecionado para área de membros
```

### Fluxo de Upload de Vídeo (Criador)

```
1. Criador faz upload do vídeo via Admin
2. Frontend solicita URL de upload ao Backend
3. Backend cria Mux Asset e retorna upload URL
4. Frontend faz upload direto para Mux (TUS protocol)
5. Mux processa e transcodifica o vídeo
6. Webhook Mux → Backend (asset.ready)
7. Backend salva mux_asset_id e mux_playback_id na aula
8. Admin exibe preview do vídeo
```

### Fluxo de Reprodução de Vídeo (Aluno)

```
1. Aluno acessa aula
2. Backend verifica enrollment ativo
3. Backend gera Signed URL do Mux (expiração: 1h)
4. Frontend renderiza Mux Player com playback URL assinado
5. Vídeo inicia streaming via HLS
6. Frontend envia eventos de progresso ao Backend (debounce 30s)
7. Backend atualiza lesson_progress
```

---

## 3.5 Autenticação e Autorização

### Estratégia JWT

```
Access Token: 15 minutos (armazenado em memória)
Refresh Token: 30 dias (HTTP-only cookie)
```

**Fluxo:**

1. Login → API retorna access_token + seta refresh_token cookie
2. Request autenticado → Authorization: Bearer <access_token>
3. Token expirado → Frontend detecta 401, chama /auth/refresh
4. /auth/refresh → valida refresh_token cookie, retorna novo access_token
5. Logout → invalida refresh_token no Redis

### Roles e Permissões

| Role      | Permissões                                     |
| --------- | ---------------------------------------------- |
| `student` | Ver cursos comprados, marcar progresso         |
| `creator` | CRUD de cursos, upload de vídeo, ver analytics |
| `admin`   | Tudo (gerenciar criadores, planos, etc.)       |

### Proteção de Rotas (Next.js Middleware)

```typescript
// middleware.ts
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};

// Verifica JWT em todas as rotas protegidas
// Redireciona para /login se não autenticado
// Verifica role para rotas /admin
```

---

## 3.6 Segurança

| Ameaça              | Mitigação                                |
| ------------------- | ---------------------------------------- |
| SQL Injection       | Drizzle ORM (queries parametrizadas)     |
| XSS                 | Content Security Policy + sanitização    |
| CSRF                | Double submit cookie + SameSite          |
| Video Piracy        | Mux DRM + Signed URLs + expiração        |
| Brute Force         | Rate limiting (@fastify/rate-limit)      |
| Webhook Spoofing    | HMAC signature validation (Stripe + Mux) |
| Data Exposure       | Zod validation em todos os inputs        |
| Credential Exposure | Env vars + secrets management            |
| Unauthorized Access | JWT + Role-based middleware              |

---

## 3.7 Performance e Escalabilidade

### Frontend (Next.js)

- **ISR** para páginas de curso (revalidação a cada 60s)
- **Static Generation** para página de vendas (marketing)
- **Server Components** para área de membros (sem JS extra)
- **Streaming SSR** com `<Suspense>` para loading states
- **Otimização de imagens** via `next/image` (WebP automático)

### Backend (Fastify)

- **Connection Pool** do PostgreSQL via Drizzle
- **Redis Cache** para consultas frequentes (lista de cursos: TTL 5min)
- **Compressão** HTTP habilitada
- **Horizontal Scaling** via Railway replicas

### Vídeo (Mux)

- **CDN Global** da Mux com 100+ PoPs
- **Adaptive Bitrate** automático conforme velocidade do usuário
- **Cold Storage** para vídeos antigos não assistidos (60% de desconto)

### Estimativas de Capacidade (Fase 1)

| Métrica                  | Estimativa  |
| ------------------------ | ----------- |
| Alunos simultâneos       | 100–500     |
| Vídeos ativos            | 50–200      |
| Requisições/min (API)    | 1.000–5.000 |
| Tamanho médio de vídeo   | 500MB–2GB   |
| Bandwidth mensal (vídeo) | 500GB–5TB   |
