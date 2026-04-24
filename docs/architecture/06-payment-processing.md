# 06 — Payment Processing

**Date:** 2026-04-24

---

## Payment Requirements

For the platform to serve the initial client and future expansions:

| Requirement                              | Priority |
| ---------------------------------------- | -------- |
| US credit cards (Visa, Mastercard, Amex) | CRITICAL |
| Installments — 2× to 12×                 | HIGH     |
| One-time purchase                        | CRITICAL |
| Recurring subscriptions                  | MEDIUM   |
| 15-day refund policy                     | CRITICAL |
| Customizable/embeddable checkout         | HIGH     |
| Discount coupons                         | HIGH     |
| Robust webhooks                          | CRITICAL |
| PCI DSS compliance                       | CRITICAL |
| Apple Pay / Google Pay                   | MEDIUM   |
| PayPal                                   | LOW      |

---

## Gateway Comparison

### Stripe ⭐ (Recommended)

**The gold standard for SaaS and e-learning platforms**

| Fee                    | Amount             |
| ---------------------- | ------------------ |
| Standard US card       | 2.9% + $0.30       |
| International card     | 3.9% + $0.30       |
| American Express       | 3.9% + $0.30       |
| Apple Pay / Google Pay | Same as card rates |
| Chargeback             | $15 per dispute    |
| Refund                 | No additional fee  |

**For a $197 sale:**

- Stripe fee: $197 × 2.9% + $0.30 = **$5.01 (2.5%)**
- Net revenue: **$191.99**

**vs Hotmart for $197:**

- Hotmart fee: $197 × 9.9% = **$19.50**
- Hotmart net: **$177.50**
- **Savings with Stripe: $14.49 per sale (7.4% more revenue)**

**Strengths:**

- Most complete API in the market
- Excellent TypeScript SDK
- Stripe Elements (customizable UI embedded in page)
- Stripe Checkout (hosted page option)
- 100% reliable webhooks
- Excellent dashboard
- Market-leading documentation
- Stripe Radar (ML-based fraud detection)
- 135+ currency support
- Automatic PCI DSS compliance
- Stripe Installments for BNPL (Klarna, Afterpay, Affirm)

**Current API version used:** `2025-02-24.acacia`

---

### Paddle (Alternative for Global SaaS)

**Positioning:** Merchant of Record — simplifies global tax compliance

| Fee            | Amount                     |
| -------------- | -------------------------- |
| Standard       | 5% + $0.50 per transaction |
| Taxes included | Yes (MoR handles VAT/GST)  |

**When to use Paddle:**

- If the platform expands to multiple countries with VAT/GST requirements
- Paddle assumes tax liability (no need to register in each country)
- More expensive (5% vs 2.9%) but eliminates tax complexity

**For our US-focused client:** Stripe is sufficient and cheaper.

---

### PayPal (Secondary Option)

- Fee: 3.49% + $0.49 (US standard)
- Worse experience for course platforms
- Add as secondary method only if there's demand
- Many Brazilian users in the US prefer PayPal

**Recommendation:** Add PayPal as additional method through Stripe Checkout (Stripe supports native PayPal).

---

## Checkout Strategy

### Stripe Elements (Recommended — Custom UI)

Embedded checkout within the platform's own domain:

```typescript
import { PaymentElement } from '@stripe/react-stripe-js'

const CheckoutForm = () => (
  <form onSubmit={handleSubmit}>
    <PaymentElement /> {/* Stripe UI, visually customizable */}
    <button type="submit">Buy now</button>
  </form>
)
```

**Advantages:** Checkout on own domain, maximum customization, no redirect.

### Stripe Checkout (Hosted Page)

Redirects to `checkout.stripe.com` — simpler to implement, less customizable.

**Recommendation:** Use Stripe Elements for a superior on-brand experience.

---

## Installment Strategy for Brazilians in the US

### Context

Brazilians are culturally accustomed to interest-free installments ("parcelamento sem juros"). Adapting this for the US market:

1. **Stripe Installments via Klarna/Afterpay/Affirm** — US BNPL platforms
2. **Price anchoring** — Display "6× $37" prominently, full price secondary
3. **Absorb BNPL fees** into product price (factor ~4.99% BNPL fee into pricing)

### Implementation

```typescript
// Create PaymentIntent with installment support
const paymentIntent = await stripe.paymentIntents.create({
  amount: 19700, // $197.00 in cents
  currency: "usd",
  payment_method_types: ["card"],
  payment_method_options: {
    card: {
      installments: {
        enabled: true, // Enables BNPL via Stripe
      },
    },
  },
});
```

---

## Webhook Integration

### Webhook Endpoint

```typescript
// apps/api/src/routes/payments/webhook.ts
const handleStripeWebhook = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sig = request.headers["stripe-signature"] as string;
  const rawBody = (request as unknown as { rawBody: Buffer }).rawBody;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return reply.status(400).send({ error: "Invalid webhook signature" });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case "charge.dispute.created":
      await handleChargeDispute(event.data.object as Stripe.Dispute);
      break;
  }

  return reply.send({ received: true });
};
```

### Critical Security Notes

- **Always validate webhook signatures** with `stripe.webhooks.constructEvent()`
- **Never trust the webhook payload** without signature verification
- Store raw body before JSON parsing for signature validation
- Return `200` immediately, then process asynchronously for heavy operations

---

## Refund Policy

Standard 15-day money-back guarantee:

```typescript
// Initiate refund
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: "requested_by_customer",
});

// Update enrollment status
await db
  .update(enrollments)
  .set({ status: "refunded" })
  .where(eq(enrollments.paymentId, paymentId));
```

---

## SaaS Subscription Plans

For creator platform subscriptions (not course purchases):

```typescript
// Create subscription for creator
const subscription = await stripe.subscriptions.create({
  customer: stripeCustomerId,
  items: [{ price: PLAN_PRICE_IDS[plan] }],
  payment_behavior: "default_incomplete",
  expand: ["latest_invoice.payment_intent"],
});
```

| Plan    | Price/month | Stripe Price ID |
| ------- | ----------- | --------------- |
| Starter | $49         | `price_starter` |
| Growth  | $99         | `price_growth`  |
| Pro     | $199        | `price_pro`     |
| Agency  | $499        | `price_agency`  |
