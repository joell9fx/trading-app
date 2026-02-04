import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../auth'
// @ts-ignore openai types resolved at runtime
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey })

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('security_audits')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const ai = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Summarize weekly security audit findings and give next-step recommendations.',
      },
      { role: 'user', content: JSON.stringify(data || []) },
    ],
    max_tokens: 260,
  })

  return NextResponse.json({ summary: ai.choices[0]?.message?.content || '' })
}

