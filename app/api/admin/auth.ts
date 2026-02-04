import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/utils/auth'

export interface AdminAuthContext {
  supabase: ReturnType<typeof createClient>
  user: any
  profile: any
}

const PROFILE_FIELDS = 'role, is_admin, is_owner, banned, has_ai_tools_access'

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unauthorized'
  const status =
    message === 'Unauthorized'
      ? 401
      : message === 'Banned' || message === 'Forbidden'
        ? 403
        : 500

  return NextResponse.json({ error: message }, { status })
}

export async function requireAdmin(): Promise<{ error?: NextResponse; ctx?: AdminAuthContext }> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', user.id)
    .single()

  const authUser = {
    role: profile?.role || 'MEMBER',
    is_admin: profile?.is_admin ?? false,
    is_owner: profile?.is_owner ?? false,
    banned: profile?.banned ?? false,
    has_ai_tools_access: profile?.has_ai_tools_access ?? false,
  }

  try {
    assertAdmin(authUser)
  } catch (error) {
    return { error: authErrorResponse(error) }
  }

  return { ctx: { supabase, user, profile: { ...profile, id: user.id, ...authUser } } }
}

