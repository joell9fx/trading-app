import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP } from '@/lib/xp-utils'
import { requireServiceAccess } from '@/lib/api/require-service-access'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const access = await requireServiceAccess('signals')
  if (access.error) return access.error

  const supabase = createClient()

  try {
    await addXP(supabase, access.ctx.userId, 3, 'reviewing trade replay')
  } catch (error) {
    console.error('Replay XP error:', error)
  }

  return NextResponse.json({ success: true })
}

