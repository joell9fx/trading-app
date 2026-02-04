import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const { id, action } = await req.json()
  if (!id || !action) {
    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
  }

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
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Updated' })
}

