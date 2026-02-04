import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const WEBHOOK_SECRET = process.env.SERVICE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const signature = req.headers.get('x-webhook-secret')
  if (signature !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  try {
    const payload = await req.json()
    const { user_id, service_key, amount, payment_status } = payload || {}

    if (!user_id || !service_key) {
      return NextResponse.json({ error: 'Missing user_id or service_key' }, { status: 400 })
    }

    // Record transaction
    const { error: txnError } = await supabase
      .from('transactions')
      .insert([{ user_id, service_key, amount: amount || null, payment_status: payment_status || 'paid' }])

    if (txnError) {
      console.error('Transaction insert error:', txnError)
    }

    // Unlock on successful payment
    if (!payment_status || payment_status === 'paid' || payment_status === 'succeeded') {
      const { error: unlockError } = await supabase
        .from('user_services')
        .upsert({ user_id, service_key, is_unlocked: true }, { onConflict: 'user_id,service_key' })

      if (unlockError) {
        console.error('Unlock error:', unlockError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

