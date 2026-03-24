import { ALL_SERVICES, type ServiceKey } from '@/lib/services-list'

// Map service keys to Stripe price IDs (from env). If a price is missing, the
// checkout API will respond with an error to avoid broken purchases.
export const SERVICE_PRODUCTS: Record<string, string | undefined> = {
  signals: process.env.STRIPE_PRICE_SIGNALS,
  gold_to_glory: process.env.STRIPE_PRICE_G2G,
  elite_membership: process.env.STRIPE_PRICE_ELITE,
  vip_membership: process.env.STRIPE_PRICE_VIP,
  mentorship: process.env.STRIPE_PRICE_MENTORSHIP,
  community: process.env.STRIPE_PRICE_COMMUNITY,
  funding: process.env.STRIPE_PRICE_FUNDING,
  courses: process.env.STRIPE_PRICE_COURSES,
  auto_trader: process.env.STRIPE_PRICE_AUTO_TRADER,
}

const PAID_DISPLAY_KEYS = new Set<ServiceKey>([
  'signals',
  'gold_to_glory',
  'elite_membership',
  'vip_membership',
])

export const SERVICE_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  ALL_SERVICES.filter((entry) => PAID_DISPLAY_KEYS.has(entry.key)).map((entry) => [
    entry.key,
    entry.name,
  ]),
) as Record<string, string>
