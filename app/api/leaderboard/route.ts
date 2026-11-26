import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const metric = req.nextUrl.searchParams.get('metric') || 'xp'

  const { data, error } = await supabase.rpc('get_leaderboard_data', { metric })

  if (error) {
    return serverError(error, 'leaderboard', 400)
  }

  return NextResponse.json({ metric, entries: data || [] })
}

