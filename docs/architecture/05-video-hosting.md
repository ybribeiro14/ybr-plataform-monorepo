# 05 — Video Hosting

**Date:** 2026-04-24 | **Critical project decision**

---

## Why Video Hosting is Critical

Video is **the core product** of the platform. Streaming quality directly determines:

- Course completion rates (student engagement)
- Chargebacks/refunds (frustrated students when video fails to load)
- Perceived platform value vs Hotmart
- Infrastructure cost (often the largest variable expense)
- Content protection (piracy = direct loss for the creator)

---

## Provider Comparison

### Bunny Stream ⭐ (Phase 1 — Recommended)

**Positioning:** High-performance CDN with streaming included

| Metric       | Value                       |
| ------------ | --------------------------- |
| Encoding     | **Free**                    |
| Storage      | $0.01/GB                    |
| CDN Delivery | $0.005–$0.025/GB            |
| Player       | Free + customizable         |
| DRM          | Included in Enterprise tier |
| Trial        | 14 days free                |

**Estimated Monthly Cost (100 10-min videos, 1,000 students/month):**

- Storage: 100 videos × ~500MB = 50GB × $0.01 = **$0.50**
- Delivery: 40,000 min streaming × ~250MB/h = ~167GB × $0.005 = **$0.83**
- **Total: ~$1.33/month** (10–25× cheaper than Mux!)

**Strengths:**

- **Extremely low cost** — ideal for launch phase
- Free encoding
- Customizable player included
- 119 global PoPs (250 Tbps backbone)
- Token authentication included
- Hotlink protection
- Simple, well-documented API
- 85,000+ customers

**Weaknesses:**

- No official React SDK (but simple REST API)
- Less detailed analytics than Mux
- No AI features (automatic subtitles, etc.)
- No free DRM (Enterprise only)

---

### Mux Video ⭐ (Phase 2+ — Recommended for Scale)

**Positioning:** API-first video infrastructure for developers

| Metric              | Value                         |
| ------------------- | ----------------------------- |
| Pricing model       | Pay-as-you-go                 |
| Input (encoding)    | Free (Basic quality)          |
| Storage (720p)      | $0.0024/min/month             |
| Delivery (720p)     | $0.0008/min                   |
| Free monthly credit | 100K minutes                  |
| DRM                 | $100/month + $0.003/play      |
| Free tier           | 10 videos + 100K min delivery |

**Estimated Monthly Cost (same workload as above):**

- Storage: 1,000 min × $0.0024 = **$2.40**
- Delivery: 1,000 students × 10 min × 4 views = 40,000 min × $0.0008 = **$32**
- **Total: ~$35/month** (without DRM)

**Strengths:**

- Official `@mux/mux-player-react` SDK (but we use our custom player)
- Adaptive Bitrate (HLS) automatic
- Signed URLs for content protection (included free)
- Per-video engagement analytics
- Complete webhook events (`video.asset.ready`, `video.asset.errored`)
- **Mux Robots:** AI for automatic subtitles, chapters, summaries
- Excellent analytics dashboard
- Automatic Cold Storage (60% discount for inactive videos)
- Trusted by: Patreon, Substack, HubSpot, Typeform

**Weaknesses:**

- Cost scales with usage (fine for early phase, watch at scale)
- DRM expensive ($100/month base)

---

### Cloudflare Stream

**Positioning:** Simple streaming, within the Cloudflare ecosystem

| Metric         | Value                                          |
| -------------- | ---------------------------------------------- |
| Starter Bundle | $5/month (1K min storage + 5K min delivery)    |
| Creator Bundle | $50/month (10K min storage + 50K min delivery) |
| Overage        | Pay-as-you-go                                  |
| DRM            | Not available                                  |
| PoPs           | 330+                                           |

**Strengths:**

- Native integration with Cloudflare stack (CDN, Workers, R2)
- 330+ PoPs (largest of the three)
- Predictable pricing for initial phase

**Weaknesses:**

- **No DRM** — problem for paid content protection
- Less developer-friendly API than Mux
- Fewer analytics features

---

### Not Recommended

| Platform                      | Reason for Elimination                       |
| ----------------------------- | -------------------------------------------- |
| Vimeo OTT                     | High cost ($75–$500/month) + limited control |
| Wistia                        | Focused on marketing, not LMS/e-learning     |
| YouTube (private)             | Suspension risk, no control, no DRM          |
| AWS MediaConvert + CloudFront | Excessive complexity, high cost              |

---

## Decision: Two-Stage Strategy

### Phase 1 — Launch (Bunny Stream)

**Reason:** Minimum cost while the platform builds its student base.

**Setup:**

- Upload via Bunny Stream API
- Custom HLS player (see [04-video-player-strategy.md](./04-video-player-strategy.md))
- Token Authentication for basic protection
- Estimated cost: **$3–10/month** in the first months

### Phase 2 — Scale (Mux Video)

**Migration trigger:** When MRR > $500/month or when AI features are needed.

**Reason:** Mux Robots (automatic PT-BR subtitles), advanced analytics, DRM for premium content.

**Hybrid alternative:** Use Mux for premium paid courses (DRM) + Bunny for free previews.

**Migration effort:** Zero UI changes — only the `src` URL changes in the player.

---

## Cost Comparison at Scale

| Videos     | Total Minutes | 100 students/month   | Bunny Cost | Mux Cost   |
| ---------- | ------------- | -------------------- | ---------- | ---------- |
| 20 × 15min | 300 min       | 30,000 min delivery  | $3/month   | $24/month  |
| 40 × 15min | 600 min       | 60,000 min delivery  | $6/month   | $48/month  |
| 80 × 20min | 1,600 min     | 160,000 min delivery | $16/month  | $128/month |

_Calculations: Bunny $0.005/GB × ~200MB/h = ~$0.0002/min; Mux $0.0008/min_
