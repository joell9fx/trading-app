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
    const target = user_id || user.id

    const { data: chats } = await supabase
      .from('mentor_chats')
      .select('message, role, created_at')
      .eq('user_id', target)
      .order('created_at', { ascending: true })
      .limit(50)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
You are a memory assistant for a trading mentor.
Summarize recent conversation context into key points:
- User goals
- Emotional tone
- Trading concerns or focus areas
- Any recurring topics
Output JSON with fields: goals, emotions, focus, recurring_patterns.
          `,
        },
        { role: 'user', content: JSON.stringify(chats || []) },
      ],
      temperature: 0.5,
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
      return NextResponse.json({ error: 'AI summarization failed' }, { status: 500 })
    }

    const data = await aiRes.json()
    const memory = JSON.parse(data.choices?.[0]?.message?.content || '{}')

    const sentimentFlag =
      typeof memory.emotions === 'string' && memory.emotions.toLowerCase().includes('frustrat')
        ? 'negative'
        : 'positive'

    await supabase
      .from('mentor_memory')
      .upsert(
        [
          { user_id: target, memory_type: 'goal', content: memory.goals, sentiment: sentimentFlag, last_updated: new Date().toISOString() },
          { user_id: target, memory_type: 'emotion', content: memory.emotions, sentiment: sentimentFlag, last_updated: new Date().toISOString() },
          { user_id: target, memory_type: 'focus', content: memory.focus, sentiment: sentimentFlag, last_updated: new Date().toISOString() },
          { user_id: target, memory_type: 'pattern', content: memory.recurring_patterns, sentiment: sentimentFlag, last_updated: new Date().toISOString() },
        ],
        { onConflict: 'user_id,memory_type' }
      )

    return NextResponse.json({ message: 'Memory updated successfully' })
  } catch (error) {
    console.error('update-memory error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

