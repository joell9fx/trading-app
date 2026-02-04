import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { trade, candles } = await req.json()
    if (!trade || !candles) {
      return NextResponse.json({ error: 'trade and candles are required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ commentary: 'AI commentary unavailable (missing OPENAI_API_KEY).' })
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional trading analyst. Narrate a concise replay of the trade.' },
        {
          role: 'user',
          content: `
Analyze this trade and describe visually in 3-4 short coach-like sentences:
Pair: ${trade.pair}
Direction: ${trade.direction || 'unknown'}
R:R: ${trade.risk_reward || 'n/a'}
Result: ${trade.result || 'n/a'}
Candle Data (first 50): ${JSON.stringify((candles as any[]).slice(0, 50))}
Focus on entry timing, stop/target context, momentum, and risk management cues.
`,
        },
      ],
      temperature: 0.7,
      max_tokens: 220,
    }

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!aiRes.ok) {
      return NextResponse.json({ commentary: 'AI commentary unavailable right now.' })
    }

    const data = await aiRes.json()
    return NextResponse.json({ commentary: data.choices?.[0]?.message?.content || '' })
  } catch (error) {
    console.error('Replay commentary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

