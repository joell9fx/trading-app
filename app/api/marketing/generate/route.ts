import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { asset_type, platform, tone, customPrompt } = await req.json()
    const userId = auth.user.id

    if (!asset_type) {
      return NextResponse.json({ error: 'Missing asset_type' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('username, affiliate_tier, referral_code')
      .eq('id', userId)
      .single()

    const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/signup?ref=${user?.referral_code || ''}`

    const toneText = tone || 'motivational'
    const platformText = platform || 'instagram'

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }
    const openai = new OpenAI({ apiKey })

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `
You are a creative marketing strategist for VisionEdge FX.
Produce concise, high-converting promotional content in a confident voice.
Focus on trading education, funding challenges, and community value.
Always include a subtle CTA with this referral link: ${referralLink}.
Keep brand style: black-gold, premium, visionary.`,
      },
      {
        role: 'user',
        content: `Generate a ${asset_type} for ${platformText} in a ${toneText} tone.
User tier: ${user?.affiliate_tier || 'Bronze'}.
Provide 2-3 variations separated by '---'.
${customPrompt ? `Additional instructions: ${customPrompt}` : ''}`,
      },
    ]

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 320,
    })

    const content = chat.choices[0]?.message?.content || ''
    let image_url: string | null = null

    if (asset_type === 'image' && process.env.OPENAI_API_KEY) {
      try {
        const imagePrompt = `Create a clean black-gold trading community promo post for VisionEdge FX with text overlay: "Join the Movement". Style: sleek, premium, minimal, subtle glow.`
        const imageGen = await openai.images.generate({
          model: 'dall-e-2',
          prompt: imagePrompt,
          size: '1024x1024',
          response_format: 'url',
        })
        image_url = imageGen?.data?.[0]?.url || null
      } catch (imgErr) {
        console.error('marketing image error', imgErr)
      }
    }

    await supabase.from('marketing_assets').insert([{ user_id: userId, asset_type, content, image_url }])

    // reward XP for creation
    await addXP(supabase, userId, 2, 'Marketing Content Created')
    await assignBadges(supabase, userId)

    return NextResponse.json({ content, image_url })
  } catch (error) {
    console.error('marketing generate error', error)
    return NextResponse.json({ error: 'Failed to generate marketing content' }, { status: 500 })
  }
}

