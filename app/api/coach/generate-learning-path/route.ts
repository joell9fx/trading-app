import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimitResponse } from '@/lib/api/rate-limit'

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
  const limited = rateLimitResponse(`ai:${user.id}`)
  if (limited) return limited

  try {
    const input = await req.json().catch(() => null)
    const { pattern_type, sentiment } = input ?? {}
    // Members can only create learning paths for themselves.
    if (input?.user_id && input.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const user_id = user.id
    if (!pattern_type || typeof pattern_type !== 'string') {
      return NextResponse.json({ error: 'pattern_type required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI trading mentor that creates custom lessons and practice challenges for traders based on their weaknesses or strengths.',
        },
        {
          role: 'user',
          content: `
Pattern: ${pattern_type}
Sentiment: ${sentiment || 'unknown'}
Generate:
- A short title
- Description
- 3-4 step lesson outline
- 1 practical trading challenge (daily/weekly)
- 1 resource link (YouTube, article, or internal lesson)
- Difficulty level
Format response as JSON with keys: title, description, outline (array), challenge, resource, difficulty.
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
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
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await aiRes.json()
    const lesson = JSON.parse(data.choices?.[0]?.message?.content || '{}')

    await supabase.from('learning_paths').insert([
      {
        user_id,
        pattern_type,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        lesson_content: Array.isArray(lesson.outline) ? lesson.outline.join('\n') : lesson.outline || '',
        challenge_goal: lesson.challenge,
        resource_link: lesson.resource,
        status: 'active',
        progress: 0,
      },
    ])

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('generate-learning-path error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

