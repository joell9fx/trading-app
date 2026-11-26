import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '../auth'
import { z } from 'zod'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v)
const AnnouncementSchema = z.object({
  title: z.preprocess(emptyToNull, z.string().trim().max(200).nullable()),
  message: z.string().trim().min(1).max(2000),
  // Stored as sent (datetime-local strings carry no zone), but must parse as a date.
  expires_at: z.preprocess(emptyToNull, z.string().max(40).refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date').nullable()),
})

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
    return serverError(error, 'superadmin/announcement', 400)
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

  const parsed = AnnouncementSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'message is required (max 2000 characters)' }, { status: 400 })
  }
  const { title, message, expires_at } = parsed.data

  const { data, error } = await supabase
    .from('announcements')
    .insert([{ title, message, expires_at }])
    .select()
    .single()

  if (error) {
    return serverError(error, 'superadmin/announcement', 400)
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'create_announcement',
    module: 'superadmin-announcements',
    context: { announcement_id: data.id },
  })

  return NextResponse.json({ announcement: data })
}

