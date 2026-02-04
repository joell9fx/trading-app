import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createAdminClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null

const columnMap: Record<string, string> = {
  signals: 'has_signals_access',
  mentorship: 'has_mentorship_access',
  ai_tools: 'has_ai_tools_access',
}

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
    console.error('Stripe webhook verification error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}
    const user_id = metadata.user_id
    const product = metadata.product
    const column = columnMap[product || '']

    if (user_id && column) {
      try {
        await supabaseAdmin.from('profiles').update({ [column]: true }).eq('id', user_id)
        await supabaseAdmin.from('access_logs').insert([{ user_id, product }])
        await addXP(supabaseAdmin as any, user_id, 50, 'Paid feature unlock')
        await assignBadges(supabaseAdmin as any, user_id)
      } catch (err) {
        console.error('Access update error:', err)
      }
    }
  }

  return NextResponse.json({ received: true })
}

