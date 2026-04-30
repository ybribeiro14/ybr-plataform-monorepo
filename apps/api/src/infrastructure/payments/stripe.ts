import Stripe from 'stripe'

const createStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return null
  }
  return new Stripe(key, { apiVersion: '2025-02-24.acacia', typescript: true })
}

export const stripe = createStripeClient()

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''
