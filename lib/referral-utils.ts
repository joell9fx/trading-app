import { SupabaseClient } from '@supabase/supabase-js'
import { MembershipTier, computeTier } from './tier-utils'

export async function handleReferralReward(
  supabase: SupabaseClient,
  referrerId: string,
  referredId: string,
  eventType: 'signup' | 'purchase'
) {
  if (eventType === 'signup') {
    await supabase.from('referral_rewards').insert([{ user_id: referrerId, reward_type: 'credit', amount: 1 }])
  }

  if (eventType === 'purchase') {
    await supabase.from('referral_rewards').insert([{ user_id: referrerId, reward_type: 'discount', amount: 10 }])
    await supabase.from('referrals').update({ reward_status: 'completed' }).eq('referrer_id', referrerId).eq('referred_id', referredId)
  }

  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', referrerId)
    .eq('reward_status', 'completed')

  // Tier bumps based on completed referrals
  if ((count || 0) >= 10) {
    await supabase.from('profiles').update({ membership_tier: 'Elite' as MembershipTier }).eq('id', referrerId)
  } else if ((count || 0) >= 5) {
    await supabase.from('profiles').update({ membership_tier: 'Premium' as MembershipTier }).eq('id', referrerId)
  }

  await supabase.from('notifications').insert([
    {
      user_id: referrerId,
      type: 'referral',
      title: eventType === 'signup' ? '🎉 New Referral Joined!' : '💰 Referral Purchase Reward',
      message:
        eventType === 'signup'
          ? `A friend joined using your link.`
          : `Your referral made a purchase. You earned a reward.`,
    },
  ])
}

export function buildReferralCode(id: string) {
  return id?.slice(0, 8)
}

export function buildReferralLink(code: string) {
  const domain = process.env.DOMAIN_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
  return `${domain || ''}/signup?ref=${code}`
}

