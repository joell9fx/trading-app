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

    const { data: paths, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', targetUser)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ summary: 'AI not configured. Keep completing your lessons and challenges!' })
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI mentor reviewing a student’s trading progress.' },
        {
          role: 'user',
          content: `
Analyze this progress data and return a motivational paragraph summarizing improvements and next steps:
${JSON.stringify(paths || [])}
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
      return NextResponse.json({ summary: 'Progress review unavailable right now.' })
    }

    const data = await aiRes.json()
    return NextResponse.json({ summary: data.choices?.[0]?.message?.content || '' })
  } catch (error) {
    console.error('review-progress error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

