import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminOrInternal } from '@/lib/api/internal-auth'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  referred_user_id: z.string().uuid(),
  amount: z.coerce.number().positive().max(100000),
})

export async function POST(req: NextRequest) {
  const { error: authError, supabase } = await requireAdminOrInternal(req)
  if (authError || !supabase) return authError

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'referred_user_id (uuid) and a positive amount are required' }, { status: 400 })
  }
  const { referred_user_id, amount } = parsed.data

  const { data: referral, error: refErr } = await supabase
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referred_user_id', referred_user_id)
    .single()

  if (refErr || !referral?.referrer_id) {
    return NextResponse.json({ error: 'No referrer found' }, { status: 404 })
  }

  const referrerId = referral.referrer_id

  const { data: profile } = await supabase
    .from('profiles')
    .select('affiliate_tier, affiliate_total_commission')
    .eq('id', referrerId)
    .single()

  const { data: tier } = await supabase
    .from('affiliate_tiers')
    .select('*')
    .eq('name', profile?.affiliate_tier || 'Bronze')
    .single()

  const commissionRate = tier?.commission_rate ?? 0.05
  const xpBonus = tier?.xp_bonus ?? 10
  const commission = Number(amount) * commissionRate

  await supabase
    .from('affiliate_payouts')
    .insert([{ affiliate_id: referrerId, referral_id: referral.id, amount: commission }])

  await addXP(supabase, referrerId, xpBonus, 'Affiliate Commission')

  const totalEarned = Number(profile?.affiliate_total_commission || 0) + commission
  await supabase.from('profiles').update({ affiliate_total_commission: totalEarned }).eq('id', referrerId)

  // auto-upgrade tier based on converted referrals
  const { count: convertedCount } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', referrerId)
    .eq('status', 'converted')
  const safeConvertedCount = Number(convertedCount || 0)

  const { data: tiers } = await supabase
    .from('affiliate_tiers')
    .select('*')
    .order('min_referrals', { ascending: true })

  if (tiers) {
    const newTier = [...tiers].reverse().find((t) => safeConvertedCount >= (t.min_referrals || 0)) || tiers[0]
    if (newTier) {
      await supabase.from('profiles').update({ affiliate_tier: newTier.name }).eq('id', referrerId)
    }
  }

  await assignBadges(supabase, referrerId)

  return NextResponse.json({ message: 'Commission added', commission, xp_awarded: xpBonus })
}

