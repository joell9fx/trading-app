import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { trades } = await req.json()
    if (!trades || !Array.isArray(trades)) {
      return NextResponse.json({ error: 'trades array required' }, { status: 400 })
    }

    const wins = trades.filter((t: any) => t.result === 'win').length
    const losses = trades.filter((t: any) => t.result === 'loss').length
    const breakevens = trades.filter((t: any) => t.result === 'breakeven').length
    const total = trades.length || 1
    const winRate = Math.round((wins / total) * 100)
    const avgRR =
      trades.reduce((sum: number, t: any) => sum + (Number(t.risk_reward) || 0), 0) / (trades.length || 1)
    const totalProfit = trades.reduce((sum: number, t: any) => sum + (Number(t.profit) || 0), 0)

    const summary = `
Trades analyzed: ${trades.length}
Win rate: ${winRate}%
Average R:R: ${avgRR.toFixed(2)}
Total profit: ${totalProfit}
Wins: ${wins}, Losses: ${losses}, Breakevens: ${breakevens}
    `

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        insights: 'AI insights unavailable (missing OPENAI_API_KEY). Summary:\n' + summary,
      })
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a trading performance analyst. Be concise and constructive.' },
        {
          role: 'user',
          content: `
Provide 3 concise bullet insights:
1) Behavior/pattern noticed,
2) Area to improve,
3) Encouragement or next step.
Data:
${summary}
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
      return NextResponse.json({ insights: 'AI insights unavailable right now.' })
    }

    const data = await aiRes.json()
    return NextResponse.json({ insights: data.choices?.[0]?.message?.content || '' })
  } catch (error) {
    console.error('Insights error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

