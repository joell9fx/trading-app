import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  referral_code: z.string().trim().min(1).max(64),
})

/**
 * Records who referred the signed-in user. A user can only set their own
 * referrer, only once, and never to themselves.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'referral_code is required' }, { status: 400 })
  }
  const { referral_code } = parsed.data

  const admin = createAdminClient()

  const { data: me } = await admin.from('profiles').select('id, referred_by').eq('id', user.id).single()
  if (me?.referred_by) {
    return NextResponse.json({ success: true, already_referred: true })
  }

  const { data: referrer } = await admin
    .from('profiles')
    .select('id')
    .eq('referral_code', referral_code)
    .maybeSingle()

  // Ignore unknown codes and self-referrals silently
  if (!referrer || referrer.id === user.id) {
    return NextResponse.json({ success: true })
  }

  const { data: existing } = await admin
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrer.id)
    .eq('referred_user_id', user.id)
    .maybeSingle()

  if (!existing) {
    const { error: insertError } = await admin
      .from('referrals')
      .insert([{ referrer_id: referrer.id, referred_user_id: user.id, referral_code }])
    if (insertError) {
      console.error('[referral-track] insert error:', insertError)
      return NextResponse.json({ error: 'Could not record referral' }, { status: 500 })
    }
  }

  await admin.from('profiles').update({ referred_by: referral_code }).eq('id', user.id).is('referred_by', null)

  if (!existing) {
    await admin.from('notifications').insert([
      {
        user_id: referrer.id,
        type: 'referral',
        title: '🎉 New Referral Joined!',
        message: 'Someone joined using your referral link.',
      },
    ])
  }

  return NextResponse.json({ success: true })
}
