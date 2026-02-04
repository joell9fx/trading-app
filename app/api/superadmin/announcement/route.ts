import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '../auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireOwner()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ announcements: data })
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

  const title = payload.title || null
  const message = payload.message || null
  const expires_at = payload.expires_at || null

  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('announcements')
    .insert([{ title, message, expires_at }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'create_announcement',
    module: 'superadmin-announcements',
    context: { announcement_id: data.id },
  })

  return NextResponse.json({ announcement: data })
}

