import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { SERVICE_PRODUCTS } from '@/lib/service-products'
import { COMING_SOON_SERVICE_KEYS } from '@/lib/services-catalog'

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

  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const serviceKeyRaw = (parsed as { serviceKey?: unknown })?.serviceKey
  if (typeof serviceKeyRaw !== 'string' || !serviceKeyRaw.trim()) {
    console.warn('[checkout] missing or invalid serviceKey', { userId: user.id })
    return NextResponse.json({ error: 'Invalid service key' }, { status: 400 })
  }

  const serviceKey = serviceKeyRaw.trim()

  if ((COMING_SOON_SERVICE_KEYS as readonly string[]).includes(serviceKey)) {
    console.warn('[checkout] blocked coming_soon service', { userId: user.id, serviceKey })
    return NextResponse.json({ error: 'This product is not available for purchase yet' }, { status: 400 })
  }

  const priceId = SERVICE_PRODUCTS[serviceKey]
  if (!priceId) {
    console.warn('[checkout] no Stripe price mapped for service', { userId: user.id, serviceKey })
    return NextResponse.json({ error: 'Invalid service or price not configured' }, { status: 400 })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret?.trim()) {
    console.warn('[checkout] STRIPE_SECRET_KEY missing after auth', { userId: user.id, serviceKey })
    return NextResponse.json(
      { error: 'Checkout is temporarily unavailable. Payment provider is not configured.' },
      { status: 503 },
    )
  }

  const domainUrl = process.env.DOMAIN_URL || process.env.NEXT_PUBLIC_SITE_URL
  const baseUrl = domainUrl || 'http://localhost:3000'
  if (!domainUrl) {
    console.warn('[checkout] NEXT_PUBLIC_SITE_URL / DOMAIN_URL not set; using fallback base URL for redirect')
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

  try {
    const successUrl = `${baseUrl}/dashboard/success?service=${encodeURIComponent(serviceKey)}`
    const cancelUrl = `${baseUrl}/dashboard?cancel=1`

    console.info('[checkout] creating session', { userId: user.id, serviceKey, priceId })

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

    console.info('[checkout] session created', {
      sessionId: session.id,
      userId: user.id,
      serviceKey,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[checkout] Stripe session create failed', { userId: user.id, serviceKey, message })
    return NextResponse.json({ error: message || 'Checkout error' }, { status: 500 })
  }
}
