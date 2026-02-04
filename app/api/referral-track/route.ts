import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { referral_code, new_user_id } = await req.json()

  if (!referral_code || !new_user_id) {
    return NextResponse.json({ error: 'Missing referral_code or new_user_id' }, { status: 400 })
  }

  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referral_code)
    .single()

  if (!referrer) {
    return NextResponse.json({ success: true }) // Ignore invalid codes silently
  }

  // Avoid duplicate rows
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrer.id)
    .eq('referred_user_id', new_user_id)
    .maybeSingle()

  if (!existing) {
    await supabase.from('referrals').insert([{ referrer_id: referrer.id, referred_user_id: new_user_id, referral_code }])
  }

  await supabase.from('profiles').update({ referred_by: referral_code }).eq('id', new_user_id)

  return NextResponse.json({ success: true })
}

