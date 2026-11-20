import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimitResponse } from '@/lib/api/rate-limit'
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'

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
    const body = await parseBody(
      req,
      z.object({
        type: z.string().trim().min(1).max(40),
        title: z.string().trim().min(1).max(150),
        caption: z.string().trim().max(2000).optional(),
      }),
    )
    if (body.error) return body.error
    const { type, title, caption } = body.data

    let image_url: string | null = null

    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Create a clean black-gold card celebrating a trader milestone titled "${title}". Include subtle trading theme and Trading Academy black-and-gold aesthetic.`
        const aiRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt,
            size: '1024x1024',
          }),
        })
        if (aiRes.ok) {
          const data = await aiRes.json()
          image_url = data?.data?.[0]?.url || null
        }
      } catch {
        image_url = null
      }
    }

    const { data: inserted, error } = await supabase
      .from('user_showcase_posts')
      .insert([{ user_id: user.id, type, title, caption: caption || '', image_url }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    try {
      await supabase.rpc('increment_xp', { user_id: user.id, amount: 10, reason: 'Community Sharing' })
    } catch {}

    return NextResponse.json({ message: 'Post created', post: inserted })
  } catch (error) {
    console.error('showcase create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

