import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { isSameOriginRequest } from '@/lib/api/same-origin'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordReferral } from '@/lib/referrals/record-referral'

const BodySchema = z.object({
  event: z.string().max(64),
  session: z
    .object({
      access_token: z.string().min(1).max(8192),
      refresh_token: z.string().min(1).max(1024),
    })
    .passthrough()
    .nullable()
    .optional(),
})

/**
 * Sync Supabase auth session cookies for server-side/middleware usage.
 * Called from client `onAuthStateChange`.
 *
 * Same-origin only: otherwise another site could post its own tokens and
 * silently sign a visitor into the attacker's account (login CSRF).
 * `setSession` verifies the tokens with Supabase before cookies are written.
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { event, session } = parsed.data

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore in server components
          }
        },
      },
    }
  )

  if (event === 'SIGNED_OUT' || !session) {
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Users who sign up with email confirmation have no session at signup time,
  // so their referral code waits in user metadata until the first sign-in.
  const pendingCode = data.user.user_metadata?.referral_code_used
  if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && typeof pendingCode === 'string' && pendingCode) {
    try {
      await recordReferral(createAdminClient(), data.user.id, pendingCode)
    } catch (err) {
      console.error('[auth/callback] pending referral failed:', err)
    }
  }

  return NextResponse.json({ success: true })
}
