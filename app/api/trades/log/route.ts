import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { handleTradeXP, updatePerformanceStats } from '@/lib/performance'

export const dynamic = 'force-dynamic'

const tradeSchema = z.object({
  pair: z.string().min(1),
  direction: z.string().min(1),
  entry_price: z.number(),
  exit_price: z.number(),
  risk_reward: z.number().optional(),
  result: z.enum(['win', 'loss', 'breakeven']),
  profit: z.number().optional().nullable(),
  risked_amount: z.number().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = tradeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }

  const { pair, direction, entry_price, exit_price, risk_reward, result, profit, risked_amount } = parsed.data

  const { data: beforeCount } = await supabase
    .from('user_trades')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const before = beforeCount?.length ? beforeCount.length : 0

  const { data: inserted, error: insertError } = await supabase
    .from('user_trades')
    .insert([
      {
        user_id: user.id,
        pair,
        direction,
        entry_price,
        exit_price,
        risk_reward: risk_reward ?? null,
        result,
        profit: profit ?? null,
        risked_amount: risked_amount ?? null,
      },
    ])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  try {
    await handleTradeXP(supabase, user.id, result, risk_reward, before)
    await updatePerformanceStats(supabase, user.id)
    // Trigger AI feedback asynchronously (best effort)
    const origin = process.env.DOMAIN_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
    fetch(`${origin}/api/trades/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trade: inserted }),
    }).catch(() => {})
  } catch (e) {
    console.error('Trade XP/stats error:', e)
  }

  return NextResponse.json({ success: true })
}

