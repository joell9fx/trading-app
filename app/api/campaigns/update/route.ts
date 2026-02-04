import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { campaign_id, spend, clicks, conversions, revenue, status } = body

  if (!campaign_id) {
    return NextResponse.json({ error: 'Missing campaign_id' }, { status: 400 })
  }

  const fields: Record<string, any> = {}
  if (spend !== undefined) fields.spend = spend
  if (clicks !== undefined) fields.clicks = clicks
  if (conversions !== undefined) fields.conversions = conversions
  if (revenue !== undefined) fields.revenue = revenue
  if (status) fields.status = status
  fields.updated_at = new Date().toISOString()

  const { error: updError } = await supabase.from('ad_campaigns').update(fields).eq('id', campaign_id).eq('user_id', auth.user.id)
  if (updError) {
    return NextResponse.json({ error: updError.message }, { status: 400 })
  }

  // Recompute ROI
  await supabase.rpc('update_campaign_roi')

  // Fetch updated campaign for XP logic
  const { data: campaign } = await supabase.from('ad_campaigns').select('*').eq('id', campaign_id).single()

  if (campaign) {
    if ((campaign.conversions || 0) > 0) {
      await addXP(supabase, auth.user.id, 5, 'Ad Conversions')
    }
    if ((campaign.roi || 0) > 50) {
      await addXP(supabase, auth.user.id, 50, 'High ROI Campaign')
    }
  }

  await assignBadges(supabase, auth.user.id)

  return NextResponse.json({ message: 'Campaign updated' })
}

