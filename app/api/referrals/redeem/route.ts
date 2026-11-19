import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseBody, idSchema } from '@/lib/api/parse-body'

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

    const body = await parseBody(req, z.object({ reward_id: idSchema }))
    if (body.error) return body.error
    const { reward_id } = body.data

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

