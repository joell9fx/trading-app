import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SERVICE_DISPLAY_NAMES } from '@/lib/service-products'
import { updateUserTier } from '@/lib/tier-utils'
import { addXP } from '@/lib/xp-utils'
import { accessColumnForService, AccessModuleKey } from '@/lib/access-flags'

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
    const user_id = (session.client_reference_id as string) || session.metadata?.user_id
    const service_key = session.metadata?.service_key
    const amount_total = session.amount_total ? session.amount_total / 100 : null
    const { data: referralRow } =
      user_id && supabaseAdmin
        ? await supabaseAdmin.from('referrals').select('*').eq('referred_id', user_id).single()
        : { data: null }

    if (user_id && service_key) {
      // Unlock service
      const { error: unlockError } = await supabaseAdmin
        .from('user_services')
        .upsert({ user_id, service_key, is_unlocked: true }, { onConflict: 'user_id,service_key' })

      if (unlockError) {
        console.error('Unlock upsert error:', unlockError)
      }

      const column = accessColumnForService(service_key as AccessModuleKey)
      if (column) {
        const { error: flagError } = await supabaseAdmin
          .from('profiles')
          .update({ [column]: true })
          .eq('id', user_id)
        if (flagError) {
          console.error('Profile flag update error (webhook):', flagError)
        }
      }

      // Record transaction
      const { error: txnError } = await supabaseAdmin
        .from('transactions')
        .insert([
          {
            user_id,
            service_key,
            payment_status: session.payment_status || 'paid',
            amount: amount_total,
          },
        ])

      if (txnError) {
        console.error('Transaction insert error:', txnError)
      }

      // Optional: add notification
      await supabaseAdmin.from('notifications').insert([
        {
          user_id,
          type: 'system',
          title: 'Service Unlocked',
          message: `Your ${SERVICE_DISPLAY_NAMES[service_key] || service_key} is now unlocked.`,
        },
      ])

      // Update tier
      try {
        await updateUserTier(supabaseAdmin, user_id)
      } catch (tierErr) {
        console.error('Tier update error (webhook):', tierErr)
      }
      try {
        await addXP(supabaseAdmin as any, user_id, 30, 'unlocking a service')
      } catch (xpErr) {
        console.error('XP add error (webhook unlock):', xpErr)
      }

      // Referral purchase reward
      if (referralRow?.referrer_id) {
        try {
          await supabaseAdmin
            .from('referral_rewards')
            .insert([
              {
                user_id: referralRow.referrer_id,
                reward_type: 'discount',
                amount: 10,
                transaction_type: 'earn',
                description: 'Referral purchase reward',
              },
            ])
          await supabaseAdmin
            .from('referrals')
            .update({ reward_status: 'completed' })
            .eq('id', referralRow.id)
          await supabaseAdmin.from('notifications').insert([
            {
              user_id: referralRow.referrer_id,
              type: 'referral',
              title: '💰 Referral Purchase Reward',
              message: `Your referral just purchased. You earned a reward.`,
            },
          ])
          try {
            await addXP(supabaseAdmin as any, referralRow.referrer_id, 50, 'referral purchase')
          } catch (xpErr) {
            console.error('XP add error (referral purchase):', xpErr)
          }
        } catch (refErr) {
          console.error('Referral reward error:', refErr)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}

