import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reward_id } = await req.json()
    if (!reward_id) {
      return NextResponse.json({ error: 'reward_id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('referral_rewards')
      .update({ is_redeemed: true })
      .eq('id', reward_id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Redeem error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

