# 06 — Infraestrutura e Hospedagem

**Data:** 2026-04-24

---

## 6.1 Visão Geral de Hospedagem

A plataforma terá 3 componentes principais hospedados separadamente:

| Componente            | Tecnologia    | Plataforma Recomendada |
| --------------------- | ------------- | ---------------------- |
| Frontend (Next.js)    | Next.js 15    | Vercel                 |
| Backend API (Fastify) | Node.js       | Railway                |
| Banco de Dados        | PostgreSQL    | Neon                   |
| Cache                 | Redis         | Upstash                |
| Storage de Arquivos   | S3-compatible | Cloudflare R2          |
| Video                 | Streaming     | Mux / Bunny            |

---

## 6.2 Frontend — Vercel

**Por que Vercel para Next.js?**

Vercel é a empresa criadora do Next.js. A integração é inigualável:

- PPR (Partial Prerendering) funciona melhor na edge da Vercel
- CDN global com 100+ PoPs
- Deploy automático com cada push no git
- Preview environments por PR
- Analytics integrado
- Imagens otimizadas no edge

### Planos Vercel

| Plano      | Preço       | Uso recomendado                            |
| ---------- | ----------- | ------------------------------------------ |
| Hobby      | Grátis      | Desenvolvimento apenas (não para produção) |
| **Pro**    | **$20/mês** | **Produção — Phase 1 e 2**                 |
| Enterprise | Custom      | Phase 3+ (múltiplos clientes)              |

**Plano Pro inclui:**

- $20 de crédito de uso mensal incluído
- Builds sem fila (mais rápido)
- Cold start prevention
- 100GB de bandwidth incluído
- Analytics avançado

**Custos adicionais estimados:**

- Edge Requests: $0 (1M incluídos)
- Bandwidth extra: raro na fase 1
- **Total estimado: ~$20–40/mês**

---

## 6.3 Backend — Railway

**Por que Railway?**

Railway é a alternativa moderna ao Heroku, com precificação por uso real (não por box size):

### Planos Railway

| Plano      | Custo                               | Uso recomendado              |
| ---------- | ----------------------------------- | ---------------------------- |
| Hobby      | $5/mês (inclui $5 de crédito)       | Desenvolvimento              |
| **Pro**    | **$20/mês** (inclui $20 de crédito) | **Produção**                 |
| Enterprise | Custom                              | Múltiplos clientes em escala |

**Pro inclui:**

- 1TB de RAM máximo por serviço
- 42 replicas
- Scaling automático horizontal
- 30 dias de log retention
- Múltiplas regiões globais
- Custom domains ilimitados

**Estimativa de uso na Fase 1:**

- API Fastify: ~0.5 vCPU + 256MB RAM = ~$5/mês de uso
- Com $20 de crédito incluído: **efetivamente $0 além dos $20/mês do plano**

**Fórmula de custo Railway:**

- Memory: $0.00000386/GB/sec
- CPU: $0.00000772/vCPU/sec
- Egress: $0.05/GB

**Exemplo para API com 512MB RAM, 0.5 vCPU rodando 24/7:**

- Memory: 0.5GB × 2.592.000 sec × $0.00000386 = **$5/mês**
- CPU: 0.5 × 2.592.000 × $0.00000772 = **$10/mês**
- **Total API: ~$15/mês** (coberto pelo crédito do Pro)

---

## 6.4 Banco de Dados — Neon (Serverless PostgreSQL)

**Por que Neon?**

| Feature                    | Benefício                                    |
| -------------------------- | -------------------------------------------- |
| Serverless PostgreSQL      | Escala a zero quando inativo (sem cobranças) |
| Branching                  | Ambientes de dev/staging com branches do DB  |
| Read replicas              | Performance de leitura escalável             |
| Compatível com Drizzle ORM | Zero config                                  |
| Free tier generoso         | Para desenvolvimento                         |

### Planos Neon

| Plano      | Preço       | Compute            | Storage  |
| ---------- | ----------- | ------------------ | -------- |
| Free       | $0          | 0.25 CU, 512MB RAM | 512MB    |
| **Launch** | **$19/mês** | **2 CU ativas**    | **10GB** |
| Scale      | $69/mês     | 4 CU ativas        | 50GB     |

**Para Fase 1:** Plano Launch ($19/mês) é suficiente para centenas de alunos.

---

## 6.5 Cache — Upstash (Serverless Redis)

**Por que Upstash?**

- Serverless Redis (paga por request)
- Integração fácil com Railway/Vercel
- Dashboard simples
- TTL configurável

### Preço Upstash

| Feature       | Valor                   |
| ------------- | ----------------------- |
| Free tier     | 10K commands/dia, 256MB |
| Pay-as-you-go | $0.2 por 100K commands  |
| Pro ($10/mês) | 1M commands/dia         |

**Estimativa Fase 1:** Free tier ou $5–10/mês

---

## 6.6 Storage — Cloudflare R2

**Por que R2 vs AWS S3?**

| Feature                 | Cloudflare R2 | AWS S3             |
| ----------------------- | ------------- | ------------------ |
| Egress (saída de dados) | **GRÁTIS**    | $0.09/GB           |
| Storage                 | $0.015/GB/mês | $0.023/GB/mês      |
| Operações (A)           | $4.50/1M      | $5.50/1M           |
| CDN integrado           | Sim (grátis)  | Extra (CloudFront) |

**R2 é 30–60% mais barato que S3 para workloads com muito download (PDFs de cursos, materiais).**

**Estimativa para 50GB de materiais:**

- Storage: 50GB × $0.015 = **$0.75/mês**
- Download: 1.000 acessos × 10MB médio = 10GB = **GRÁTIS** (egress)
- **Total: ~$1/mês**

---

## 6.7 Três Cenários de Custo de Infraestrutura

### Cenário 1 — Fase Bootstrap (0–100 alunos)

_Objetivo: Mínimo custo, máxima velocidade de lançamento_

| Serviço                 | Plano            | Custo/mês       |
| ----------------------- | ---------------- | --------------- |
| Vercel (Frontend)       | Pro              | $20             |
| Railway (API)           | Pro              | $20             |
| Neon (DB)               | Launch           | $19             |
| Upstash (Redis)         | Free / Pay-as-go | $0–5            |
| Cloudflare R2 (Storage) | Pay-as-go        | $1–3            |
| Bunny Stream (Video)    | Pay-as-go        | $3–10           |
| Resend (Email)          | Free (3K emails) | $0              |
| Cloudflare (DNS/CDN)    | Free             | $0              |
| **TOTAL**               |                  | **~$63–77/mês** |

---

### Cenário 2 — Fase Crescimento (100–1.000 alunos)

_Objetivo: Performance e features completas_

| Serviço                 | Plano               | Custo/mês         |
| ----------------------- | ------------------- | ----------------- |
| Vercel (Frontend)       | Pro (com uso extra) | $30–50            |
| Railway (API)           | Pro (uso moderado)  | $30–50            |
| Neon (DB)               | Scale               | $69               |
| Upstash (Redis)         | Pro                 | $10               |
| Cloudflare R2 (Storage) | Pay-as-go           | $5–15             |
| Mux Video (Streaming)   | Pay-as-go           | $50–150           |
| Resend (Email)          | Pro ($20/mês)       | $20               |
| Domínio + SSL           | Cloudflare          | $10–15/ano        |
| Sentry (Error tracking) | Team                | $26               |
| **TOTAL**               |                     | **~$240–385/mês** |

---

### Cenário 3 — Fase Escala (1.000–10.000 alunos)

_Objetivo: Alta disponibilidade, múltiplos criadores_

| Serviço                 | Plano                      | Custo/mês             |
| ----------------------- | -------------------------- | --------------------- |
| Vercel (Frontend)       | Pro (volume)               | $100–200              |
| Railway (API)           | Pro (múltiplas instâncias) | $100–200              |
| Neon (DB)               | Scale + Read Replicas      | $200–400              |
| Upstash (Redis)         | Enterprise                 | $50–100               |
| Cloudflare R2 (Storage) | Volume                     | $20–50                |
| Mux Video               | Volume                     | $300–1.000            |
| Resend (Email)          | Business                   | $89                   |
| Sentry                  | Business                   | $89                   |
| Algolia (Search)        | Grow                       | $50                   |
| **TOTAL**               |                            | **~$1.000–2.200/mês** |

---

## 6.8 Estimativa de ROI por Cenário

| Cenário                    | Custo Infra | Receita SaaS (clientes) | Lucro Operacional      |
| -------------------------- | ----------- | ----------------------- | ---------------------- |
| Bootstrap (1 cliente)      | ~$70/mês    | $49–99/mês              | -$21 (investimento)    |
| Crescimento (3–5 clientes) | ~$300/mês   | $300–500/mês            | $0–200/mês             |
| Escala (10–20 clientes)    | ~$1.200/mês | $1.000–3.000/mês        | -$200 a +$1.800        |
| Consolidado (30+ clientes) | ~$2.000/mês | $4.500–15.000/mês       | **+$2.500–13.000/mês** |

---

## 6.9 Estratégia de Deploy e CI/CD

### Pipeline de Deploy

```
Developer → Push para GitHub
    ↓
GitHub Actions:
  1. Run Biome lint
  2. Run Vitest tests
  3. Build check
    ↓
PR → Preview Deploy automático (Vercel + Railway)
    ↓
Merge para main → Deploy automático para produção
    ↓
Slack notification com status
```

### Ambientes

| Ambiente    | Branch       | URL                            |
| ----------- | ------------ | ------------------------------ |
| Development | feature/\*   | localhost                      |
| Preview     | pull request | pr-123.ybr-platform.vercel.app |
| Staging     | staging      | staging.ybr-platform.com       |
| Production  | main         | app.ybr-platform.com           |

---

## 6.10 Disaster Recovery e Backup

| Dado               | Frequência de Backup    | Retenção                         |
| ------------------ | ----------------------- | -------------------------------- |
| PostgreSQL (Neon)  | Automático contínuo     | 7 dias (Launch), 30 dias (Scale) |
| R2 (Arquivos)      | Versioning habilitado   | Indefinido                       |
| Vídeos (Mux/Bunny) | Replicação automática   | Enquanto ativo                   |
| Redis (Upstash)    | Persistência habilitada | Diário                           |

**RTO (Recovery Time Objective):** < 2 horas  
**RPO (Recovery Point Objective):** < 1 hora (com Neon WAL)
