import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function generateCode() {
  return Math.random().toString(36).slice(2, 10)
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure referral_code exists
  const { data: profile } = await supabase.from('profiles').select('id, referral_code').eq('id', auth.user.id).single()
  let referralCode = profile?.referral_code
  if (!referralCode) {
    referralCode = generateCode()
    await supabase.from('profiles').update({ referral_code: referralCode }).eq('id', auth.user.id)
  }

  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, referral_code, status, created_at')
    .eq('referrer_id', auth.user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    referral_code: referralCode,
    referrals: referrals || [],
  })
}

