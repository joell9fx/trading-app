import type { SupabaseClient } from '@supabase/supabase-js'

export type RecordReferralResult =
  | { status: 'recorded' }
  | { status: 'already_referred' }
  | { status: 'ignored' }
  | { status: 'error' }

/**
 * Records that `userId` was referred by the owner of `referralCode`.
 * Must be called with a service-role client, and only for the signed-in user.
 * A user can only be referred once, and never by themselves.
 */
export async function recordReferral(
  admin: SupabaseClient,
  userId: string,
  referralCode: string,
): Promise<RecordReferralResult> {
  const code = referralCode.trim()
  if (!code || code.length > 64) return { status: 'ignored' }

  const { data: me } = await admin.from('profiles').select('id, referred_by').eq('id', userId).maybeSingle()
  if (!me) return { status: 'ignored' }
  if (me.referred_by) return { status: 'already_referred' }

  const { data: referrer } = await admin.from('profiles').select('id').eq('referral_code', code).maybeSingle()
  if (!referrer || referrer.id === userId) return { status: 'ignored' }

  const { data: existing } = await admin
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrer.id)
    .eq('referred_user_id', userId)
    .maybeSingle()

  if (!existing) {
    const { error } = await admin
      .from('referrals')
      .insert([{ referrer_id: referrer.id, referred_user_id: userId, referral_code: code }])
    if (error) {
      console.error('[recordReferral] insert error:', error)
      return { status: 'error' }
    }
  }

  await admin.from('profiles').update({ referred_by: code }).eq('id', userId).is('referred_by', null)

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

  return { status: 'recorded' }
}
