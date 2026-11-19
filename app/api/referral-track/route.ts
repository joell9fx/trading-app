import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordReferral } from '@/lib/referrals/record-referral'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  referral_code: z.string().trim().min(1).max(64),
})

/**
 * Records who referred the signed-in user. A user can only set their own
 * referrer, only once, and never to themselves.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'referral_code is required' }, { status: 400 })
  }

  const result = await recordReferral(createAdminClient(), user.id, parsed.data.referral_code)
  if (result.status === 'error') {
    return NextResponse.json({ error: 'Could not record referral' }, { status: 500 })
  }
  return NextResponse.json({ success: true, already_referred: result.status === 'already_referred' })
}
