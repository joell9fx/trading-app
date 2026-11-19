import { NextResponse } from 'next/server'
import { requireAdmin } from '../../auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/operator/logs - recommended business actions from the AI operator
export async function GET() {
  const { error: authError, ctx } = await requireAdmin()
  if (authError || !ctx) return authError

  const { data, error } = await ctx.supabase
    .from('business_actions')
    .select('id, category, recommendation, impact, status, auto_executable, created_at, executed_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ actions: data || [] })
}
