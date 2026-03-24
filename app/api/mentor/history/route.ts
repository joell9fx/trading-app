import { NextRequest, NextResponse } from 'next/server'
import { requireServiceAccess } from '@/lib/api/require-service-access'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const access = await requireServiceAccess('signals')
  if (access.error) return access.error
  const { supabase, userId } = access.ctx

  const { searchParams } = new URL(req.url)
  const requested = searchParams.get('user_id')
  if (requested && requested !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const targetUser = userId

  const { data, error } = await supabase
    .from('mentor_chats')
    .select('message, role, created_at')
    .eq('user_id', targetUser)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data || [])
}

