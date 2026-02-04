import { SupabaseClient } from '@supabase/supabase-js'
import { assignBadges } from './badges'

export async function addXP(supabase: SupabaseClient, userId: string, amount: number, reason: string) {
  await supabase.rpc('increment_xp', { user_id: userId, amount, reason })
  try {
    await assignBadges(supabase, userId)
  } catch (e) {
    // best-effort
  }
}

