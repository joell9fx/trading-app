import { NextRequest, NextResponse } from 'next/server'
import { requireServiceAccess } from '@/lib/api/require-service-access'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const access = await requireServiceAccess('signals')
  if (access.error) return access.error
  const { supabase, userId } = access.ctx

  const { data, error } = await supabase
    .from('mentor_journal')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })

  if (error) {
    return serverError(error, 'mentor/journal/list', 400)
  }

  return NextResponse.json({ entries: data || [] })
}

