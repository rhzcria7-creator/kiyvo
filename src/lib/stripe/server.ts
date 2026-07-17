// Stripe Server Configuration
import Stripe from 'stripe'

export function getStripeServer(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })
}
