import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'
import { rateLimitResponse } from '@/lib/api/rate-limit'
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const limited = rateLimitResponse(`ai:${auth.user.id}`)
    if (limited) return limited

    const body = await parseBody(
      req,
      z.object({
        platform: z.string().trim().min(1).max(40),
        goal: z.string().trim().min(1).max(500),
        budget: z.coerce.number().finite().min(0).max(1e9).optional(),
      }),
    )
    if (body.error) return body.error
    const { platform, goal, budget } = body.data
    const userId = auth.user.id

    const { data: user } = await supabase
      .from('profiles')
      .select('affiliate_tier, referral_code')
      .eq('id', userId)
      .single()

    const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/signup?ref=${user?.referral_code || ''}`
    const budgetText = budget ? `Budget: £${budget}` : 'Budget: flexible'

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }
    const openai = new OpenAI({ apiKey })

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `
You are an expert media buyer for Trading Academy.
Generate high-performing ad concepts for ${platform}.
Each concept should include: a campaign name, short ad copy, targeting audience, and a CTA.
Use ${referralLink} as the landing page.
Focus on trading education, funding challenges, and mentorships.
Brand style: black-gold, premium, confident.`,
      },
      {
        role: 'user',
        content: `Goal: ${goal}. ${budgetText}. Platform: ${platform}. Provide 1-2 concepts separated by "---".`,
      },
    ]

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 400,
    })

    const content = chat.choices[0]?.message?.content || ''

    let image_url: string | null = null
    if (apiKey) {
      try {
        const img = await openai.images.generate({
          model: 'dall-e-2',
          prompt: `Professional ad image for Trading Academy, trading charts, black-gold design, text overlay: "Level Up Your Trading Journey."`,
          size: '1024x1024',
          response_format: 'url',
        })
        image_url = img?.data?.[0]?.url || null
      } catch (err) {
        console.error('campaign image generation error', err)
      }
    }

    const { data: insertData, error } = await supabase
      .from('ad_campaigns')
      .insert([
        {
          user_id: userId,
          platform,
          campaign_name: `${platform} Campaign`,
          ad_copy: content,
          image_url,
          targeting: `Goal: ${goal}`,
          budget: budget || null,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await addXP(supabase, userId, 20, 'Ad Campaign Created')
    await assignBadges(supabase, userId)

    return NextResponse.json({ campaign: insertData?.[0] })
  } catch (error) {
    console.error('campaign generate error', error)
    return NextResponse.json({ error: 'Failed to generate campaign' }, { status: 500 })
  }
}

