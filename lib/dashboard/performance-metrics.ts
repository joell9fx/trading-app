/**
 * Trading performance metrics from journal_entries (result_r, entry_date).
 * All calculations work on ordered rows (by entry_date); pass filtered rows for filtered metrics.
 */

import type { Database } from '@/types/supabase';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

export interface EquityPoint {
  date: string;
  cumulativeR: number;
  drawdown: number;
  peak: number;
}

export interface MonthlyR {
  month: string;
  totalR: number;
  trades: number;
  winRatePct: number;
}

export interface PerformanceMetricsResult {
  /** Cumulative R curve (sorted by entry_date) */
  equityCurve: EquityPoint[];
  /** Drawdown at each point (peak - current) */
  drawdownCurve: { date: string; drawdown: number }[];
  /** Max drawdown (largest peak-to-trough decline in R) */
  maxDrawdown: number;
  /** Gross wins / gross losses; null if no losses */
  profitFactor: number | null;
  /** Average R per trade */
  expectancy: number;
  /** Mean of result_r where result_r > 0; null if no wins */
  averageWin: number | null;
  /** Mean of result_r where result_r < 0 (negative); null if no losses */
  averageLoss: number | null;
  /** 0–100 score: higher = more consistent R (inverse of coefficient of variation) */
  riskConsistency: number;
  /** Longest consecutive trades with result_r > 0 */
  largestWinningStreak: number;
  /** Longest consecutive trades with result_r < 0 */
  largestLosingStreak: number;
  /** Total R */
  totalR: number;
  /** Number of trades */
  totalTrades: number;
  /** Win rate 0–100 */
  winRatePct: number;
  /** Monthly R breakdown (yyyy-mm, totalR, trades, winRatePct) */
  monthlyR: MonthlyR[];
}

function parseR(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).trim().replace(/,/g, '').replace(/[Rr]/g, '');
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function sortedByDate(rows: JournalEntryRow[]): JournalEntryRow[] {
  return [...rows].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );
}

function computeStreaks(rValues: number[]): { win: number; loss: number } {
  let winStreak = 0;
  let lossStreak = 0;
  let maxWin = 0;
  let maxLoss = 0;
  for (const r of rValues) {
    if (r > 0) {
      winStreak += 1;
      lossStreak = 0;
      maxWin = Math.max(maxWin, winStreak);
    } else if (r < 0) {
      lossStreak += 1;
      winStreak = 0;
      maxLoss = Math.max(maxLoss, lossStreak);
    } else {
      winStreak = 0;
      lossStreak = 0;
    }
  }
  return { win: maxWin, loss: maxLoss };
}

/**
 * Compute all performance metrics from journal entry rows.
 * Rows can be in any order; sorted by entry_date internally.
 * Pass filtered rows to get metrics for a subset.
 */
export function computePerformanceMetrics(
  rows: JournalEntryRow[]
): PerformanceMetricsResult {
  const sorted = sortedByDate(rows);
  const rValues = sorted.map((r) => parseR(r.result_r));
  const n = rValues.length;
  const totalR = rValues.reduce((s, v) => s + v, 0);
  const wins = rValues.filter((v) => v > 0);
  const losses = rValues.filter((v) => v < 0);
  const grossWins = wins.reduce((s, v) => s + v, 0);
  const grossLosses = Math.abs(losses.reduce((s, v) => s + v, 0));
  const winRatePct = n ? (wins.length / n) * 100 : 0;
  const expectancy = n ? totalR / n : 0;
  const averageWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : null;
  const averageLoss = losses.length
    ? losses.reduce((a, b) => a + b, 0) / losses.length
    : null;
  const profitFactor =
    grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? null : null;
  const { win: largestWinningStreak, loss: largestLosingStreak } =
    computeStreaks(rValues);

  let peak = 0;
  let maxDrawdown = 0;
  const equityCurve: EquityPoint[] = [];
  const drawdownCurve: { date: string; drawdown: number }[] = [];
  let cum = 0;
  for (let i = 0; i < sorted.length; i++) {
    cum += rValues[i];
    peak = Math.max(peak, cum);
    const dd = peak - cum;
    maxDrawdown = Math.max(maxDrawdown, dd);
    equityCurve.push({
      date: sorted[i].entry_date,
      cumulativeR: cum,
      drawdown: dd,
      peak,
    });
    drawdownCurve.push({ date: sorted[i].entry_date, drawdown: dd });
  }

  const mean = n ? totalR / n : 0;
  const variance =
    n > 1
      ? rValues.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1)
      : 0;
  const std = Math.sqrt(variance);
  const riskConsistency =
    std > 0 && mean !== 0
      ? Math.round(Math.max(0, 100 - Math.min(100, Math.abs(std / mean) * 50)))
      : n > 0 ? 100 : 0;

  const monthMap = new Map<
    string,
    { totalR: number; wins: number; count: number }
  >();
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i].entry_date;
    const month = d.slice(0, 7);
    const r = rValues[i];
    const rec = monthMap.get(month) ?? { totalR: 0, wins: 0, count: 0 };
    rec.totalR += r;
    rec.count += 1;
    if (r > 0) rec.wins += 1;
    monthMap.set(month, rec);
  }
  const monthlyR: MonthlyR[] = Array.from(monthMap.entries())
    .map(([month, { totalR: tr, wins: w, count: c }]) => ({
      month,
      totalR: tr,
      trades: c,
      winRatePct: c ? (w / c) * 100 : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    equityCurve,
    drawdownCurve,
    maxDrawdown,
    profitFactor,
    expectancy,
    averageWin,
    averageLoss,
    riskConsistency,
    largestWinningStreak,
    largestLosingStreak,
    totalR,
    totalTrades: n,
    winRatePct,
    monthlyR,
  };
}
