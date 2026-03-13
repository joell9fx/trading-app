import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  userTradesToHistoryData,
  userTradesToPerformanceData,
  computeEquityCurve,
  computePerformanceAnalytics,
} from '@/lib/dashboard/signals-adapter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [tradesRes, signalsRes] = await Promise.all([
      supabase
        .from('user_trades')
        .select('id, user_id, pair, direction, entry_price, exit_price, risk_reward, result, stop_loss, take_profit, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('signals')
        .select('id, trading_pair, direction, entry_price, stop_loss, take_profit, risk_reward_ratio, status, notes, created_at')
        .in('status', ['active', 'closed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (tradesRes.error) {
      console.error('[signals/dashboard] user_trades error:', tradesRes.error);
      return NextResponse.json(
        { error: tradesRes.error.message || 'Failed to load trades' },
        { status: 500 }
      );
    }
    if (signalsRes.error) {
      console.error('[signals/dashboard] signals error:', signalsRes.error);
      return NextResponse.json(
        { error: signalsRes.error.message || 'Failed to load signals' },
        { status: 500 }
      );
    }

    const trades = (tradesRes.data ?? []) as import('@/lib/dashboard/signals-adapter').UserTradeRow[];
    const history = userTradesToHistoryData(trades);
    const performance = userTradesToPerformanceData(trades, null);
    const equityCurve = computeEquityCurve(trades);
    const analytics = computePerformanceAnalytics(trades, performance.monthly);

    const signals =
      signalsRes.data
        ?.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          asset: String(s.trading_pair ?? ''),
          timeframe: 'N/A',
          bias: (s.direction ?? 'long') === 'short' ? 'short' : 'long',
          entry: String(s.entry_price ?? ''),
          stop: String(s.stop_loss ?? ''),
          takeProfit: String(s.take_profit ?? ''),
          rr: Number(s.risk_reward_ratio) || 0,
          status:
            s.status === 'closed'
              ? 'closed'
              : s.status === 'cancelled'
                ? 'cancelled'
                : 'active',
          rationale: String(s.notes ?? ''),
          timestamp: String(s.created_at ?? ''),
        }))
        ?.filter((s: { status: string }) => s.status !== 'cancelled') ?? [];

    return NextResponse.json({
      history,
      performance,
      signals,
      equityCurve,
      analytics,
    });
  } catch (err) {
    console.error('[signals/dashboard]', err);
    return NextResponse.json(
      { error: 'Failed to load signals data' },
      { status: 500 }
    );
  }
}
