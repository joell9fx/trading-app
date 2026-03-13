import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: payoutsData, error } = await supabase
      .from('affiliate_payouts')
      .select('id, amount, status, created_at, paid_at')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('affiliate payouts failed', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ payouts: payoutsData ?? [] });
  } catch (e) {
    console.error('affiliate payouts failed', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

