import { SupabaseClient } from '@supabase/supabase-js'
import { AccessModuleKey, countUnlocked, deriveAccessFromProfile } from './access-flags'

export type MembershipTier = 'Standard' | 'Premium' | 'Elite'

export function computeTier(unlockedCount: number): MembershipTier {
  if (unlockedCount >= 4) return 'Elite'
  if (unlockedCount >= 2) return 'Premium'
  return 'Standard'
}

export async function updateUserTier(supabase: SupabaseClient, userId: string) {
  const [profileResult, servicesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'membership_tier, has_signals_access, has_funding_access, has_courses_access, has_mentorship_access, has_ai_tools_access'
      )
      .eq('id', userId)
      .single(),
    supabase
      .from('user_services')
      .select('service_key, is_unlocked')
      .eq('user_id', userId)
      .eq('is_unlocked', true),
  ])

  if (servicesResult.error) throw servicesResult.error
  if (profileResult.error) {
    console.error('Profile load error during tier update:', profileResult.error)
  }

  const access = deriveAccessFromProfile(profileResult.data || {})
  servicesResult.data?.forEach((row) => {
    const key = row.service_key as AccessModuleKey
    access[key] = access[key] || !!row.is_unlocked
  })

  const unlockedCount = countUnlocked(access)
  const tier = computeTier(unlockedCount)

  const previous_tier = (profileResult.data?.membership_tier as MembershipTier | null) || 'Standard'

  await supabase.from('profiles').update({ membership_tier: tier }).eq('id', userId)

  await supabase.from('membership_history').insert([
    { user_id: userId, previous_tier, new_tier: tier },
  ])

  if (previous_tier !== tier) {
    await supabase.from('notifications').insert([
      {
        user_id: userId,
        type: 'tier_upgrade',
        title: `🎉 You've reached ${tier} Tier!`,
        message: `Enjoy your new perks and rewards as a ${tier} member.`,
      },
    ])
  }

  return tier
}

