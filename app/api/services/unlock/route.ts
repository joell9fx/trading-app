import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateUserTier } from '@/lib/tier-utils'
import { addXP } from '@/lib/xp-utils'
import { accessColumnForService } from '@/lib/access-flags'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Unlock auth error:', authError)
      return NextResponse.json({ error: 'Unable to verify session' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { service_key } = await req.json()

    if (!service_key) {
      return NextResponse.json({ error: 'service_key is required' }, { status: 400 })
    }

    const column = accessColumnForService(service_key)
    if (!column && service_key !== 'community') {
      return NextResponse.json({ error: 'Unknown service_key' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_services')
      .upsert({ user_id: user.id, service_key, is_unlocked: true }, { onConflict: 'user_id,service_key' })
      .select()
      .single()

    if (error) {
      console.error('Unlock upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (column) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ [column]: true })
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile flag update error:', profileError)
      }
    }

    try {
      await addXP(supabase, user.id, 30, 'unlocking a service')
    } catch (xpErr) {
      console.error('XP add error (unlock):', xpErr)
    }

    let tier: string | null = null
    try {
      tier = await updateUserTier(supabase, user.id)
    } catch (tierErr) {
      console.error('Tier update error:', tierErr)
    }

    return NextResponse.json({ success: true, service: data, tier })
  } catch (error) {
    console.error('Unlock API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

