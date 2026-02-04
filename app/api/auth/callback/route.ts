import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Sync Supabase auth session cookies for server-side/middleware usage.
 * Called from client `onAuthStateChange`.
 */
export async function POST(request: Request) {
  const { event, session } = await request.json()

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

  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })

  return NextResponse.json({ success: true })
}
