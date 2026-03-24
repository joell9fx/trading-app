import type { SupabaseClient } from '@supabase/supabase-js'

function has(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

export type LaunchReadinessSnapshot = {
  environment: {
    stripeSecret: boolean
    /** Alias for client docs; same as stripePublic (NEXT_PUBLIC_STRIPE_PUBLIC_KEY). */
    nextPublicStripe: boolean
    stripePublic: boolean
    stripeWebhook: boolean
    supabaseServiceRole: boolean
    siteUrl: boolean
    siteUrlSource: 'NEXT_PUBLIC_SITE_URL' | 'DOMAIN_URL' | 'none'
    prices: {
      signals: boolean
      gold_to_glory: boolean
      elite_membership: boolean
      vip_membership: boolean
      auto_trader: boolean
    }
  }
  database: {
    user_services: { exists: boolean; error: string | null }
    user_trades: { exists: boolean; error: string | null }
  }
  summary: {
    /** True when there are zero blockers (checkout / webhooks / critical DB may still warn). */
    launchReady: boolean
    status: 'ok' | 'degraded' | 'blocked'
    blockers: string[]
    warnings: string[]
    checks: { label: string; ok: boolean; detail?: string }[]
  }
}

function envSnapshot(): LaunchReadinessSnapshot['environment'] {
  const siteFromPublic = has(process.env.NEXT_PUBLIC_SITE_URL)
  const siteFromDomain = has(process.env.DOMAIN_URL)
  const stripePublic = has(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  return {
    stripeSecret: has(process.env.STRIPE_SECRET_KEY),
    nextPublicStripe: stripePublic,
    stripePublic,
    stripeWebhook: has(process.env.STRIPE_WEBHOOK_SECRET),
    supabaseServiceRole: has(process.env.SUPABASE_SERVICE_ROLE_KEY),
    siteUrl: siteFromPublic || siteFromDomain,
    siteUrlSource: siteFromPublic ? 'NEXT_PUBLIC_SITE_URL' : siteFromDomain ? 'DOMAIN_URL' : 'none',
    prices: {
      signals: has(process.env.STRIPE_PRICE_SIGNALS),
      gold_to_glory: has(process.env.STRIPE_PRICE_G2G),
      elite_membership: has(process.env.STRIPE_PRICE_ELITE),
      vip_membership: has(process.env.STRIPE_PRICE_VIP),
      auto_trader: has(process.env.STRIPE_PRICE_AUTO_TRADER),
    },
  }
}

function buildSummary(
  env: LaunchReadinessSnapshot['environment'],
  db: LaunchReadinessSnapshot['database'],
): LaunchReadinessSnapshot['summary'] {
  const blockers: string[] = []
  const warnings: string[] = []
  const checks: LaunchReadinessSnapshot['summary']['checks'] = []

  const add = (label: string, ok: boolean, detail?: string) => checks.push({ label, ok, detail })

  if (!env.stripeSecret) {
    blockers.push('STRIPE_SECRET_KEY is missing — checkout cannot be created.')
    add('Stripe secret key', false, 'Set STRIPE_SECRET_KEY')
  } else add('Stripe secret key', true)

  if (!env.stripePublic) {
    warnings.push('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is missing — client may not load Stripe.js correctly.')
    add('Stripe publishable key', false)
  } else add('Stripe publishable key', true)

  if (!env.stripeWebhook) {
    blockers.push('STRIPE_WEBHOOK_SECRET is missing — paid unlocks will not apply after checkout.')
    add('Stripe webhook secret', false, 'Set STRIPE_WEBHOOK_SECRET for /api/stripe/webhook')
  } else add('Stripe webhook secret', true)

  if (!env.supabaseServiceRole) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing — some server operations may fail.')
    add('Supabase service role', false)
  } else add('Supabase service role', true)

  if (!env.siteUrl) {
    warnings.push('Set NEXT_PUBLIC_SITE_URL or DOMAIN_URL for correct checkout success/cancel URLs.')
    add('Public site URL', false)
  } else add('Public site URL', true, env.siteUrlSource)

  const paidPriceLabels: [keyof typeof env.prices, string][] = [
    ['signals', 'Signals (STRIPE_PRICE_SIGNALS)'],
    ['gold_to_glory', 'Gold to Glory (STRIPE_PRICE_G2G)'],
    ['elite_membership', 'Elite (STRIPE_PRICE_ELITE)'],
    ['vip_membership', 'VIP (STRIPE_PRICE_VIP)'],
  ]
  for (const [key, label] of paidPriceLabels) {
    if (!env.prices[key]) {
      warnings.push(`${label} is not set — that plan will show as unavailable on pricing.`)
      add(label, false)
    } else add(label, true)
  }

  if (!env.prices.auto_trader) {
    add('Auto Trader price (optional)', false, 'Coming soon; STRIPE_PRICE_AUTO_TRADER optional')
  } else add('Auto Trader price (optional)', true)

  if (!db.user_services.exists) {
    blockers.push(`user_services table not reachable: ${db.user_services.error || 'unknown error'}`)
    add('Table user_services', false, db.user_services.error ?? undefined)
  } else add('Table user_services', true)

  if (!db.user_trades.exists) {
    warnings.push(`user_trades not reachable: ${db.user_trades.error || 'unknown'} — trades API may fail.`)
    add('Table user_trades', false, db.user_trades.error ?? undefined)
  } else add('Table user_trades', true)

  let status: LaunchReadinessSnapshot['summary']['status'] = 'ok'
  if (blockers.length > 0) status = 'blocked'
  else if (warnings.length > 0) status = 'degraded'

  const launchReady = blockers.length === 0

  return { launchReady, status, blockers, warnings, checks }
}

export async function getLaunchReadinessSnapshot(
  supabase: SupabaseClient,
): Promise<LaunchReadinessSnapshot> {
  const environment = envSnapshot()
  const [servicesRes, tradesRes] = await Promise.all([
    supabase.from('user_services').select('id', { count: 'exact', head: true }),
    supabase.from('user_trades').select('id', { count: 'exact', head: true }),
  ])
  const database = {
    user_services: {
      exists: !servicesRes.error,
      error: servicesRes.error?.message ?? null,
    },
    user_trades: {
      exists: !tradesRes.error,
      error: tradesRes.error?.message ?? null,
    },
  }
  const summary = buildSummary(environment, database)
  return { environment, database, summary }
}
