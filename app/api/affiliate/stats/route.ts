import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = auth.user.id

  const [{ data: profile }, { data: tiers }, { data: referrals }, { data: payouts }] = await Promise.all([
    supabase.from('profiles').select('affiliate_tier').eq('id', userId).single(),
    supabase.from('affiliate_tiers').select('*').order('min_referrals', { ascending: true }),
    supabase.from('referrals').select('id, status, created_at').eq('referrer_id', userId),
    supabase.from('affiliate_payouts').select('id, amount, status, created_at, paid_at').eq('affiliate_id', userId),
  ])

  const totalReferrals = referrals?.length || 0
  const converted = referrals?.filter((r) => r.status === 'converted').length || 0
  const pending = referrals?.filter((r) => r.status !== 'converted').length || 0

  const totalCommission = (payouts || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)

  // group monthly commission
  const monthlyMap: Record<string, number> = {}
  ;(payouts || []).forEach((p) => {
    const d = p.created_at ? new Date(p.created_at) : new Date()
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(p.amount || 0)
  })
  const monthly = Object.entries(monthlyMap).map(([k, v]) => ({ month: k, commission: v }))

  // next tier target
  let nextTier = null as null | { name: string; remaining: number }
  if (tiers && tiers.length) {
    const current = tiers.find((t) => t.name === profile?.affiliate_tier) || tiers[0]
    const idx = tiers.findIndex((t) => t.name === current.name)
    if (idx < tiers.length - 1) {
      const goal = tiers[idx + 1]
      nextTier = { name: goal.name, remaining: Math.max(goal.min_referrals - converted, 0) }
    }
  }

  return NextResponse.json({
    tier: profile?.affiliate_tier || 'Bronze',
    total_referrals: totalReferrals,
    converted_referrals: converted,
    pending_referrals: pending,
    total_commission: totalCommission,
    monthly,
    next_tier: nextTier,
  })
}

