import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '../auth'

export const dynamic = 'force-dynamic'

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
})

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const { data, error } = await supabase
    .from('verifications')
    .select(
      `
        id,
        user_id,
        status,
        reviewer_id,
        created_at,
        updated_at,
        user:profiles!verifications_user_id_fkey (
          id,
          email,
          full_name,
          has_ai_tools_access
        ),
        reviewer:profiles!verifications_reviewer_id_fkey (
          id,
          email,
          full_name
        )
      `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ verifications: data || [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase, user } = auth.ctx!

  const body = await request.json().catch(() => ({}))
  const parsed = upsertSchema.safeParse(body)

  if (!parsed.success) {
    return badRequest('Invalid payload')
  }

  const { id, user_id, status } = parsed.data
  const now = new Date().toISOString()

  const upsertData = {
    user_id,
    status,
    reviewer_id: user.id,
    updated_at: now,
  }

  const query = id
    ? supabase.from('verifications').update(upsertData).eq('id', id)
    : supabase.from('verifications').upsert({ ...upsertData, created_at: now }, { onConflict: 'user_id' })

  const { data, error } = await query.select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: `verification_${status}`,
    module: 'verification',
    context: { verification_id: data?.id, target_user: user_id, status },
  })

  return NextResponse.json({ verification: data }, { status: id ? 200 : 201 })
}

export const PATCH = POST

