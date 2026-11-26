import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminOrInternal } from '@/lib/api/internal-auth'
import { serverError } from '@/lib/api/errors'

const BodySchema = z.object({ user_id: z.string().uuid() })

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { error: authError, supabase } = await requireAdminOrInternal(req)
  if (authError || !supabase) return authError

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'user_id (uuid) is required' }, { status: 400 })
  }
  const { user_id } = parsed.data

  const { data: referrals, error: refErr } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', user_id)
    .eq('status', 'converted')

  if (refErr) {
    return serverError(refErr, 'affiliate/evaluate-tier', 400)
  }

  const referralCount = referrals?.length || 0

  const { data: tiers, error: tierErr } = await supabase
    .from('affiliate_tiers')
    .select('*')
    .order('min_referrals', { ascending: true })

  if (tierErr || !tiers) {
    return serverError(tierErr ?? 'no tiers', 'affiliate/evaluate-tier', 400, 'No affiliate tiers configured')
  }

  const tier = [...tiers].reverse().find((t) => referralCount >= (t.min_referrals || 0)) || tiers[0]

  await supabase.from('profiles').update({ affiliate_tier: tier.name }).eq('id', user_id)

  return NextResponse.json({ tier, referralCount })
}

