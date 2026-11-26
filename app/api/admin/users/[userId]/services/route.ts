import { NextRequest, NextResponse } from 'next/server'
import { accessColumnForService, deriveAccessFromProfile, AccessModuleKey } from '@/lib/access-flags'
import { requireAdmin } from '../../../auth'
import { updateUserTier } from '@/lib/tier-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin()
  if (auth.error) {
    return auth.error
  }
  const supabase = createAdminClient() // service role: cross-user write, caller already verified

  const { data, error } = await supabase
    .from('profiles')
    .select('has_signals_access, has_funding_access, has_courses_access, has_mentorship_access, has_ai_tools_access')
    .eq('id', params.userId)
    .single()

  if (error) {
    return serverError(error, 'admin/users/[userId]/services', 400)
  }

  return NextResponse.json({ access: deriveAccessFromProfile(data) })
}

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const auth = await requireAdmin()
  if (auth.error) {
    return auth.error
  }
  const supabase = createAdminClient() // service role: cross-user write, caller already verified

  const body = await parseBody(
    req,
    z.object({ service_key: z.string().trim().min(1).max(64), is_unlocked: z.boolean() }),
  )
  if (body.error) return body.error
  const { service_key, is_unlocked } = body.data

  const column = accessColumnForService(service_key as AccessModuleKey)
  if (!column && service_key !== 'community') {
    return NextResponse.json({ error: 'Unknown service_key' }, { status: 400 })
  }

  if (column) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ [column]: !!is_unlocked })
      .eq('id', params.userId)

    if (updateError) {
      return serverError(updateError, 'admin/users/[userId]/services', 400)
    }
  }

  if (service_key !== 'community') {
    // Keep legacy service record in sync for analytics and rewards
    const { error: legacyError } = await supabase
      .from('user_services')
      .upsert(
        { user_id: params.userId, service_key, is_unlocked: !!is_unlocked },
        { onConflict: 'user_id,service_key' }
      )

    if (legacyError) {
      console.error('Legacy service sync error (admin):', legacyError)
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('has_signals_access, has_funding_access, has_courses_access, has_mentorship_access, has_ai_tools_access')
    .eq('id', params.userId)
    .single()

  if (error) {
    return serverError(error, 'admin/users/[userId]/services', 400)
  }

  try {
    await updateUserTier(supabase, params.userId)
  } catch (tierErr) {
    console.error('Tier update error (admin toggle):', tierErr)
  }

  return NextResponse.json({ access: deriveAccessFromProfile(data) })
}
