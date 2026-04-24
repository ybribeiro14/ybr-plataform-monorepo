# YBR Platform — Project Overview

**Project:** Proprietary Online Course Platform  
**Created:** 2026-04-24 | **Updated:** 2026-07-07  
**Status:** Phase 0 Complete — Phase 1 (MVP) in planning  
**Version:** 1.1

---

## What is YBR Platform?

**YBR Platform** is a white-label, proprietary online course hosting and sales platform developed by DIV Brands. The initial focus is on serving the first client: a Brazilian pastry chef based in the United States.

The long-term strategic goal is to **replace Hotmart** as the course hosting and sales infrastructure for the agency's clients, delivering:

1. **Lower cost for creators** — Hotmart charges 9.9% per sale; our platform has a fixed monthly cost.
2. **Recurring revenue for DIV Brands** — MRR (Monthly Recurring Revenue) via a SaaS model.
3. **Competitive differentiation** — Personalized, branded experience with no competitor products in the checkout flow.

---

## Current Project State

| Phase   | Status         | Notes                                           |
| ------- | -------------- | ----------------------------------------------- |
| Phase 0 | ✅ Complete    | Monorepo, CI/CD, design system, i18n, tests     |
| Phase 1 | 🔲 In planning | MVP — auth, courses, player, checkout, students |
| Phase 2 | 🔲 Planned     | Community, analytics, Mux migration, PWA        |
| Phase 3 | 🔲 Planned     | Native app, marketplace, scale                  |

**Phase 0 highlights:**

- Turborepo monorepo scaffolded with `apps/web`, `apps/admin`, `apps/api`
- Docker Compose for local development
- GitHub Actions CI/CD pipeline
- Design system ("Artisanal Sophistication") configured
- i18n set up via next-intl (English default, Portuguese pt-BR, Spanish)
- 63 automated tests passing with >95% coverage

---

## Documentation Index

| File                                                                                    | Description                                     |
| --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [architecture/01-overview.md](./01-overview.md)                                         | This document — project overview                |
| [architecture/02-tech-stack.md](./02-tech-stack.md)                                     | Technology stack and justification              |
| [architecture/03-system-architecture.md](./03-system-architecture.md)                   | Complete system architecture                    |
| [architecture/04-video-player-strategy.md](./04-video-player-strategy.md)               | Custom HLS player decision                      |
| [architecture/05-video-hosting.md](./05-video-hosting.md)                               | Video hosting provider comparison               |
| [architecture/06-payment-processing.md](./06-payment-processing.md)                     | Stripe integration and payment strategy         |
| [architecture/07-hosting-infrastructure.md](./07-hosting-infrastructure.md)             | Cloud infrastructure decisions                  |
| [architecture/08-docker-devops.md](./08-docker-devops.md)                               | Docker setup and CI/CD                          |
| [architecture/09-design-system.md](./09-design-system.md)                               | Artisanal Sophistication design system          |
| [research/01-market-analysis.md](../research/01-market-analysis.md)                     | Market research and Hotmart comparison          |
| [research/02-cost-analysis.md](../research/02-cost-analysis.md)                         | Full infrastructure cost analysis               |
| [research/03-competitive-differentials.md](../research/03-competitive-differentials.md) | Differentials vs Hotmart and competitors        |
| [research/04-project-scope.md](../research/04-project-scope.md)                         | Project scope — phases and deliverables         |
| [../14-implementation-plan.md](../14-implementation-plan.md)                            | Master implementation plan and progress tracker |

---

## First Client Context

**Target audience identified:** Brazilian women in the US (1.775M Brazilians, ~55% female)  
**Niche:** Brazilian pastry adapted to US ingredients and food laws  
**Primary market:** Massachusetts (Framingham, Somerville, Everett)  
**Course price range:** $97–$397 (hero: $197 / 6× $37)  
**Current platform:** Hotmart — 9.9% commission per sale

→ Full context in [research/brazilians-us-baking-course/](../../research/brazilians-us-baking-course/)

---

## Core Value Proposition

> **For the client:** Save the 9.9% Hotmart fee. On $10,000/month in sales, that's $990/month back in the creator's pocket — ~$11,880/year.

> **For DIV Brands:** Recurring SaaS revenue, platform ownership, scalability to multiple creators.

---

## Monorepo Location

The full platform code is at: `ybr-plataform/platform/`

```
ybr-plataform/platform/
├── apps/
│   ├── web/      # Next.js 15 — Student portal + Checkout + Landing pages
│   ├── admin/    # Next.js 15 — Creator dashboard
│   └── api/      # Fastify 5 — REST API backend
├── packages/
│   ├── ui/       # Shared Shadcn components
│   ├── schemas/  # Shared Zod schemas (frontend + backend)
│   ├── database/ # Drizzle schema + migrations
│   └── types/    # Shared TypeScript types
```

→ Full setup guide in [platform/README.md](../../README.md)
