import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../auth'
import { z } from 'zod'
import { parseBody, idSchema } from '@/lib/api/parse-body'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const body = await parseBody(
    req,
    z.object({ id: idSchema, action: z.enum(['approve', 'dismiss', 'execute']) }),
  )
  if (body.error) return body.error
  const { id, action } = body.data

  let status = 'pending'
  if (action === 'approve') status = 'approved'
  if (action === 'dismiss') status = 'dismissed'
  if (action === 'execute') status = 'executed'

  const update: Record<string, any> = { status }
  if (status === 'executed') {
    update.executed_at = new Date().toISOString()
  }

  const { error } = await supabase.from('business_actions').update(update).eq('id', id)
  if (error) {
    return serverError(error, 'admin/operator/execute', 400)
  }

  return NextResponse.json({ message: 'Updated' })
}

