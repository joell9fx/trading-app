import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/api/admin/auth'

export const dynamic = 'force-dynamic'

// GET /api/optimizer/logs - recent campaign optimisation runs (admin only)
export async function GET() {
  const { error: authError, ctx } = await requireAdmin()
  if (authError || !ctx) return authError

  const { data, error } = await ctx.supabase
    .from('optimization_logs')
    .select('id, campaign_id, old_roi, new_roi, recommendation, adjustment, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ logs: data || [] })
}
