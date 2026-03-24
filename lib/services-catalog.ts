/**
 * Service catalog: `key` is the canonical DB / Stripe / checkout identifier (snake_case).
 * `section` is the dashboard URL segment (kebab-case), e.g. gold_to_glory → gold-to-glory.
 */
export type ServiceCatalogItem = {
  key:
    | 'community'
    | 'signals'
    | 'mentorship'
    | 'funding'
    | 'courses'
    | 'gold_to_glory'
    | 'elite_membership'
    | 'vip_membership'
    | 'auto_trader'
  name: string
  description: string
  section:
    | 'community-hub'
    | 'funding'
    | 'courses'
    | 'mentorship'
    | 'signals'
    | 'gold-to-glory'
    | 'elite-membership'
    | 'vip-membership'
    | 'auto-trader'
  status: 'paid' | 'included' | 'coming_soon'
  priceLabel?: string
  positioning: string
}

export const SERVICES_CATALOG: ServiceCatalogItem[] = [
  {
    key: 'community',
    name: 'Community Hub',
    description: 'Join live discussions and trade ideas.',
    section: 'community-hub',
    status: 'included',
    positioning: 'Real-time chat, ideas, and community support for every member.',
  },
  {
    key: 'funding',
    name: 'Funding Account Support',
    description: 'Track prop firm evaluations and funding status.',
    section: 'funding',
    status: 'included',
    positioning: 'Stay on top of evaluations, rules, and funding milestones.',
  },
  {
    key: 'courses',
    name: 'Trading Courses',
    description: 'Step-by-step video education library.',
    section: 'courses',
    status: 'included',
    positioning: 'Structured lessons you can follow at your own pace.',
  },
  {
    key: 'mentorship',
    name: 'Mentorship',
    description: '1-on-1 sessions with professional traders.',
    section: 'mentorship',
    status: 'included',
    positioning: 'Direct guidance from experienced traders when you need it.',
  },
  {
    key: 'auto_trader',
    name: 'Auto Trader',
    description: 'Automated execution and strategy tools.',
    section: 'auto-trader',
    status: 'coming_soon',
    positioning: 'Systematic automation with risk controls and strategy templates.',
  },
  {
    key: 'signals',
    name: 'Trading Signals',
    description: 'Get daily setups and trade calls.',
    section: 'signals',
    status: 'paid',
    priceLabel: 'Entry plan',
    positioning: 'Daily setups, levels, and commentary to act with clarity.',
  },
  {
    key: 'gold_to_glory',
    name: 'Gold to Glory',
    description: 'Follow the 100 → 1000 XAUUSD challenge.',
    section: 'gold-to-glory',
    status: 'paid',
    priceLabel: 'Challenge',
    positioning: 'A focused XAUUSD challenge with milestones and breakdowns.',
  },
  {
    key: 'elite_membership',
    name: 'Elite Membership',
    description: 'Premium membership benefits and perks.',
    section: 'elite-membership',
    status: 'paid',
    priceLabel: 'Best value',
    positioning: 'Premium perks, priority support, and exclusive drops.',
  },
  {
    key: 'vip_membership',
    name: 'VIP Membership',
    description: 'Top-tier VIP perks and concierge access.',
    section: 'vip-membership',
    status: 'paid',
    priceLabel: 'Premium',
    positioning: 'Concierge-level access, early invites, and white-glove support.',
  },
]

export const PAID_SERVICE_KEYS = [
  'signals',
  'gold_to_glory',
  'elite_membership',
  'vip_membership',
] as const satisfies readonly ServiceCatalogItem['key'][]

export const INCLUDED_SERVICE_KEYS = ['community', 'funding', 'courses', 'mentorship'] as const satisfies readonly ServiceCatalogItem['key'][]

export const COMING_SOON_SERVICE_KEYS = ['auto_trader'] as const

export const SERVICE_BY_KEY = Object.fromEntries(
  SERVICES_CATALOG.map((item) => [item.key, item]),
) as Record<ServiceCatalogItem['key'], ServiceCatalogItem>
