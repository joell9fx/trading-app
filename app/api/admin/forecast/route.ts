import { NextResponse } from 'next/server'
import { requireAdmin } from '../auth'
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

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey })

  const overviewRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/overview`, {
    cache: 'no-store',
  })
  if (!overviewRes.ok) {
    return NextResponse.json({ error: 'Overview fetch failed' }, { status: 500 })
  }
  const overview = await overviewRes.json()

  const usersCurrent = Number(overview.users?.total || 0)
  const revenueCurrent = Number(overview.campaigns?.totalRevenue || 0)
  const roiCurrent = Number(overview.campaigns?.avgRoi || 0)
  const referralsCurrent = Number(overview.referrals?.total || 0)

  const usersGrowth = forecastLinear(usersCurrent, 1.08)
  const revenueGrowth = forecastLinear(revenueCurrent || 1, 1.12)
  const roiProjection = forecastLinear(roiCurrent || 1, 1.05)
  const referralsGrowth = forecastLinear(referralsCurrent || 1, 1.06)

  const ai = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `
You are an AI data analyst for VisionEdge FX.
Create a concise forecast for next 7, 30, 90 days.
Base predictions on user growth, ad ROI, revenue, and referrals.
Tone: confident, data-driven, strategic.
Provide 3 short recommendations.`,
      },
      {
        role: 'user',
        content: JSON.stringify({ overview, usersGrowth, revenueGrowth, roiProjection, referralsGrowth }),
      },
    ],
    max_tokens: 260,
  })

  const summary = ai.choices[0]?.message?.content || ''

  return NextResponse.json({
    forecast: { usersGrowth, revenueGrowth, roiProjection, referralsGrowth },
    summary,
  })
}

