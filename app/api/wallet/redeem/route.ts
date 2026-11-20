import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateUserTier } from '@/lib/tier-utils'
import { accessColumnForService, type AccessModuleKey } from '@/lib/access-flags'
import { ALL_SERVICES } from '@/lib/services-list'
import { updateDerivedProfileFields } from '@/lib/privileged-profile'

// Credit prices are owned by the server; the client-sent cost is ignored.
const CREDIT_COST: Record<string, number> = Object.fromEntries(
  ALL_SERVICES.map((s) => [s.key, s.credit_cost]),
)

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

    const body = await req.json().catch(() => null)
    const service_key: unknown = body?.service_key
    const cost = typeof service_key === 'string' ? CREDIT_COST[service_key] : undefined
    if (typeof service_key !== 'string' || typeof cost !== 'number' || cost <= 0) {
      return NextResponse.json({ error: 'Unknown or non-redeemable service_key' }, { status: 400 })
    }

    const column = accessColumnForService(service_key as AccessModuleKey)
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
      const { error: profileError } = await updateDerivedProfileFields(supabase, user.id, { [column]: true })

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

