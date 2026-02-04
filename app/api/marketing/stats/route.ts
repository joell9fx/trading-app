import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = auth.user.id

  const { data: assets } = await supabase
    .from('marketing_assets')
    .select('id, asset_type, content, image_url, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const total = assets?.length || 0
  const byType: Record<string, number> = {}
  ;(assets || []).forEach((a) => {
    byType[a.asset_type] = (byType[a.asset_type] || 0) + 1
  })

  return NextResponse.json({
    total,
    byType,
    recent: assets || [],
  })
}

