import { SupabaseClient } from '@supabase/supabase-js'
import { addXP } from './xp-utils'

const XP_MAP: Record<string, number> = {
  message: 2,
  reaction: 3,
  trade_post: 10,
  reply: 5,
  mention: 2,
}

async function canAwardMessageXP(supabase: SupabaseClient, userId: string) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('community_activity')
    .select('id')
    .eq('user_id', userId)
    .eq('action_type', 'message')
    .gte('created_at', fiveMinutesAgo)
    .limit(1)
  if (error) return false
  return !data || data.length === 0
}

export async function handleCommunityXP(
  supabase: SupabaseClient,
  userId: string,
  action_type: 'message' | 'reaction' | 'trade_post' | 'reply' | 'mention',
  multiplier = 1,
  skipAntiSpam = false
) {
  const base = XP_MAP[action_type] || 0
  const amount = base * multiplier
  if (amount <= 0) return

  if (action_type === 'message' && !skipAntiSpam) {
    const allowed = await canAwardMessageXP(supabase, userId)
    if (!allowed) return
  }

  await addXP(supabase, userId, amount, action_type)
  await supabase
    .from('community_activity')
    .insert([{ user_id: userId, action_type, xp_earned: amount }])
}

