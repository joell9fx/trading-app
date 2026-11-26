import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Write server-derived profile columns (membership_tier, badges, ...).
 *
 * Migration 046 stops members from changing privileged profile columns
 * themselves, so values the server computes from trusted data are written
 * with the service role. Falls back to the caller's client when the service
 * role isn't configured (e.g. local dev without the key).
 *
 * Only call this with values computed on the server, never with user input.
 */
export async function updateDerivedProfileFields(
  fallback: SupabaseClient,
  userId: string,
  values: Record<string, unknown>,
) {
  let client: SupabaseClient = fallback
  try {
    client = createAdminClient()
  } catch {
    // service role not configured; RLS + 046 guard will decide
  }
  return client.from('profiles').update(values).eq('id', userId)
}
