import { NextResponse } from 'next/server'
import { requireAdmin } from '../../auth'
// @ts-ignore openai types resolved at runtime
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

type GrowthProjection = { '7d': number; '30d': number; '90d': number }

function forecastLinear(current: number, factor: number): GrowthProjection {
  return {
    '7d': Math.round(current * Math.pow(factor, 0.25)),
    '30d': Math.round(current * factor),
    '90d': Math.round(current * Math.pow(factor, 3)),
  }
}

export async function POST() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey })

  // Collect key metrics (lightweight aggregation)
  const [usersRes, referralsRes, campaignsRes, payoutsRes] = await Promise.all([
    supabase.from('profiles').select('id, xp', { count: 'exact' }),
    supabase.from('referrals').select('status', { count: 'exact' }),
    supabase.from('ad_campaigns').select('spend, revenue, roi', { count: 'exact' }),
    supabase.from('affiliate_payouts').select('amount, status', { count: 'exact' }),
  ])

  const usersTotal = usersRes.count || 0
  const totalXp = (usersRes.data || []).reduce((s, u: any) => s + Number(u.xp || 0), 0)
  const avgXp = usersTotal > 0 ? totalXp / usersTotal : 0

  const referralCount = referralsRes.count || 0
  const referralConversions = (referralsRes.data || []).filter((r: any) => r.status === 'converted').length

  const totalRevenue = (campaignsRes.data || []).reduce((s, c: any) => s + Number(c.revenue || 0), 0)
  const totalSpend = (campaignsRes.data || []).reduce((s, c: any) => s + Number(c.spend || 0), 0)
  const avgRoi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0

  const payoutPending = (payoutsRes.data || []).filter((p: any) => p.status === 'pending')
  const payoutPaid = (payoutsRes.data || []).filter((p: any) => p.status === 'paid')

  const overview = {
    users: { total: usersTotal, avgXp },
    referrals: { total: referralCount, conversions: referralConversions },
    payouts: {
      pendingAmount: payoutPending.reduce((s, p: any) => s + Number(p.amount || 0), 0),
      paidAmount: payoutPaid.reduce((s, p: any) => s + Number(p.amount || 0), 0),
    },
    campaigns: { totalRevenue, totalSpend, avgRoi },
  }

  const forecast = {
    usersGrowth: forecastLinear(usersTotal || 1, 1.08),
    revenueGrowth: forecastLinear(totalRevenue || 1, 1.12),
    roiProjection: forecastLinear(avgRoi || 1, 1.05),
    referralsGrowth: forecastLinear(referralCount || 1, 1.06),
  }

  const ai = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    messages: [
      {
        role: 'system',
        content: `
You are the digital COO of VisionEdge FX.
Analyze business health using metrics and forecasts.
Output JSON:
{
  "summary": "text overview",
  "actions": [
    { "category": "marketing|community|trading|affiliate|ads", "recommendation": "string", "impact": "high|medium|low", "auto_executable": false }
  ]
}`,
      },
      { role: 'user', content: JSON.stringify({ overview, forecast }) },
    ],
    max_tokens: 400,
  })

  const raw = ai.choices[0]?.message?.content || '{}'
  let parsed: any = {}
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { summary: raw, actions: [] }
  }

  const actions = Array.isArray(parsed.actions) ? parsed.actions : []
  for (const act of actions) {
    await supabase.from('business_actions').insert({
      category: act.category || 'general',
      recommendation: act.recommendation || '',
      impact: act.impact || 'medium',
      auto_executable: !!act.auto_executable,
    })
  }

  return NextResponse.json({
    summary: parsed.summary || '',
    actions,
  })
}

