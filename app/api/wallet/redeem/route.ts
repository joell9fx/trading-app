import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateUserTier } from '@/lib/tier-utils'
import { accessColumnForService } from '@/lib/access-flags'

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

    const { service_key, cost } = await req.json()
    if (!service_key || typeof cost !== 'number') {
      return NextResponse.json({ error: 'service_key and cost required' }, { status: 400 })
    }

    const column = accessColumnForService(service_key)
    if (!column && service_key !== 'community') {
      return NextResponse.json({ error: 'Unknown service_key' }, { status: 400 })
    }

    const { data: balance } = await supabase
      .from('user_wallet_balance')
      .select('available_credits')
      .eq('user_id', user.id)
      .single()

    const available = balance?.available_credits || 0
    if (available < cost) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }

    const { error: spendError } = await supabase.from('referral_rewards').insert([
      {
        user_id: user.id,
        reward_type: 'credit',
        transaction_type: 'spend',
        amount: -cost,
        description: `Used ${cost} credits to unlock ${service_key}`,
        is_redeemed: true,
      },
    ])

    if (spendError) {
      return NextResponse.json({ error: spendError.message }, { status: 400 })
    }

    const { error: unlockError } = await supabase
      .from('user_services')
      .upsert({ user_id: user.id, service_key, is_unlocked: true }, { onConflict: 'user_id,service_key' })

    if (unlockError) {
      return NextResponse.json({ error: unlockError.message }, { status: 400 })
    }

    if (column) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ [column]: true })
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile flag update error (wallet redeem):', profileError)
      }
    }

    await supabase.from('notifications').insert([
      {
        user_id: user.id,
        type: 'wallet',
        title: '🎉 Unlock Successful!',
        message: `You unlocked ${service_key} using your credits.`,
      },
    ])

    try {
      await updateUserTier(supabase, user.id)
    } catch (tierErr) {
      console.error('Tier update after redeem error:', tierErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Redeem wallet error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

