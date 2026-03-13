'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { SignInForm } from '@/components/auth/signin-form'
import { getSafeRedirectPath } from '@/lib/utils'

const SESSION_CHECK_MS = 2000

export interface SignInContentProps {
  initialRedirectTo?: string | null
}

/**
 * Renders the sign-in form immediately so the page never blocks on a spinner.
 * Session check runs in the background; if user is already logged in, redirect.
 * All paths (success, error, timeout) are handled so we never hang.
 */
export function SignInContent({ initialRedirectTo }: SignInContentProps) {
  const router = useRouter()
  const [sessionCheckError, setSessionCheckError] = useState<string | null>(null)
  const redirectDone = useRef(false)

  useEffect(() => {
    if (redirectDone.current) return

    let cancelled = false

    const runSessionCheck = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((_, reject) =>
            setTimeout(() => reject(new Error('Session check timeout')), SESSION_CHECK_MS)
          ),
        ])
        if (cancelled || redirectDone.current) return
        if (data?.session?.user) {
          redirectDone.current = true
          const target = getSafeRedirectPath(initialRedirectTo ?? null)
          router.replace(target)
        }
      } catch (err) {
        if (cancelled || redirectDone.current) return
        setSessionCheckError(err instanceof Error ? err.message : 'Session check failed')
      }
    }

    runSessionCheck()
    return () => {
      cancelled = true
    }
  }, [initialRedirectTo, router])

  return (
    <>
      {sessionCheckError && (
        <div className="mb-4 rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-200">
          Could not verify session. You can still sign in below.
        </div>
      )}
      <SignInForm initialRedirectTo={initialRedirectTo} />
    </>
  )
}
