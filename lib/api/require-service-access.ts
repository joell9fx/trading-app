import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ACCESS_DEFAULTS, type AccessModuleKey } from '@/lib/access-flags'

type AccessContext = {
  supabase: ReturnType<typeof createClient>
  userId: string
}

type AccessResult = { error: NextResponse; ctx?: undefined } | { error?: undefined; ctx: AccessContext }

export async function requireServiceAccess(serviceKey: AccessModuleKey): Promise<AccessResult> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (ACCESS_DEFAULTS[serviceKey]) {
    return { ctx: { supabase, userId: user.id } }
  }

  const [profileRes, serviceRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, is_owner, has_signals_access, has_funding_access, has_courses_access, has_mentorship_access')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('user_services')
      .select('is_unlocked')
      .eq('user_id', user.id)
      .eq('service_key', serviceKey)
      .eq('is_unlocked', true)
      .maybeSingle(),
  ])

  const role = (profileRes.data?.role || '').toString().toLowerCase()
  const isAdmin = role === 'admin' || role === 'owner' || profileRes.data?.is_owner === true
  if (isAdmin) {
    return { ctx: { supabase, userId: user.id } }
  }

  const hasSignalFlag =
    serviceKey === 'signals' && profileRes.data?.has_signals_access === true
  const hasService = serviceRes.data?.is_unlocked === true || hasSignalFlag

  if (!hasService) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ctx: { supabase, userId: user.id } }
}
