# 02 — Cost Analysis

**Date:** 2026-04-24

---

## Development Costs (One-Time)

### Estimated Hours by Module

| Module               | Description                                 | Estimated Hours   |
| -------------------- | ------------------------------------------- | ----------------- |
| Authentication       | Login, registration, password recovery, JWT | 20–30h            |
| Course management    | Course/module/lesson CRUD                   | 40–60h            |
| Video upload         | Bunny/Mux integration, upload progress      | 20–30h            |
| Video player         | HLS player, progress, captions              | 15–20h            |
| Checkout             | Stripe, installments, webhooks              | 30–40h            |
| Student area         | Catalog, progress, certificates             | 30–40h            |
| Creator admin        | Dashboard, analytics, settings              | 40–50h            |
| Transactional emails | Confirmations, welcome, recovery            | 10–15h            |
| Certificates         | PDF certificate generation                  | 10–15h            |
| Infrastructure       | Initial setup, CI/CD, environments          | 20–25h            |
| Tests                | Unit + integration                          | 20–30h            |
| **TOTAL**            |                                             | **255–355 hours** |

### Phase 1 (MVP — First Client Launch)

**Reduced scope for MVP:**

- Basic authentication
- Video upload + player
- Stripe checkout
- Student area (lesson list + player + progress)
- Basic emails (purchase confirmation, access)

**MVP estimate:** ~120–160 hours

---

## Recurring Infrastructure Costs by Phase

### Phase 1: Bootstrap / MVP

**Period:** Months 1–3  
**Scenario:** 1 client, 0–100 active students

| Category           | Service              | Monthly Cost  |
| ------------------ | -------------------- | ------------- |
| **Hosting**        |                      |               |
| Frontend           | Vercel Pro           | $20           |
| Backend API        | Railway Pro          | $20           |
| **Database**       |                      |               |
| PostgreSQL         | Neon Launch          | $19           |
| Cache              | Upstash Free         | $0            |
| **Storage**        |                      |               |
| Files (PDFs, etc.) | Cloudflare R2        | $1–3          |
| **Video**          |                      |               |
| Streaming          | Bunny Stream         | $3–10         |
| **Communications** |                      |               |
| Email              | Resend Free          | $0            |
| DNS / CDN          | Cloudflare Free      | $0            |
| **Dev Tools**      |                      |               |
| Sentry             | Developer Free       | $0            |
| Domain (.com)      | Namecheap/Cloudflare | ~$1           |
| **TOTAL**          |                      | **$64–73/mo** |

---

### Phase 2: Growth

**Period:** Months 4–12  
**Scenario:** 1–3 clients, 100–500 active students

| Category          | Service              | Monthly Cost    |
| ----------------- | -------------------- | --------------- |
| Frontend          | Vercel Pro + usage   | $30–60          |
| Backend API       | Railway Pro + usage  | $30–60          |
| PostgreSQL        | Neon Scale           | $69             |
| Cache             | Upstash Pro          | $10             |
| Storage R2        | Cloudflare Pay-as-go | $5–15           |
| Video             | Mux (upgrade)        | $50–150         |
| Email             | Resend Pro           | $20             |
| Sentry            | Team                 | $26             |
| PostHog Analytics | Free (1M events)     | $0              |
| **TOTAL**         |                      | **$240–410/mo** |

**Expected revenue:** $200–600/month (2–6 clients × $99/month)  
**Margin:** Negative to neutral — growth phase investment

---

### Phase 3: Scale

**Period:** Year 2+  
**Scenario:** 10–30 clients, 500–5,000 active students

| Category       | Service                      | Monthly Cost        |
| -------------- | ---------------------------- | ------------------- |
| Frontend       | Vercel Pro (volume)          | $100–200            |
| Backend API    | Railway Pro (multi-instance) | $100–200            |
| PostgreSQL     | Neon Scale + HA              | $200–400            |
| Cache          | Upstash Business             | $50–100             |
| Storage        | Cloudflare R2 (volume)       | $20–50              |
| Video          | Mux (volume)                 | $300–1,000          |
| Email          | Resend Business              | $89                 |
| Sentry         | Business                     | $89                 |
| PostHog        | Scale                        | $0–500              |
| Algolia Search | Grow                         | $50                 |
| **TOTAL**      |                              | **$1,000–2,600/mo** |

**Expected revenue:** $3,000–15,000/month  
**Margin:** 60–80%+ at volume

---

## Cost Per Active Student

| Phase     | Students | Infra Cost   | Cost Per Student |
| --------- | -------- | ------------ | ---------------- |
| Bootstrap | 50       | $70/month    | $1.40/student    |
| Growth    | 300      | $300/month   | $1.00/student    |
| Scale     | 2,000    | $1,500/month | $0.75/student    |

**Hotmart benchmark:** Hotmart's cost per $197 sale is $19.50 (9.9%).  
Our platform: ~$1/student infra cost + $0 commission = **95% savings on fees**.

---

## Break-Even Analysis for the Client

**Assumption:** Client with $10,000/month gross revenue

| Situation     | Platform Cost | Hotmart Cost       | Monthly Difference |
| ------------- | ------------- | ------------------ | ------------------ |
| Hotmart (now) | $0            | $990 (9.9%)        | —                  |
| YBR Starter   | $49/month     | $290 (2.9% Stripe) | **+$651/month**    |
| YBR Growth    | $99/month     | $290 (2.9% Stripe) | **+$601/month**    |

**Break-even:** The client saves money starting from the first sale of $500+ per month.  
**Annual savings (YBR Growth vs Hotmart):** ~$7,200/year for $10K/month in sales.

---

## Video Scaling Costs

**Practical scenario: 1 course with 20 lessons of 15 min each**

| Videos             | Total Minutes | 100 students/month   | Bunny Cost | Mux Cost   |
| ------------------ | ------------- | -------------------- | ---------- | ---------- |
| 20 lessons × 15min | 300 min       | 30,000 min delivery  | $3/month   | $24/month  |
| 40 lessons × 15min | 600 min       | 60,000 min delivery  | $6/month   | $48/month  |
| 80 lessons × 20min | 1,600 min     | 160,000 min delivery | $16/month  | $128/month |

_Calculations: Bunny $0.005/GB × ~200MB/h = ~$0.0002/min; Mux $0.0008/min_

---

## Total Initial Investment

### Minimum Viable to Launch

| Item                                  | Cost               |
| ------------------------------------- | ------------------ |
| MVP development (~150h × hourly rate) | Internal (no cost) |
| Phase 1 infrastructure (3 months)     | $200–220           |
| Domain (1 year)                       | $12–15             |
| Dev tools (Figma, etc.)               | $0–50              |
| **TOTAL**                             | **$212–285**       |

### Recommended for Professional Launch

| Item                                    | Cost            |
| --------------------------------------- | --------------- |
| MVP + UI development (100–150h)         | Internal        |
| UI/UX design (if contracted externally) | $500–2,000      |
| Phase 1 infrastructure (3 months)       | $200            |
| Real user testing                       | $0 (beta users) |
| Launch marketing                        | $200–500        |
| **TOTAL**                               | **$900–2,700**  |

---

## SaaS Revenue Projection (DIV Brands)

**Model:** Monthly subscription per creator

| Month | Clients | MRR    | Infra Cost | Gross Margin |
| ----- | ------- | ------ | ---------- | ------------ |
| 1     | 1       | $49    | $70        | -$21         |
| 3     | 1       | $49    | $70        | -$21         |
| 6     | 3       | $297   | $200       | $97          |
| 9     | 6       | $594   | $280       | $314         |
| 12    | 10      | $990   | $380       | $610         |
| 18    | 20      | $1,980 | $800       | $1,180       |
| 24    | 35      | $3,465 | $1,500     | $1,965       |

---

## Financial Risks

| Risk                  | Probability | Impact | Mitigation                                  |
| --------------------- | ----------- | ------ | ------------------------------------------- |
| Mux raises prices     | Low         | Medium | Migrate to Bunny                            |
| Vercel raises prices  | Low         | Low    | Self-host via Railway                       |
| Low client adoption   | Medium      | High   | Focus on first client results as case study |
| Excessive chargebacks | Low         | Medium | Stripe Radar + clear refund policy          |
| Video downtime        | Low         | High   | Monitoring + contractual SLA                |
