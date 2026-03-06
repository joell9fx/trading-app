import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { SERVICE_PRODUCTS } from '@/lib/service-products'

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

  try {
    const { serviceKey } = await req.json()
    const priceId = SERVICE_PRODUCTS[serviceKey]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid service or price not configured' }, { status: 400 })
    }

    const successUrl = `${domainUrl || 'http://localhost:3000'}/dashboard/success?service=${serviceKey}`
    const cancelUrl = `${domainUrl || 'http://localhost:3000'}/dashboard?cancel=1`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      metadata: {
        service_key: serviceKey,
        user_id: user.id,
        email: user.email || '',
      },
      customer_email: user.email || undefined,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Checkout session error:', error)
    return NextResponse.json({ error: error?.message || 'Checkout error' }, { status: 500 })
  }
}

