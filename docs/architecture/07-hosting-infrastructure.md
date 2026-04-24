# 07 — Hosting Infrastructure

**Date:** 2026-04-24

---

## Overview

The platform has 3 main components hosted separately:

| Component             | Technology    | Recommended Platform |
| --------------------- | ------------- | -------------------- |
| Frontend (Next.js)    | Next.js 15    | Vercel               |
| Backend API (Fastify) | Node.js       | Railway              |
| Database              | PostgreSQL    | Neon                 |
| Cache                 | Redis         | Upstash              |
| File Storage          | S3-compatible | Cloudflare R2        |
| Video                 | Streaming     | Bunny Stream / Mux   |

---

## Frontend — Vercel

Vercel is the company behind Next.js. The integration is unmatched:

- PPR (Partial Prerendering) works best on Vercel's edge
- Global CDN with 100+ PoPs
- Automatic deploy on every git push
- Preview environments per PR
- Built-in analytics
- Edge image optimization

### Vercel Plans

| Plan       | Price      | Recommended Use                       |
| ---------- | ---------- | ------------------------------------- |
| Hobby      | Free       | Development only (not for production) |
| **Pro**    | **$20/mo** | **Production — Phase 1 and 2**        |
| Enterprise | Custom     | Phase 3+ (multiple clients)           |

**Pro plan includes:**

- $20 monthly usage credit
- No-queue builds (faster)
- Cold start prevention
- 100GB bandwidth included
- Advanced analytics

**Estimated total: ~$20–40/month**

---

## Backend — Railway

Railway is the modern alternative to Heroku, with pricing based on actual usage:

### Railway Plans

| Plan       | Cost                             | Recommended Use           |
| ---------- | -------------------------------- | ------------------------- |
| Hobby      | $5/mo (includes $5 credit)       | Development               |
| **Pro**    | **$20/mo** (includes $20 credit) | **Production**            |
| Enterprise | Custom                           | Multiple clients at scale |

**Pro includes:**

- Up to 1TB RAM per service
- 42 replicas
- Automatic horizontal scaling
- 30-day log retention
- Multiple global regions
- Unlimited custom domains

**Phase 1 estimate:**

- Fastify API: ~0.5 vCPU + 256MB RAM = ~$5/month usage
- With $20 credit included: **effectively $0 beyond the $20/month plan fee**

**Usage formula:**

- Memory: $0.00000386/GB/sec
- CPU: $0.00000772/vCPU/sec
- Egress: $0.05/GB

---

## Database — Neon (Serverless PostgreSQL)

### Why Neon?

| Feature                | Benefit                                   |
| ---------------------- | ----------------------------------------- |
| Serverless PostgreSQL  | Scales to zero when idle (no charges)     |
| Branching              | Dev/staging environments with DB branches |
| Read replicas          | Scalable read performance                 |
| Drizzle ORM compatible | Zero additional configuration             |
| Generous free tier     | For local development                     |

### Neon Plans

| Plan       | Price      | Compute            | Storage  |
| ---------- | ---------- | ------------------ | -------- |
| Free       | $0         | 0.25 CU, 512MB RAM | 512MB    |
| **Launch** | **$19/mo** | **2 active CUs**   | **10GB** |
| Scale      | $69/mo     | 4 active CUs       | 50GB     |

**Phase 1:** Launch plan ($19/month) is sufficient for hundreds of students.

---

## Cache — Upstash (Serverless Redis)

### Why Upstash?

- Serverless Redis (pay per request)
- Easy integration with Railway/Vercel
- Simple dashboard
- Configurable TTL

**Important:** Upstash uses `url` + `token` auth, NOT a standard `redis://` URL string. Use `@upstash/redis` client:

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});
```

### Upstash Pricing

| Tier            | Value                   |
| --------------- | ----------------------- |
| Free tier       | 10K commands/day, 256MB |
| Pay-as-you-go   | $0.2 per 100K commands  |
| Pro ($10/month) | 1M commands/day         |

**Phase 1 estimate:** Free tier or $5–10/month

---

## File Storage — Cloudflare R2

### Why R2 vs AWS S3?

| Feature                    | Cloudflare R2   | AWS S3             |
| -------------------------- | --------------- | ------------------ |
| Egress (data transfer out) | **FREE**        | $0.09/GB           |
| Storage                    | $0.015/GB/month | $0.023/GB/month    |
| Class A operations         | $4.50/1M        | $5.50/1M           |
| Integrated CDN             | Yes (free)      | Extra (CloudFront) |

**R2 is 30–60% cheaper than S3** for workloads with heavy downloads (course PDFs, materials).

**Phase 1 estimate for 50GB materials:**

- Storage: 50GB × $0.015 = **$0.75/month**
- Downloads: 1,000 accesses × 10MB avg = 10GB egress = **FREE**
- **Total: ~$1/month**

---

## Three Infrastructure Cost Scenarios

### Scenario 1 — Bootstrap Phase (0–100 students)

_Goal: Minimum cost, maximum launch speed_

| Service                 | Plan             | Monthly Cost   |
| ----------------------- | ---------------- | -------------- |
| Vercel (Frontend)       | Pro              | $20            |
| Railway (API)           | Pro              | $20            |
| Neon (DB)               | Launch           | $19            |
| Upstash (Redis)         | Free / Pay-as-go | $0–5           |
| Cloudflare R2 (Storage) | Pay-as-go        | $1–3           |
| Bunny Stream (Video)    | Pay-as-go        | $3–10          |
| Resend (Email)          | Free (3K emails) | $0             |
| Cloudflare (DNS/CDN)    | Free             | $0             |
| **TOTAL**               |                  | **~$63–77/mo** |

---

### Scenario 2 — Growth Phase (100–1,000 students)

_Goal: Full performance and features_

| Service                 | Plan                 | Monthly Cost     |
| ----------------------- | -------------------- | ---------------- |
| Vercel (Frontend)       | Pro (with extra use) | $30–50           |
| Railway (API)           | Pro (moderate use)   | $30–50           |
| Neon (DB)               | Scale                | $69              |
| Upstash (Redis)         | Pro                  | $10              |
| Cloudflare R2 (Storage) | Pay-as-go            | $5–15            |
| Mux Video (Streaming)   | Pay-as-go            | $50–150          |
| Resend (Email)          | Pro ($20/month)      | $20              |
| Sentry (Error tracking) | Team                 | $26              |
| **TOTAL**               |                      | **~$240–390/mo** |

---

### Scenario 3 — Scale Phase (1,000–10,000 students)

_Goal: High availability, multiple creators_

| Service                 | Plan                  | Monthly Cost         |
| ----------------------- | --------------------- | -------------------- |
| Vercel (Frontend)       | Pro (volume)          | $100–200             |
| Railway (API)           | Pro (multi-instance)  | $100–200             |
| Neon (DB)               | Scale + Read Replicas | $200–400             |
| Upstash (Redis)         | Enterprise            | $50–100              |
| Cloudflare R2 (Storage) | Volume                | $20–50               |
| Mux Video               | Volume                | $300–1,000           |
| Resend (Email)          | Business              | $89                  |
| Sentry                  | Business              | $89                  |
| Algolia (Search)        | Grow                  | $50                  |
| **TOTAL**               |                       | **~$1,000–2,200/mo** |

---

## Deployment Pipeline & CI/CD

### Deploy Flow

```
Developer → Push to GitHub
    ↓
GitHub Actions:
  1. Run Biome lint
  2. Run Vitest tests (63 tests, >95% coverage)
  3. Build check
    ↓
PR → Automatic preview deploy (Vercel + Railway)
    ↓
Merge to main → Automatic production deploy
    ↓
Status notification
```

### Environments

| Environment | Branch       | URL                            |
| ----------- | ------------ | ------------------------------ |
| Development | feature/\*   | localhost                      |
| Preview     | pull request | pr-123.ybr-platform.vercel.app |
| Staging     | staging      | staging.ybr-platform.com       |
| Production  | main         | app.ybr-platform.com           |

---

## Disaster Recovery & Backup

| Data               | Backup Frequency         | Retention                        |
| ------------------ | ------------------------ | -------------------------------- |
| PostgreSQL (Neon)  | Continuous automatic WAL | 7 days (Launch), 30 days (Scale) |
| R2 (Files)         | Versioning enabled       | Indefinite                       |
| Videos (Mux/Bunny) | Automatic replication    | While active                     |
| Redis (Upstash)    | Persistence enabled      | Daily                            |

**RTO (Recovery Time Objective):** < 2 hours  
**RPO (Recovery Point Objective):** < 1 hour (with Neon WAL streaming)
