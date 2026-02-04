import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP } from '@/lib/xp-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { trade } = await req.json()
    if (!trade?.id) {
      return NextResponse.json({ error: 'trade is required' }, { status: 400 })
    }

    // Verify ownership
    if (trade.user_id && trade.user_id !== user.id) {
      const { data: owned } = await supabase.from('user_trades').select('user_id').eq('id', trade.id).single()
      if (owned?.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const summary = `
Pair: ${trade.pair}
Direction: ${trade.direction}
Entry: ${trade.entry_price}
Exit: ${trade.exit_price}
Result: ${trade.result}
R:R: ${trade.risk_reward}
Profit: ${trade.profit}
`

    let feedback = 'AI feedback unavailable.'
    let sentiment = 'neutral'

    if (process.env.OPENAI_API_KEY) {
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a trading performance coach providing concise, data-driven feedback on trades.',
          },
          {
            role: 'user',
            content: `
Analyze the following trade details and return 2–3 short bullet points of feedback.
Include one positive observation and one improvement suggestion.
${summary}
            `,
          },
        ],
        temperature: 0.6,
        max_tokens: 200,
      }

      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      })

      if (aiRes.ok) {
        const data = await aiRes.json()
        feedback = data.choices?.[0]?.message?.content || feedback
      }
    }

    const lower = feedback.toLowerCase()
    if (lower.includes('great') || lower.includes('good') || lower.includes('nice') || lower.includes('well')) {
      sentiment = 'positive'
    } else if (lower.includes('early') || lower.includes('late') || lower.includes('improve') || lower.includes('better')) {
      sentiment = 'negative'
    }

    await supabase
      .from('user_trades')
      .update({ ai_feedback: feedback, feedback_sentiment: sentiment })
      .eq('id', trade.id)

    if (sentiment === 'positive') {
      try {
        await addXP(supabase, user.id, 2, 'Positive Trade Feedback')
      } catch (e) {
        // best effort
      }
    }

    return NextResponse.json({ feedback, sentiment })
  } catch (error) {
    console.error('Trade feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

