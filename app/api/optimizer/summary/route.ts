import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey })

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('optimization_logs')
    .select('campaign_id, old_roi, new_roi, recommendation, adjustment, created_at')
    .gte('created_at', since)
    .in(
      'campaign_id',
      supabase
        .from('ad_campaigns')
        .select('id')
        .eq('user_id', auth.user.id) as any
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const logs = data || []

  const ai = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Summarize campaign performance trends in a motivational, concise style.' },
      { role: 'user', content: JSON.stringify(logs) },
    ],
    temperature: 0.5,
    max_tokens: 220,
  })

  return NextResponse.json({ summary: ai.choices[0]?.message?.content || '' })
}

