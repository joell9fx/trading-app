import { NextResponse } from 'next/server'
import { requireAdmin } from '../auth'
import { getLaunchReadinessSnapshot } from '@/lib/admin/launch-readiness-snapshot'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const snapshot = await getLaunchReadinessSnapshot(supabase)

  return NextResponse.json(snapshot)
}
