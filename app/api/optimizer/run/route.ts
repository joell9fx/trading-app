import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// @ts-ignore openai types resolution handled at runtime
import OpenAI from 'openai'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createClient()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey })

  const { data: campaigns, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('status', 'active')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  for (const c of campaigns || []) {
    try {
      const ai = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: `
You are an AI marketing analyst optimizing ad campaigns.
Analyze spend, clicks, conversions, and ROI.
Identify reasons for performance changes.
Suggest one adjustment for each: ad copy, targeting, and budget.
Output JSON with keys: recommendation, adjustment, expected_roi.`,
          },
          {
            role: 'user',
            content: `Campaign data: ${JSON.stringify({
              platform: c.platform,
              spend: c.spend,
              revenue: c.revenue,
              roi: c.roi,
              clicks: c.clicks,
              conversions: c.conversions,
              ad_copy: c.ad_copy,
              targeting: c.targeting,
              budget: c.budget,
            })}`,
          },
        ],
      })

      const raw = ai.choices[0]?.message?.content || '{}'
      let result: any = {}
      try {
        result = JSON.parse(raw)
      } catch {
        result = { recommendation: raw, adjustment: 'review manually', expected_roi: c.roi }
      }

      const newRoi = Number(result.expected_roi ?? c.roi ?? 0)
      const adjustmentText = result.adjustment || ''

      // Optional auto budget tweak
      if (adjustmentText && c.budget) {
        if (adjustmentText.toLowerCase().includes('increase budget')) {
          const newBudget = Number(c.budget) * 1.1
          await supabase.from('ad_campaigns').update({ budget: newBudget }).eq('id', c.id)
        } else if (adjustmentText.toLowerCase().includes('reduce budget')) {
          const newBudget = Number(c.budget) * 0.9
          await supabase.from('ad_campaigns').update({ budget: newBudget }).eq('id', c.id)
        }
      }

      await supabase
        .from('optimization_logs')
        .insert([
          {
            campaign_id: c.id,
            old_roi: c.roi,
            new_roi: newRoi,
            recommendation: result.recommendation || '',
            adjustment: adjustmentText,
          },
        ])

      await supabase.from('ad_campaigns').update({ roi: newRoi }).eq('id', c.id)

      if (c.user_id) {
        await addXP(supabase, c.user_id, 15, 'Campaign Optimization')
        if (newRoi - (c.roi || 0) > 25) {
          await addXP(supabase, c.user_id, 50, 'High ROI Improvement')
        }
        await assignBadges(supabase, c.user_id)
      }
    } catch (err) {
      console.error('optimizer error for campaign', c.id, err)
      continue
    }
  }

  return NextResponse.json({ message: 'Optimization run completed' })
}

