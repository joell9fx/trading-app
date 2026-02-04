import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '../auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireOwner()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_admin, is_owner, banned, has_ai_tools_access, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ users: data })
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

  const { user_id, field, value } = payload

  if (!user_id || !['is_admin', 'is_owner', 'banned'].includes(field)) {
    return NextResponse.json({ error: 'user_id and valid field are required' }, { status: 400 })
  }

  const nextValue = `${value}` === 'true' || value === true

  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('id, is_owner')
    .eq('id', user_id)
    .single()

  if (targetError || !targetProfile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Owner cannot be demoted or banned
  if (targetProfile.is_owner && (field === 'is_owner' ? nextValue === false : true)) {
    return NextResponse.json({ error: 'Owner account cannot be modified' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ [field]: nextValue })
    .eq('id', user_id)
    .select('id, email, full_name, role, is_admin, is_owner, banned, has_ai_tools_access, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: `set_${field}`,
    module: 'superadmin-users',
    context: { target: user_id, value: nextValue },
  })

  return NextResponse.json({ user: data })
}

