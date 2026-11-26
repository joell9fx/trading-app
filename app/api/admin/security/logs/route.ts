import { NextResponse } from 'next/server'
import { requireAdmin } from '../../auth'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

// GET /api/admin/security/logs - findings from security audit runs
export async function GET() {
  const { error: authError, ctx } = await requireAdmin()
  if (authError || !ctx) return authError

  const { data, error } = await ctx.supabase
    .from('security_audits')
    .select('id, category, issue, severity, recommendation, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return serverError(error, 'admin/security/logs', 400)
  }

  return NextResponse.json({ audits: data || [] })
}
