import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const sig = req.headers.get('stripe-signature')
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, stripeWebhookSecret)
  } catch (err: any) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = (session.client_reference_id as string) || session.metadata?.user_id

    // Fetch line items to inspect the price id
    const checkoutWithItems = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] })
    const priceId = checkoutWithItems.line_items?.data?.[0]?.price?.id
    const serviceKeyFromPrice = priceId ? priceToServiceKey[priceId] : undefined
    const serviceKey = serviceKeyFromPrice || session.metadata?.service_key

    if (!userId || !serviceKey) {
      console.warn('[stripe.webhook] missing userId or serviceKey', { userId, priceId, metadata: session.metadata })
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
      console.error('[stripe.webhook] user_services upsert error', upsertError)
      return NextResponse.json({ error: 'Upsert failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

