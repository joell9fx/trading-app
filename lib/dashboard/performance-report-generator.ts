/**
 * Performance report generator: builds a serializable analytics snapshot from journal entry rows.
 * Used when saving a report to performance_reports and when displaying saved report_data.
 */

import type { Database } from '@/types/supabase';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

export interface PerformanceReportFilters {
  dateFrom: string;
  dateTo: string;
  pair?: string;
  session?: string;
  strategy?: string;
  mood?: string;
}

export interface GroupedStat {
  key: string;
  count: number;
  wins: number;
  totalR: number;
  avgR: number;
  winRatePct: number;
}

export interface BucketStat {
  bucket: string;
  count: number;
  totalR: number;
  avgR: number;
}

export interface RuleFollowedStats {
  followed: { count: number; totalR: number; avgR: number };
  broken: { count: number; totalR: number; avgR: number };
  unknown: { count: number; totalR: number; avgR: number };
}

export interface PerformanceReportData {
  equity_curve: { date: string; cumulativeR: number }[];
  strategy_breakdown: GroupedStat[];
  session_breakdown: GroupedStat[];
  pair_breakdown: GroupedStat[];
  setup_type_breakdown: GroupedStat[];
  timeframe_breakdown: GroupedStat[];
  bias_breakdown: GroupedStat[];
  rule_followed_stats: RuleFollowedStats;
  confidence_breakdown: BucketStat[];
  execution_quality_breakdown: BucketStat[];
  mistake_patterns: { phrase: string; count: number }[];
}

export interface GeneratedPerformanceReport {
  total_trades: number;
  win_rate: number;
  total_r: number;
  avg_r: number;
  best_trade: number;
  worst_trade: number;
  report_data: PerformanceReportData;
}

function parseR(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).trim().replace(/,/g, '').replace(/[Rr]/g, '');
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function buildCumulativeEquity(rows: JournalEntryRow[]): { date: string; cumulativeR: number }[] {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );
  let cum = 0;
  return sorted.map((row) => {
    cum += parseR(row.result_r);
    return { date: row.entry_date, cumulativeR: cum };
  });
}

function groupByField(
  rows: JournalEntryRow[],
  getKey: (row: JournalEntryRow) => string
): GroupedStat[] {
  const map = new Map<string, { count: number; wins: number; totalR: number }>();
  const fallback = '—';
  for (const row of rows) {
    const key = (getKey(row) || '').trim() || fallback;
    const r = parseR(row.result_r);
    let rec = map.get(key);
    if (!rec) {
      rec = { count: 0, wins: 0, totalR: 0 };
      map.set(key, rec);
    }
    rec.count += 1;
    if (r > 0) rec.wins += 1;
    rec.totalR += r;
  }
  return Array.from(map.entries())
    .map(([key, { count, wins, totalR }]) => ({
      key,
      count,
      wins,
      totalR,
      avgR: count > 0 ? totalR / count : 0,
      winRatePct: count > 0 ? (wins / count) * 100 : 0,
    }))
    .sort((a, b) => b.totalR - a.totalR);
}

function extractTopMistakes(
  rows: JournalEntryRow[],
  topN: number
): { phrase: string; count: number }[] {
  const counts: Record<string, number> = {};
  const minLen = 4;
  for (const row of rows) {
    const text = (row.mistakes_made ?? '').trim();
    if (!text) continue;
    const parts = text
      .toLowerCase()
      .split(/[.,;:\n]+/)
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter((s) => s.length >= minLen);
    const seen = new Set<string>();
    for (const p of parts) {
      if (seen.has(p)) continue;
      seen.add(p);
      counts[p] = (counts[p] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

function ruleFollowedStats(rows: JournalEntryRow[]): RuleFollowedStats {
  const followed = { count: 0, totalR: 0, avgR: 0 };
  const broken = { count: 0, totalR: 0, avgR: 0 };
  const unknown = { count: 0, totalR: 0, avgR: 0 };
  for (const row of rows) {
    const r = parseR(row.result_r);
    if (row.rule_followed === true) {
      followed.count += 1;
      followed.totalR += r;
    } else if (row.rule_followed === false) {
      broken.count += 1;
      broken.totalR += r;
    } else {
      unknown.count += 1;
      unknown.totalR += r;
    }
  }
  followed.avgR = followed.count ? followed.totalR / followed.count : 0;
  broken.avgR = broken.count ? broken.totalR / broken.count : 0;
  unknown.avgR = unknown.count ? unknown.totalR / unknown.count : 0;
  return { followed, broken, unknown };
}

function bucketByScore(
  rows: JournalEntryRow[],
  getScore: (r: JournalEntryRow) => number | null
): BucketStat[] {
  const buckets: Record<string, { count: number; totalR: number }> = {
    '1-3': { count: 0, totalR: 0 },
    '4-6': { count: 0, totalR: 0 },
    '7-10': { count: 0, totalR: 0 },
    'No score': { count: 0, totalR: 0 },
  };
  for (const row of rows) {
    const score = getScore(row);
    const r = parseR(row.result_r);
    let key: string;
    if (score == null || !Number.isFinite(score)) key = 'No score';
    else if (score <= 3) key = '1-3';
    else if (score <= 6) key = '4-6';
    else key = '7-10';
    buckets[key].count += 1;
    buckets[key].totalR += r;
  }
  return (['1-3', '4-6', '7-10', 'No score'] as const).map((bucket) => ({
    bucket,
    count: buckets[bucket].count,
    totalR: buckets[bucket].totalR,
    avgR: buckets[bucket].count ? buckets[bucket].totalR / buckets[bucket].count : 0,
  }));
}

/**
 * Generate a full performance report from filtered journal entry rows.
 * Filters are not applied here; pass already-filtered rows. Filters are for metadata (date_from/date_to) when saving.
 */
export function generatePerformanceReport(
  rows: JournalEntryRow[],
  _filters: PerformanceReportFilters
): GeneratedPerformanceReport {
  const n = rows.length;
  const rValues = rows.map((r) => parseR(r.result_r));
  const totalR = rValues.reduce((s, v) => s + v, 0);
  const wins = rValues.filter((v) => v > 0).length;
  const maxR = n ? Math.max(...rValues) : 0;
  const minR = n ? Math.min(...rValues) : 0;

  const report_data: PerformanceReportData = {
    equity_curve: buildCumulativeEquity(rows),
    strategy_breakdown: groupByField(rows, (r) => r.strategy_used ?? ''),
    session_breakdown: groupByField(rows, (r) => r.session ?? ''),
    pair_breakdown: groupByField(rows, (r) => r.pair ?? ''),
    setup_type_breakdown: groupByField(rows, (r) => r.setup_type ?? ''),
    timeframe_breakdown: groupByField(rows, (r) => r.timeframe ?? ''),
    bias_breakdown: groupByField(rows, (r) => r.bias ?? ''),
    rule_followed_stats: ruleFollowedStats(rows),
    confidence_breakdown: bucketByScore(rows, (r) => {
      const s = r.confidence_score;
      return s != null && Number.isFinite(s) ? s : null;
    }),
    execution_quality_breakdown: bucketByScore(rows, (r) => {
      const s = r.execution_quality;
      return s != null && Number.isFinite(s) ? s : null;
    }),
    mistake_patterns: extractTopMistakes(rows, 5),
  };

  return {
    total_trades: n,
    win_rate: n ? (wins / n) * 100 : 0,
    total_r: totalR,
    avg_r: n ? totalR / n : 0,
    best_trade: maxR,
    worst_trade: minR,
    report_data,
  };
}
