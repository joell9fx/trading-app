import { timingSafeEqual } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/app/api/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const INTERNAL_SECRET_HEADER = 'x-internal-secret'

/** Constant-time comparison of a provided secret against the expected one. */
export function secretMatches(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Gate for maintenance / reward routes that write across users.
 * Allowed callers:
 *  - server-to-server or cron, with `x-internal-secret: $SERVICE_WEBHOOK_SECRET`
 *  - a signed-in admin/owner
 * On success returns a service-role client (these routes write other users' rows).
 */
export async function requireAdminOrInternal(
  req: NextRequest,
): Promise<{ error?: NextResponse; supabase?: SupabaseClient; via?: 'internal' | 'admin' }> {
  if (secretMatches(req.headers.get(INTERNAL_SECRET_HEADER), process.env.SERVICE_WEBHOOK_SECRET)) {
    return { supabase: createAdminClient(), via: 'internal' }
  }

  const { error } = await requireAdmin()
  if (error) return { error }

  return { supabase: createAdminClient(), via: 'admin' }
}
