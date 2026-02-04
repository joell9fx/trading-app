import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { user_id } = await req.json()

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  const { data: referrals, error: refErr } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', user_id)
    .eq('status', 'converted')

  if (refErr) {
    return NextResponse.json({ error: refErr.message }, { status: 400 })
  }

  const referralCount = referrals?.length || 0

  const { data: tiers, error: tierErr } = await supabase
    .from('affiliate_tiers')
    .select('*')
    .order('min_referrals', { ascending: true })

  if (tierErr || !tiers) {
    return NextResponse.json({ error: tierErr?.message || 'No tiers configured' }, { status: 400 })
  }

  const tier = [...tiers].reverse().find((t) => referralCount >= (t.min_referrals || 0)) || tiers[0]

  await supabase.from('profiles').update({ affiliate_tier: tier.name }).eq('id', user_id)

  return NextResponse.json({ tier, referralCount })
}

