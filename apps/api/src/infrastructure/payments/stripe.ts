import Stripe from 'stripe'

const createStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn('[Stripe] STRIPE_SECRET_KEY not set — Stripe will not be available (dev mode)')
    return null
  }
  return new Stripe(key, { apiVersion: '2025-02-24.acacia', typescript: true })
}

export const stripe = createStripeClient()

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''
