import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '../auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireOwner()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const { data, error } = await supabase.from('system_flags').select('key, value')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
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

  const { key, value } = payload
  if (!key) {
    return NextResponse.json({ error: 'key is required' }, { status: 400 })
  }

  const boolValue = `${value}` === 'true' || value === true

  const { error } = await supabase
    .from('system_flags')
    .upsert({ key, value: boolValue, updated_at: new Date().toISOString() })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'update_system_flag',
    module: 'superadmin-security',
    context: { key, value: boolValue },
  })

  return NextResponse.json({ success: true, flag: { key, value: boolValue } })
}

