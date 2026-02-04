import { NextResponse } from 'next/server'
import { requireAdmin } from '../auth'
// @ts-ignore openai types resolved at runtime
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

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

  const ai = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a business intelligence analyst for VisionEdge FX. Summarize performance trends and give 3 concise recommendations. Tone: analytical + motivational.',
      },
      {
        role: 'user',
        content: JSON.stringify(overview),
      },
    ],
    temperature: 0.5,
    max_tokens: 220,
  })

  return NextResponse.json({ insights: ai.choices[0]?.message?.content || '' })
}

