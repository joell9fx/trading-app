import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: balance, error: balanceError } = await supabase
    .from('user_wallet_balance')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (balanceError) {
    return NextResponse.json({ error: balanceError.message }, { status: 400 })
  }

  const { data: rewards } = await supabase
    .from('referral_rewards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ balance: balance || { available_credits: 0, total_earned: 0 }, rewards: rewards || [] })
}

