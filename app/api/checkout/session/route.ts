import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const domainUrl = process.env.DOMAIN_URL || process.env.NEXT_PUBLIC_SITE_URL
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { product } = await req.json()
  const prices: Record<string, string | undefined> = {
    signals: process.env.STRIPE_PRICE_SIGNALS,
    mentorship: process.env.STRIPE_PRICE_MENTORSHIP,
    ai_tools: process.env.STRIPE_PRICE_AI_TOOLS,
  }

  const priceId = prices[product]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  const successUrl = `${domainUrl || 'http://localhost:3000'}/dashboard/upgrade?success=${product}`
  const cancelUrl = `${domainUrl || 'http://localhost:3000'}/dashboard/upgrade?cancelled=true`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: user.id, product },
      customer_email: user.email || undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout session error:', error)
    return NextResponse.json({ error: error?.message || 'Checkout error' }, { status: 500 })
  }
}

