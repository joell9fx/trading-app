/**
 * @jest-environment node
 */
import { describe, it, expect, jest } from '@jest/globals'
import {
  SERVICES_CATALOG,
  PAID_SERVICE_KEYS,
  INCLUDED_SERVICE_KEYS,
  COMING_SOON_SERVICE_KEYS,
  SERVICE_BY_KEY,
} from '@/lib/services-catalog'
import { ALL_SERVICES } from '@/lib/services-list'
import { computeTier } from '@/lib/tier-utils'
import {
  ACCESS_DEFAULTS,
  deriveAccessFromProfile,
  mergeAccessWithOverrides,
  countUnlocked,
} from '@/lib/access-flags'
import { getSafeRedirectPath } from '@/lib/utils'
import { escapeHtml } from '@/lib/escape-html'

describe('services catalogue', () => {
  it('has unique keys and sections', () => {
    const keys = SERVICES_CATALOG.map((s) => s.key)
    const sections = SERVICES_CATALOG.map((s) => s.section)
    expect(new Set(keys).size).toBe(keys.length)
    expect(new Set(sections).size).toBe(sections.length)
  })

  it('puts every service in exactly one of paid / included / coming soon', () => {
    const groups = [...PAID_SERVICE_KEYS, ...INCLUDED_SERVICE_KEYS, ...COMING_SOON_SERVICE_KEYS]
    expect(new Set(groups).size).toBe(groups.length)
    expect([...groups].sort()).toEqual(SERVICES_CATALOG.map((s) => s.key).sort())
  })

  it('keeps each status in line with its group', () => {
    PAID_SERVICE_KEYS.forEach((k) => expect(SERVICE_BY_KEY[k].status).toBe('paid'))
    INCLUDED_SERVICE_KEYS.forEach((k) => expect(SERVICE_BY_KEY[k].status).toBe('included'))
    COMING_SOON_SERVICE_KEYS.forEach((k) => expect(SERVICE_BY_KEY[k].status).toBe('coming_soon'))
  })

  it('gives every redeemable service a positive whole credit cost', () => {
    expect(ALL_SERVICES.find((s) => s.key === ('auto_trader' as string))).toBeUndefined()
    ALL_SERVICES.forEach((s) => {
      expect(Number.isInteger(s.credit_cost)).toBe(true)
      expect(s.credit_cost).toBeGreaterThan(0)
    })
  })

  it('makes the Stripe price map follow env vars, so unset prices stay unavailable', () => {
    const saved = { ...process.env }
    process.env.STRIPE_PRICE_SIGNALS = 'price_test_signals'
    delete process.env.STRIPE_PRICE_VIP
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { SERVICE_PRODUCTS, SERVICE_DISPLAY_NAMES } = require('@/lib/service-products')
      expect(SERVICE_PRODUCTS.signals).toBe('price_test_signals')
      expect(SERVICE_PRODUCTS.vip_membership).toBeUndefined()
      expect(Object.keys(SERVICE_DISPLAY_NAMES).sort()).toEqual([...PAID_SERVICE_KEYS].sort())
    })
    process.env = saved
  })
})

describe('computeTier', () => {
  it.each([
    [0, 'Standard'],
    [1, 'Standard'],
    [2, 'Premium'],
    [3, 'Premium'],
    [4, 'Elite'],
    [9, 'Elite'],
  ])('%i unlocked → %s', (count, tier) => {
    expect(computeTier(count)).toBe(tier)
  })
})

describe('access flags', () => {
  it('reads boolean access columns and ignores anything else', () => {
    const access = deriveAccessFromProfile({ has_signals_access: 'yes', has_courses_access: false, has_funding_access: true })
    expect(access.signals).toBe(ACCESS_DEFAULTS.signals) // 'yes' is not a boolean
    expect(access.courses).toBe(false)
    expect(access.funding).toBe(true)
  })

  it('falls back to defaults with no profile', () => {
    expect(deriveAccessFromProfile()).toEqual(ACCESS_DEFAULTS)
  })

  it('applies only known boolean overrides', () => {
    const base = { ...ACCESS_DEFAULTS }
    const merged = mergeAccessWithOverrides(base, { signals: true, not_a_module: true } as Record<string, boolean>)
    expect(merged.signals).toBe(true)
    expect('not_a_module' in merged).toBe(false)
  })

  it('counts unlocked modules', () => {
    const all = Object.fromEntries(Object.keys(ACCESS_DEFAULTS).map((k) => [k, true])) as typeof ACCESS_DEFAULTS
    expect(countUnlocked(all)).toBe(Object.keys(ACCESS_DEFAULTS).length)
  })
})

describe('getSafeRedirectPath', () => {
  it.each([
    [null, '/dashboard'],
    ['', '/dashboard'],
    ['https://evil.example', '/dashboard'],
    ['//evil.example', '/dashboard'],
    ['/\\evil.example', '/dashboard'],
    ['/a\r\nSet-Cookie: x', '/dashboard'],
    ['/dashboard?section=wallet', '/dashboard?section=wallet'],
  ])('%p → %p', (input, out) => {
    expect(getSafeRedirectPath(input as string | null)).toBe(out)
  })
})

describe('escapeHtml', () => {
  it('escapes markup characters', () => {
    expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe(
      '&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;',
    )
  })
  it('handles null and numbers', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(5)).toBe('5')
  })
})
