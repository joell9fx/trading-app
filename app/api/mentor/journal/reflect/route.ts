import { NextRequest, NextResponse } from 'next/server'
import { requireServiceAccess } from '@/lib/api/require-service-access'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const access = await requireServiceAccess('signals')
  if (access.error) return access.error
  const { supabase, userId } = access.ctx

  try {
    const { journal_id, reflection } = await req.json()
    if (!journal_id || !reflection) {
      return NextResponse.json({ error: 'journal_id and reflection are required' }, { status: 400 })
    }

    const { error } = await supabase.from('user_reflections').insert([
      {
        journal_id,
        user_id: userId,
        reflection,
      },
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('reflect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

