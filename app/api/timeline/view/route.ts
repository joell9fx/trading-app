import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await supabase.rpc('increment_xp', { user_id: user.id, amount: 5, reason: 'Viewed Progress Timeline' })
  } catch (e) {
    // best effort
  }

  return NextResponse.json({ success: true })
}

