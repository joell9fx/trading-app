import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { user_id } = await req.json()
    const targetUser = user_id || user.id

    const now = new Date()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startIso = weekStart.toISOString()

    const [{ data: trades }, { data: chats }, { data: stats }, { data: memory }] = await Promise.all([
      supabase
        .from('user_trades')
        .select('*')
        .eq('user_id', targetUser)
        .gte('created_at', startIso)
        .order('created_at', { ascending: true }),
      supabase
        .from('mentor_chats')
        .select('message, role, sentiment, created_at')
        .eq('user_id', targetUser)
        .gte('created_at', startIso)
        .order('created_at', { ascending: true }),
      supabase.from('performance_stats').select('*').eq('user_id', targetUser).single(),
      supabase.from('mentor_memory').select('content, memory_type').eq('user_id', targetUser),
    ])

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const body = {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `
You are an AI trading coach writing a weekly progress journal.
Use a warm, analytical tone.
Reflect on performance, emotional tone, learning progress, and mindset.
Output JSON with fields: summary, emotions, strengths, weaknesses, next_focus.
          `,
        },
        {
          role: 'user',
          content: `
User trades (last 7 days): ${JSON.stringify(trades || [])}
Emotional chat tone: ${JSON.stringify(chats || [])}
Performance stats: ${JSON.stringify(stats || {})}
Memory context: ${JSON.stringify(memory || [])}
          `,
        },
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

    if (!aiRes.ok) {
      return NextResponse.json({ error: 'AI journal generation failed' }, { status: 500 })
    }

    const data = await aiRes.json()
    const journal = JSON.parse(data.choices?.[0]?.message?.content || '{}')

    await supabase.from('mentor_journal').insert([
      {
        user_id: targetUser,
        week_start: weekStart.toISOString().slice(0, 10),
        week_end: now.toISOString().slice(0, 10),
        summary: journal.summary,
        emotions: journal.emotions,
        strengths: journal.strengths,
        weaknesses: journal.weaknesses,
        next_focus: journal.next_focus,
        xp_awarded: 20,
      },
    ])

    await supabase.rpc('increment_xp', { user_id: targetUser, amount: 20, reason: 'Weekly Journal Reflection' })

    return NextResponse.json({ message: 'Journal entry created', journal })
  } catch (error) {
    console.error('generate-journal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

