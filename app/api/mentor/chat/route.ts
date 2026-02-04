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
    const { message } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const [{ data: trades }, { data: stats }, { data: patterns }, { data: lessons }, { data: memories }, { data: lastJournal }] =
      await Promise.all([
      supabase.from('user_trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('performance_stats').select('*').eq('user_id', user.id).single(),
      supabase.from('user_patterns').select('*').eq('user_id', user.id).order('last_detected', { ascending: false }).limit(20),
        supabase.from('learning_paths').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('mentor_memory').select('memory_type, content').eq('user_id', user.id),
        supabase.from('mentor_journal').select('summary, next_focus').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      ])

    const memoryContext = (memories || []).reduce((acc: any, m: any) => {
      acc[m.memory_type] = m.content
      return acc
    }, {})

    const context = {
      recent_trades: (trades || []).slice(0, 5),
      key_stats: stats || {},
      behavioral_patterns: patterns || [],
      learning_paths: (lessons || []).filter((l) => l.status === 'active').map((l) => l.title),
      memory: memoryContext,
      last_journal: lastJournal && lastJournal[0] ? lastJournal[0] : null,
    }

    const buildFallbackReply = () => {
      const recentPnl = (context.recent_trades || [])
        .slice(0, 3)
        .map((t: any) => `${t.symbol || 'trade'} ${t.result || ''}`.trim())
        .join(', ')

      const focus = memoryContext.focus || context.last_journal?.next_focus
      const summary = memoryContext.goal || context.last_journal?.summary
      const pattern = memoryContext.pattern || (context.behavioral_patterns?.[0]?.note ?? '')

      const lines = [
        summary ? `Quick take: ${summary}.` : 'Quick take: I see your recent activity and journal entries.',
        focus ? `Next focus: ${focus}.` : 'Pick one focus for this week and measure it daily.',
        pattern ? `Noticing a pattern: ${pattern}.` : '',
        recentPnl ? `Recent trades: ${recentPnl}.` : '',
        'Keep risk tight and review one lesson before the next session.',
      ].filter(Boolean)

      return lines.slice(0, 5).join(' ')
    }

    let reply = buildFallbackReply()

    if (process.env.OPENAI_API_KEY) {
      const body = {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `
You are a calm, supportive trading mentor with long-term memory.
You know the user's trading history, consistency, learning progress, and XP.
Use the memory context when relevant:
Goals: ${memoryContext.goal || 'None'}
Emotional patterns: ${memoryContext.emotion || 'Neutral'}
Focus areas: ${memoryContext.focus || 'Not specified'}
Recurring patterns: ${memoryContext.pattern || 'None'}
Last journal summary: ${context.last_journal?.summary || 'None'}
Last journal next focus: ${context.last_journal?.next_focus || 'None'}
Give coaching-style replies — clear, realistic, data-aware, and motivational.
Speak like a professional mentor, not a chatbot. Keep responses under 6 sentences.
            `,
          },
          { role: 'user', content: `User message: ${message}\nContext: ${JSON.stringify(context)}` },
        ],
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
        reply = data.choices?.[0]?.message?.content || reply
      }
    }

    // Sentiment classification (best effort)
    let sentiment: string | null = null
    if (process.env.OPENAI_API_KEY) {
      try {
        const sentRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Classify sentiment of this message as positive, neutral, or negative.' },
              { role: 'user', content: message },
            ],
            max_tokens: 4,
          }),
        })
        if (sentRes.ok) {
          const sentData = await sentRes.json()
          sentiment = (sentData.choices?.[0]?.message?.content || '').toLowerCase()
        }
      } catch {
        sentiment = null
      }
    }

    // Log chat history
    await supabase.from('mentor_chats').insert([
      { user_id: user.id, message, role: 'user', sentiment },
      { user_id: user.id, message: reply, role: 'assistant' },
    ])

    try {
      await addXP(supabase, user.id, 2, 'Mentor Chat Engagement')
    } catch (e) {
      // best effort
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Mentor chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

