import { NextRequest, NextResponse } from 'next/server'
import { requireServiceAccess } from '@/lib/api/require-service-access'
import { z } from 'zod'
import { parseBody, idSchema } from '@/lib/api/parse-body'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const access = await requireServiceAccess('signals')
  if (access.error) return access.error
  const { supabase, userId } = access.ctx

  try {
    const body = await parseBody(req, z.object({ journal_id: idSchema, reflection: z.string().trim().min(1).max(5000) }))
    if (body.error) return body.error
    const { journal_id, reflection } = body.data

    const { error } = await supabase.from('user_reflections').insert([
      {
        journal_id,
        user_id: userId,
        reflection,
      },
    ])

    if (error) {
      return serverError(error, 'mentor/journal/reflect', 400)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('reflect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

