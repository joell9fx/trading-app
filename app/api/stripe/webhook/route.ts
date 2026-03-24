import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { COMING_SOON_SERVICE_KEYS } from '@/lib/services-catalog'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const priceToServiceKey: Record<string, string> = Object.fromEntries(
  [
    [process.env.STRIPE_PRICE_ELITE, 'elite_membership'],
    [process.env.STRIPE_PRICE_VIP, 'vip_membership'],
    [process.env.STRIPE_PRICE_SIGNALS, 'signals'],
    [process.env.STRIPE_PRICE_G2G, 'gold_to_glory'],
    [process.env.STRIPE_PRICE_MENTORSHIP, 'mentorship'],
    [process.env.STRIPE_PRICE_COMMUNITY, 'community'],
    [process.env.STRIPE_PRICE_FUNDING, 'funding'],
    [process.env.STRIPE_PRICE_COURSES, 'courses'],
  ].filter(([price]) => typeof price === 'string' && price.trim().length > 0) as [string, string][]
)

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createAdminClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null

export async function POST(req: NextRequest) {
  if (!stripe || !stripeWebhookSecret || !supabaseAdmin) {
    console.warn('[stripe.webhook] not configured (stripe, webhook secret, or supabase admin client)')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const sig = req.headers.get('stripe-signature')
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, stripeWebhookSecret)
  } catch (err: any) {
    console.error('[stripe.webhook] signature verification failed', err?.message || err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.info('[stripe.webhook] event', event.type, event.id)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = (session.client_reference_id as string) || session.metadata?.user_id

    // Fetch line items to inspect the price id
    const checkoutWithItems = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] })
    const priceId = checkoutWithItems.line_items?.data?.[0]?.price?.id
    const serviceKeyFromPrice = priceId ? priceToServiceKey[priceId] : undefined
    const serviceKey = serviceKeyFromPrice || session.metadata?.service_key

    console.info('[stripe.webhook] checkout.session.completed mapping', {
      sessionId: session.id,
      priceId: priceId ?? null,
      serviceKeyResolved: serviceKey ?? null,
      mappingSource: serviceKeyFromPrice ? 'price_table' : session.metadata?.service_key ? 'metadata' : 'none',
    })

    if (priceId && !serviceKeyFromPrice && !session.metadata?.service_key) {
      console.warn('[stripe.webhook] price id not mapped to service_key', {
        sessionId: session.id,
        priceId,
      })
    }

    if (!userId || !serviceKey) {
      console.warn('[stripe.webhook] skip unlock: missing userId or serviceKey', {
        sessionId: session.id,
        hasUserId: !!userId,
        priceId,
        metadataServiceKey: session.metadata?.service_key,
      })
      return NextResponse.json({ received: true, skipped: true })
    }

    if ((COMING_SOON_SERVICE_KEYS as readonly string[]).includes(serviceKey)) {
      console.warn('[stripe.webhook] skip unlock: coming_soon service', { serviceKey, sessionId: session.id })
      return NextResponse.json({ received: true, skipped: true })
    }

    const { error: upsertError, data: upsertData } = await supabaseAdmin
      .from('user_services')
      .upsert(
        {
          user_id: userId,
          service_key: serviceKey,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,service_key' }
      )
      .select()

    if (upsertError) {
      console.error('[stripe.webhook] user_services upsert failed', {
        message: upsertError.message,
        code: upsertError.code,
        userId,
        serviceKey,
      })
      return NextResponse.json({ error: 'Upsert failed' }, { status: 500 })
    }

    console.info('[stripe.webhook] user_services unlocked', {
      userId,
      serviceKey,
      rows: upsertData?.length ?? 0,
      sessionId: session.id,
    })
  }

  return NextResponse.json({ received: true })
}

