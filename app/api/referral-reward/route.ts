import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminOrInternal } from '@/lib/api/internal-auth'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({ referred_user_id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const { error: authError, supabase } = await requireAdminOrInternal(req)
  if (authError || !supabase) return authError

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'referred_user_id (uuid) is required' }, { status: 400 })
  }
  const { referred_user_id } = parsed.data

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

