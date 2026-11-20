import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../auth'
import { updateUserTier } from '@/lib/tier-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'

export const dynamic = 'force-dynamic'

const TierSchema = z.object({ tier: z.enum(['Standard', 'Premium', 'Elite']) })

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const auth = await requireAdmin()
  if (auth.error) {
    return auth.error
  }
  const supabase = createAdminClient() // service role: cross-user write, caller already verified

  const body = await parseBody(req, TierSchema)
  if (body.error) return body.error
  const { tier } = body.data

  const { error } = await supabase.from('profiles').update({ membership_tier: tier }).eq('id', params.userId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('membership_history').insert([
    { user_id: params.userId, previous_tier: 'manual', new_tier: tier },
  ])

  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const auth = await requireAdmin()
  if (auth.error) {
    return auth.error
  }
  const supabase = createAdminClient() // service role: cross-user write, caller already verified
  try {
    const tier = await updateUserTier(supabase, params.userId)
    return NextResponse.json({ tier })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Tier update failed' }, { status: 400 })
  }
}

