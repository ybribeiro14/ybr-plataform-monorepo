# 04 — Project Scope — Phases and Deliverables

**Date:** 2026-04-24 | **Updated:** 2026-04-29

> 🔄 **Realignment (2026-04-29):** Scope revised after product strategy session. See `docs/research/05-business-model-analysis.md` for full business model analysis.

---

## Scope Principles

1. **Ship fast, iterate** — Launch MVP in 6–8 weeks, not 6 months
2. **Revenue first** — Every feature must have direct impact on sales or retention
3. **Client as co-designer** — Validate every screen with the pastry chef before building
4. **Don't reinvent the wheel** — Use Stripe, Bunny/Mux, Resend — don't build from scratch

---

## Phase 0 — Preparation (Weeks 1–2)

**Goal:** Environment setup, domain, service accounts, design system

**Status: ✅ Complete**

### Deliverables

- [x] GitHub repository configured (Turborepo monorepo)
- [x] Environments configured: dev, staging, production
- [x] Docker Compose for local development
- [x] CI/CD configured (GitHub Actions + Vercel + Railway)
- [x] Design system base (colors, typography, Shadcn components)
- [x] Drizzle schema defined
- [x] i18n configured (next-intl: en, pt-BR, es)
- [x] Automated tests infrastructure (63 tests, >95% coverage)
- [x] All agents updated with language and test standards
- [ ] Service accounts created: Stripe, Bunny, Neon, Railway, Vercel, Resend _(pending)_
- [ ] Domain defined and configured (DNS via Cloudflare) _(pending)_
- [ ] Initial migrations run on Neon _(pending — awaiting Neon account)_

---

## Phase 1 — MVP (Weeks 3–8)

**Goal:** Launch functional platform for the first client to migrate her courses from Hotmart.

### Authentication (Week 3)

- [ ] User registration (email + password)
- [ ] Google Social Login (students only)
- [ ] Login with JWT
- [ ] Password recovery via email (Resend)
- [ ] User profile
- [ ] Route protection (Next.js middleware)

### Course Management — Creator Workstation (Weeks 3–4)

- [ ] Course CRUD (title, description, thumbnail)
- [ ] Module and lesson CRUD
- [ ] Video upload via Bunny Stream API
- [ ] Video preview player
- [ ] Course publish/unpublish
- [ ] Drag-and-drop module reordering (Phase 2 — ↑↓ buttons for MVP)

### Enrollment System (Week 5)

Two flows must coexist:

**Flow A — External payment webhook:**

- [ ] `POST /api/enrollment` endpoint with shared secret header validation
- [ ] Creates active enrollment immediately
- [ ] Triggers welcome email

**Flow B — Creator invite link:**

- [ ] Creator generates invite link per course
- [ ] Student registers via link → pending enrollment created
- [ ] Creator activates enrollment manually in workstation
- [ ] Student receives welcome email upon activation

### Student Area (Weeks 5–6)

- [ ] Purchased/enrolled courses catalog
- [ ] Video player with progress tracking
- [ ] Lesson completion marking
- [ ] Progress bar per module
- [ ] Downloadable lesson materials

### Transactional Emails (Week 5–6)

- [ ] Welcome on account creation
- [ ] Course access granted (triggered by enrollment activation)
- [ ] Incomplete lesson reminder (7 days without login)

### Certificate (Week 6)

- [ ] Certificate generation at 100% course completion
- [ ] Public certificate verification page
- [ ] PDF download + LinkedIn share

### YBR Admin Panel — Minimal (Week 6)

- [ ] Creators list with status (active/suspended), courses count, students count
- [ ] Create new creator account (manual onboarding)
- [ ] Activate/suspend creator

### MVP Acceptance Criteria

- [ ] At least 1 published and accessible course
- [ ] Student can enroll via invite link or external webhook
- [ ] Video loading in less than 3 seconds
- [ ] Mobile responsive (75%+ of access will be mobile)
- [ ] Welcome email arriving in less than 2 minutes after enrollment activation
- [ ] Certificate downloadable after 100% course completion

---

## Phase 2 — Complete Experience (Weeks 9–16)

**Goal:** Elevate experience quality and prepare for multiple creators.

### Community (Weeks 9–10)

- [ ] Discussion forum per module
- [ ] Questions and answers system
- [ ] Reply notifications
- [ ] Creator moderation

### Advanced Analytics (Weeks 10–11)

- [ ] Creator dashboard (sales, revenue, students)
- [ ] Completion rate per module
- [ ] At-risk student alerts
- [ ] Monthly income report

### Mux Video Migration (Weeks 11–12)

- [ ] Upload via Mux API
- [ ] Mux Player replacing previous player (URL swap only — no UI changes)
- [ ] Automatic PT-BR captions (Mux Robots)
- [ ] Per-video engagement analytics

### Coupons & Promotions (Week 12)

- [ ] Discount coupon creation
- [ ] Percentage and fixed value coupons
- [ ] Expiry date and usage limits
- [ ] Affiliate coupon with tracking

### Basic Multi-tenancy (Weeks 13–15)

- [ ] New creator registration
- [ ] Subscription plans (Stripe Billing)
- [ ] Guided onboarding
- [ ] Custom subdomain (`creatornname.ybr-platform.com`)

### PWA (Weeks 15–16)

- [ ] Service Worker for offline caching
- [ ] Manifest for app installation
- [ ] Push notifications (new lesson published)

---

## Phase 3 — Scale (Month 5+)

**Goal:** Platform as a SaaS product for dozens of creators.

### Features

- [ ] Native mobile app (React Native/Expo)
- [ ] Integrated live streaming
- [ ] Full affiliate system
- [ ] Automatic upsell/cross-sell between courses
- [ ] Creator's own custom domain (CNAME setup)
- [ ] Public API for integrations
- [ ] Email marketing integration (ActiveCampaign, Mailchimp)
- [ ] Advanced financial reports (accounting export)
- [ ] Multi-currency support (BRL + USD)
- [ ] Public course marketplace (opt-in by creator)
- [ ] Certification and badge program

---

## Out of MVP Scope

These features are explicitly **out of MVP** scope to maintain focus:

- ❌ Native mobile app
- ❌ Live streaming
- ❌ Affiliate system
- ❌ Public marketplace
- ❌ Multiple currencies
- ❌ Video DRM (added in Phase 2 if needed)
- ❌ Drag-and-drop landing page editor
- ❌ External email marketing tool integration

---

## Definition of Done (DoD)

A feature is "done" when:

1. ✅ Functionality implemented per specification
2. ✅ Unit tests written (where applicable)
3. ✅ Code passes Biome (lint + format)
4. ✅ Reviewed in PR before merge
5. ✅ Tested on mobile (Chrome DevTools + Safari iOS)
6. ✅ No errors in Sentry after staging deploy

---

## Glossary

| Term           | Definition                                                          |
| -------------- | ------------------------------------------------------------------- |
| **Creator**    | User with `creator` role — can create and sell courses              |
| **Student**    | User with `student` role — can purchase and watch courses           |
| **Enrollment** | A student's access to a specific course after payment               |
| **Module**     | Grouping of lessons within a course (e.g., "Week 1 — Fundamentals") |
| **Lesson**     | Individual video within a module                                    |
| **MRR**        | Monthly Recurring Revenue — platform's recurring monthly revenue    |
| **LTV**        | Lifetime Value — total value a student generates for the creator    |
| **CAC**        | Customer Acquisition Cost — cost to acquire 1 new student           |
| **Churn**      | Cancellation/refund rate                                            |
| **BNPL**       | Buy Now Pay Later — installments (Klarna, Afterpay)                 |

---

## Service Stack by App

| Service         | Repository          | Deploy     |
| --------------- | ------------------- | ---------- |
| Web (Student)   | `apps/web`          | Vercel     |
| Admin (Creator) | `apps/admin`        | Vercel     |
| API             | `apps/api`          | Railway    |
| DB Migrations   | `packages/database` | Local / CI |
