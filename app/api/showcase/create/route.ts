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
    const { type, title, caption } = await req.json()
    if (!type || !title) {
      return NextResponse.json({ error: 'type and title are required' }, { status: 400 })
    }

    let image_url: string | null = null

    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Create a clean black-gold card celebrating a trader milestone titled "${title}". Include subtle trading theme and VisionEdge aesthetic.`
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

