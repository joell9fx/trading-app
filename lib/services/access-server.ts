import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export type ServiceAccessResult = {
  hasAccess: boolean
  userId?: string
}

export async function checkServiceAccess(serviceKey: string): Promise<ServiceAccessResult> {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role env vars are not set')
  }

  const cookieStore = cookies()
  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { hasAccess: false }
  }

  const { data, error } = await supabase
    .from('user_services')
    .select('is_unlocked')
    .eq('user_id', user.id)
    .eq('service_key', serviceKey)
    .eq('is_unlocked', true)
    .maybeSingle()

  if (error) {
    console.error('checkServiceAccess error', error)
    return { hasAccess: false, userId: user.id }
  }

  return { hasAccess: !!data?.is_unlocked, userId: user.id }
}
