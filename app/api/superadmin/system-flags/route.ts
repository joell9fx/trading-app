import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '../auth'
import { z } from 'zod'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireOwner()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const { data, error } = await supabase.from('system_flags').select('key, value')
  if (error) {
    return serverError(error, 'superadmin/system-flags', 400)
  }

  return NextResponse.json({ flags: data })
}

export async function POST(req: NextRequest) {
  const auth = await requireOwner()
  if (auth.error) return auth.error
  const { supabase, user } = auth.ctx!

  let payload: any
  try {
    payload = await req.json()
  } catch {
    const form = await req.formData()
    payload = Object.fromEntries(form.entries())
  }

  const parsed = z
    .object({
      key: z.string().trim().regex(/^[a-z0-9_.-]{1,64}$/i, 'Invalid key'),
      value: z.union([z.boolean(), z.enum(['true', 'false'])]).transform((v) => v === true || v === 'true').optional().default(false),
    })
    .safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'key is required' }, { status: 400 })
  }
  const { key, value: boolValue } = parsed.data

  const { error } = await supabase
    .from('system_flags')
    .upsert({ key, value: boolValue, updated_at: new Date().toISOString() })

  if (error) {
    return serverError(error, 'superadmin/system-flags', 400)
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'update_system_flag',
    module: 'superadmin-security',
    context: { key, value: boolValue },
  })

  return NextResponse.json({ success: true, flag: { key, value: boolValue } })
}

