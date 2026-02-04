import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { assertOwner } from '@/utils/auth'

export interface OwnerAuthContext {
  supabase: ReturnType<typeof createClient>
  user: any
  profile: any
}

const PROFILE_FIELDS = 'is_owner, banned, has_ai_tools_access'

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

export async function requireOwner(): Promise<{ error?: NextResponse; ctx?: OwnerAuthContext }> {
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
    is_owner: profile?.is_owner ?? false,
    banned: profile?.banned ?? false,
    has_ai_tools_access: profile?.has_ai_tools_access ?? false,
  }

  try {
    assertOwner(authUser)
  } catch (error) {
    return { error: authErrorResponse(error) }
  }

  return { ctx: { supabase, user, profile: { ...profile, id: user.id, ...authUser } } }
}

