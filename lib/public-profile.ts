import type { SupabaseClient } from '@supabase/supabase-js'

export interface PublicProfileData {
  user: {
    id: string
    username: string | null
    bio: string | null
    avatar_url: string | null
    xp: number | null
    membership_tier: string | null
    badges: string[] | null
    created_at: string | null
  }
  badges: { badges: string[] }
  showcase: Array<{ id: string; title: string | null; caption: string | null; image_url: string | null; created_at: string }>
}

/**
 * Loads the public view of a member's profile.
 * Returns null when the profile doesn't exist or isn't public.
 * Throws when the database can't be reached, so callers show an error state
 * instead of a misleading "not found".
 * Never returns private data (email, mentor journal).
 */
export async function getPublicProfile(supabase: SupabaseClient, username: string): Promise<PublicProfileData | null> {
  const { data: user, error } = await supabase
    .from('profiles')
    .select('id, username, bio, avatar_url, xp, membership_tier, is_profile_public, badges, created_at')
    .eq('username', username)
    .maybeSingle()

  if (error) throw new Error(`Could not load profile: ${error.message}`)
  if (!user || user.is_profile_public === false) return null

  const { data: showcase } = await supabase
    .from('user_showcase_posts')
    .select('id, title, caption, image_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const { is_profile_public: _isPublic, ...publicUser } = user

  return {
    user: publicUser,
    badges: { badges: user.badges || [] },
    showcase: showcase || [],
  }
}
