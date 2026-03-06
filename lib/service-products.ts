// Map service keys to Stripe price IDs (from env). If a price is missing, the
// checkout API will respond with an error to avoid broken purchases.
export const SERVICE_PRODUCTS: Record<string, string | undefined> = {
  signals: process.env.STRIPE_PRICE_SIGNALS,
  gold_to_glory: process.env.STRIPE_PRICE_G2G,
  elite_membership: process.env.STRIPE_PRICE_ELITE,
  vip_membership: process.env.STRIPE_PRICE_VIP,
}

export const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  signals: 'Premium Signals',
  gold_to_glory: 'Gold to Glory',
  elite_membership: 'Elite Membership',
  vip_membership: 'VIP Membership',
}

