import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { referred_user_id } = await req.json()

  if (!referred_user_id) {
    return NextResponse.json({ error: 'Missing referred_user_id' }, { status: 400 })
  }

  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_user_id', referred_user_id)
    .single()

  if (!referral || referral.reward_given) {
    return NextResponse.json({ message: 'No reward to grant' }, { status: 200 })
  }

  if (!referral.referrer_id) {
    return NextResponse.json({ message: 'No referrer' }, { status: 200 })
  }

  await addXP(supabase, referral.referrer_id, 25, 'Referral Signup')

  await supabase
    .from('referrals')
    .update({ status: 'converted', reward_given: true })
    .eq('id', referral.id)

  await assignBadges(supabase, referral.referrer_id)

  return NextResponse.json({ message: 'Referral reward granted' })
}

