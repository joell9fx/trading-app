/**
 * Adapters to map DB/API rows to Signals History and Performance typed props.
 * Used by the signals dashboard API and components.
 */

import type {
  SignalsHistoryEntry,
  SignalsHistoryData,
} from '@/components/dashboard/signals-history';
import type {
  SignalsPerformanceData,
  SignalsPerformanceStats,
  MonthlyPerformanceEntry,
} from '@/components/dashboard/signals-performance';

/** Single point on the cumulative R equity curve (date → cumulative R). */
export type EquityCurvePoint = {
  date: string;
  dateIso: string;
  cumulativeR: number;
};

/** Supporting analytics derived from user_trades. */
export type PerformanceAnalytics = {
  bestMonth: { label: string; rr: number } | null;
  worstMonth: { label: string; rr: number } | null;
  avgWinR: number;
  avgLossR: number;
  currentWinStreak: number;
  currentLossStreak: number;
};

/** Raw user_trades row from Supabase (subset we use). */
export type UserTradeRow = {
  id: string;
  user_id: string;
  pair: string | null;
  direction: string | null;
  entry_price: number | null;
  exit_price?: number | null;
  risk_reward: number | null;
  result: string | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  created_at?: string | null;
};

const MONTH_LABELS: Record<number, string> = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
};

/** Result in R for one trade: win -> risk_reward, loss -> -1, breakeven -> 0 */
function resultR(trade: UserTradeRow): number {
  const result = (trade.result || '').toLowerCase();
  if (result === 'win') return Number(trade.risk_reward) || 1;
  if (result === 'loss') return -1;
  return 0;
}

export function userTradesToHistoryData(trades: UserTradeRow[]): SignalsHistoryData {
  const entries: SignalsHistoryEntry[] = (trades || []).map((t) => {
    const d = t.created_at ? new Date(t.created_at) : new Date();
    const dateIso = d.toISOString().slice(0, 10);
    const dateDisplay = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const direction = (t.direction || 'long').toLowerCase() === 'short' ? 'SELL' : 'BUY';
    return {
      id: t.id,
      date: dateDisplay,
      dateIso,
      asset: t.pair || '—',
      direction,
      entry: String(t.entry_price ?? '—'),
      stopLoss: String(t.stop_loss ?? '—'),
      takeProfit: String(t.take_profit ?? '—'),
      resultR: resultR(t),
      timeframe: undefined,
    };
  });
  return { entries };
}

export function userTradesToPerformanceData(
  trades: UserTradeRow[],
  statsFromDb: { win_rate?: number; total_trades?: number; avg_rr?: number } | null
): SignalsPerformanceData {
  const totalSignals = trades?.length ?? 0;
  const wins = trades?.filter((t) => (t.result || '').toLowerCase() === 'win').length ?? 0;
  const totalRR = trades?.reduce((sum, t) => sum + resultR(t), 0) ?? 0;
  const avgRR = totalSignals > 0 ? totalRR / totalSignals : 0;
  const winRatePct = totalSignals > 0 ? (wins / totalSignals) * 100 : 0;

  const stats: SignalsPerformanceStats = {
    winRatePct,
    totalSignals,
    avgRR,
    totalRR,
  };

  const byMonth = new Map<string, { year: number; rr: number; month: number }>();
  for (const t of trades || []) {
    const d = t.created_at ? new Date(t.created_at) : new Date();
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const existing = byMonth.get(key);
    const r = resultR(t);
    if (existing) {
      existing.rr += r;
    } else {
      byMonth.set(key, { year: d.getFullYear(), month: d.getMonth() + 1, rr: r });
    }
  }
  const monthly: MonthlyPerformanceEntry[] = Array.from(byMonth.values())
    .map((v) => ({
      month: MONTH_LABELS[v.month] ?? String(v.month),
      year: v.year,
      rr: Math.round(v.rr * 10) / 10,
      label: MONTH_LABELS[v.month] ?? String(v.month),
      _m: v.month,
    }))
    .sort((a, b) => (b.year !== a.year ? b.year - a.year : (b as { _m: number })._m - (a as { _m: number })._m))
    .map(({ _m: _, ...e }) => e)
    .slice(0, 12);

  return { stats, monthly };
}

/** Build equity curve: cumulative R over time (trades sorted ascending by date). */
export function computeEquityCurve(trades: UserTradeRow[]): EquityCurvePoint[] {
  const sorted = [...(trades || [])].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });
  let cumulative = 0;
  return sorted.map((t) => {
    const d = t.created_at ? new Date(t.created_at) : new Date();
    cumulative += resultR(t);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateIso: d.toISOString().slice(0, 10),
      cumulativeR: Math.round(cumulative * 10) / 10,
    };
  });
}

/** Best/worst month, avg win/loss R, current win/loss streaks. */
export function computePerformanceAnalytics(
  trades: UserTradeRow[],
  monthly: MonthlyPerformanceEntry[]
): PerformanceAnalytics {
  const winTrades = (trades || []).filter((t) => (t.result || '').toLowerCase() === 'win');
  const lossTrades = (trades || []).filter((t) => (t.result || '').toLowerCase() === 'loss');
  const avgWinR =
    winTrades.length > 0
      ? winTrades.reduce((s, t) => s + resultR(t), 0) / winTrades.length
      : 0;
  const avgLossR =
    lossTrades.length > 0
      ? lossTrades.reduce((s, t) => s + resultR(t), 0) / lossTrades.length
      : 0;

  const bestMonth =
    monthly.length > 0
      ? monthly.reduce((best, m) => (m.rr > (best?.rr ?? -Infinity) ? m : best), monthly[0])
      : null;
  const worstMonth =
    monthly.length > 0
      ? monthly.reduce((worst, m) => (m.rr < (worst?.rr ?? Infinity) ? m : worst), monthly[0])
      : null;

  const ordered = [...(trades || [])].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });
  let winStreak = 0;
  let lossStreak = 0;
  for (const t of ordered) {
    const r = (t.result || '').toLowerCase();
    if (r === 'win') {
      if (lossStreak > 0) break;
      winStreak++;
    } else if (r === 'loss') {
      if (winStreak > 0) break;
      lossStreak++;
    } else {
      break;
    }
  }

  return {
    bestMonth: bestMonth ? { label: `${bestMonth.label} ${bestMonth.year}`, rr: bestMonth.rr } : null,
    worstMonth: worstMonth ? { label: `${worstMonth.label} ${worstMonth.year}`, rr: worstMonth.rr } : null,
    avgWinR: Math.round(avgWinR * 10) / 10,
    avgLossR: Math.round(avgLossR * 10) / 10,
    currentWinStreak: winStreak,
    currentLossStreak: lossStreak,
  };
}
