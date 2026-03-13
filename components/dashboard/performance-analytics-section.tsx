'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseClient } from '@/lib/supabase/client';
import { generatePerformanceReport } from '@/lib/dashboard/performance-report-generator';
import type { Database } from '@/types/supabase';
import {
  ChartBarIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrophyIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon,
  Square3Stack3DIcon,
  ScaleIcon,
  CheckCircleIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline';

const ALL_FILTER = '';

export interface PerformanceFilters {
  dateFrom: string;
  dateTo: string;
  pair: string;
  session: string;
  strategy: string;
  mood: string;
}

const DEFAULT_FILTERS: PerformanceFilters = {
  dateFrom: '',
  dateTo: '',
  pair: ALL_FILTER,
  session: ALL_FILTER,
  strategy: ALL_FILTER,
  mood: ALL_FILTER,
};
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

// ——— Helpers ———

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

export interface GroupedStat {
  key: string;
  count: number;
  wins: number;
  totalR: number;
  avgR: number;
  winRatePct: number;
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

function extractTopMistakes(rows: JournalEntryRow[], topN: number): { phrase: string; count: number }[] {
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

function applyFilters(rows: JournalEntryRow[], filters: PerformanceFilters): JournalEntryRow[] {
  return rows.filter((row) => {
    if (filters.dateFrom) {
      if (row.entry_date < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      if (row.entry_date > filters.dateTo) return false;
    }
    if (filters.pair !== ALL_FILTER) {
      const rowPair = (row.pair ?? '').trim();
      if (rowPair !== filters.pair) return false;
    }
    if (filters.session !== ALL_FILTER) {
      const rowSession = (row.session ?? '').trim();
      if (rowSession !== filters.session) return false;
    }
    if (filters.strategy !== ALL_FILTER) {
      const rowStrategy = (row.strategy_used ?? '').trim();
      if (rowStrategy !== filters.strategy) return false;
    }
    if (filters.mood !== ALL_FILTER) {
      const rowMood = (row.mood ?? '').trim();
      if (rowMood !== filters.mood) return false;
    }
    return true;
  });
}

function uniqueSorted(values: string[]): string[] {
  const set = new Set(values.filter((s) => (s ?? '').trim() !== ''));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function ruleFollowedStats(rows: JournalEntryRow[]): {
  followed: { count: number; totalR: number; avgR: number };
  broken: { count: number; totalR: number; avgR: number };
  unknown: { count: number; totalR: number; avgR: number };
} {
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

type BucketStat = { bucket: string; count: number; totalR: number; avgR: number };

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

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-gray-400">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 min-w-[120px] cursor-pointer"
      >
        <option value={ALL_FILTER}>All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ——— Component ———

export function PerformanceAnalyticsSection() {
  const [rows, setRows] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PerformanceFilters>(DEFAULT_FILTERS);
  const [generatingReport, setGeneratingReport] = useState(false);
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { toast } = useToast();
  const router = useRouter();

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const filterOptions = useMemo(() => {
    const pairs = uniqueSorted(rows.map((r) => r.pair ?? '').filter(Boolean));
    const sessions = uniqueSorted(rows.map((r) => r.session ?? '').filter(Boolean));
    const strategies = uniqueSorted(rows.map((r) => r.strategy_used ?? '').filter(Boolean));
    const moods = uniqueSorted(rows.map((r) => r.mood ?? '').filter(Boolean));
    return { pairs, sessions, strategies, moods };
  }, [rows]);

  const filteredRows = useMemo(
    () => applyFilters(rows, filters),
    [rows, filters]
  );

  const hasActiveFilters =
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.pair !== ALL_FILTER ||
    filters.session !== ALL_FILTER ||
    filters.strategy !== ALL_FILTER ||
    filters.mood !== ALL_FILTER;

  const fetchEntries = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoadError(null);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: true });
    if (error) {
      setLoadError(error.message);
      setRows([]);
    } else {
      setRows((data as JournalEntryRow[] | null) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const metrics = useMemo(() => {
    const n = filteredRows.length;
    const rValues = filteredRows.map((r) => parseR(r.result_r));
    const totalR = rValues.reduce((s, v) => s + v, 0);
    const wins = rValues.filter((v) => v > 0).length;
    const maxR = n ? Math.max(...rValues) : 0;
    const minR = n ? Math.min(...rValues) : 0;
    return {
      totalTrades: n,
      winRatePct: n ? (wins / n) * 100 : 0,
      totalR,
      avgR: n ? totalR / n : 0,
      bestTrade: maxR,
      worstTrade: minR,
    };
  }, [filteredRows]);

  const equityData = useMemo(() => buildCumulativeEquity(filteredRows), [filteredRows]);
  const byStrategy = useMemo(() => groupByField(filteredRows, (r) => r.strategy_used ?? ''), [filteredRows]);
  const bySession = useMemo(() => groupByField(filteredRows, (r) => r.session ?? ''), [filteredRows]);
  const byPair = useMemo(() => groupByField(filteredRows, (r) => r.pair ?? ''), [filteredRows]);
  const bySetupType = useMemo(
    () => groupByField(filteredRows, (r) => r.setup_type ?? ''),
    [filteredRows]
  );
  const byTimeframe = useMemo(
    () => groupByField(filteredRows, (r) => r.timeframe ?? ''),
    [filteredRows]
  );
  const byBias = useMemo(
    () => groupByField(filteredRows, (r) => r.bias ?? ''),
    [filteredRows]
  );
  const ruleFollowed = useMemo(() => ruleFollowedStats(filteredRows), [filteredRows]);
  const avgRByConfidence = useMemo(
    () =>
      bucketByScore(filteredRows, (r) => {
        const s = r.confidence_score;
        return s != null && Number.isFinite(s) ? s : null;
      }),
    [filteredRows]
  );
  const avgRByExecution = useMemo(
    () =>
      bucketByScore(filteredRows, (r) => {
        const s = r.execution_quality;
        return s != null && Number.isFinite(s) ? s : null;
      }),
    [filteredRows]
  );
  const topMistakes = useMemo(() => extractTopMistakes(filteredRows, 5), [filteredRows]);
  const recentTrades = useMemo(() => {
    const byDate = [...filteredRows].sort(
      (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
    return byDate.slice(0, 5);
  }, [filteredRows]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Trading metrics, win rate, R-multiples, and equity curve from your journal entries.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-400 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Trading metrics, win rate, R-multiples, and equity curve from your journal entries.
          </p>
        </div>
        <Card className="border-red-500/30 bg-red-500/5 rounded-xl">
          <CardContent className="p-6">
            <p className="text-red-200 text-sm">Could not load journal data: {loadError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Trading metrics, win rate, R-multiples, and equity curve from your journal entries.
          </p>
        </div>
        <Card className="border-white/10 bg-white/5 rounded-xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[280px] text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-500 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">No journal entries yet</h2>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Add trades in the Growth Journal to see performance metrics, equity curve, and
              breakdowns here.
            </p>
            <Link
              href="/dashboard?section=journal"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-gold-400 transition"
            >
              <BookOpenIcon className="h-5 w-5" />
              Open Growth Journal
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatR = (v: number) => (v >= 0 ? `+${v}` : String(v));
  const formatPct = (v: number) => `${v.toFixed(1)}%`;

  const handleFilterChange = useCallback(<K extends keyof PerformanceFilters>(
    key: K,
    value: PerformanceFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerateReport = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return;
    }
    if (filteredRows.length === 0) {
      toast({ title: 'No data to report', description: 'Add journal entries or adjust filters.', variant: 'destructive' });
      return;
    }
    setGeneratingReport(true);
    try {
      const report = generatePerformanceReport(filteredRows, filters);
      const { error } = await supabase.from('performance_reports').insert({
        user_id: user.id,
        report_type: 'custom',
        title: 'Performance Report',
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
        total_trades: report.total_trades,
        win_rate: report.win_rate,
        total_r: report.total_r,
        avg_r: report.avg_r,
        best_trade: report.best_trade,
        worst_trade: report.worst_trade,
        report_data: report.report_data as unknown as Record<string, unknown>,
      });
      if (error) throw error;
      toast({ title: 'Report saved' });
      router.replace('/dashboard?section=reports');
    } catch (e) {
      toast({
        title: 'Failed to save report',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReport(false);
    }
  }, [supabase, filteredRows, filters, toast, router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Trading metrics, win rate, R-multiples, and equity curve from your journal entries.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleGenerateReport}
          disabled={generatingReport || filteredRows.length === 0}
          className="shrink-0 inline-flex items-center gap-2 bg-gold-500 text-black font-semibold hover:bg-gold-400 disabled:opacity-50"
        >
          <DocumentPlusIcon className="h-5 w-5" />
          {generatingReport ? 'Saving…' : 'Generate Report'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-white/5 rounded-xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gold-400" />
              Filters
              {filteredRows.length < rows.length && (
                <span className="text-xs font-normal text-gray-400">
                  Showing {filteredRows.length} of {rows.length} entries
                </span>
              )}
            </h2>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10"
                onClick={clearFilters}
              >
                <XMarkIcon className="h-4 w-4 mr-1.5" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="pa-date-from" className="text-xs text-gray-400">Date from</label>
              <input
                id="pa-date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 min-w-[140px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="pa-date-to" className="text-xs text-gray-400">Date to</label>
              <input
                id="pa-date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 min-w-[140px]"
              />
            </div>
            <FilterSelect
              id="pa-pair"
              label="Pair"
              value={filters.pair}
              options={filterOptions.pairs}
              onChange={(v) => handleFilterChange('pair', v)}
            />
            <FilterSelect
              id="pa-session"
              label="Session"
              value={filters.session}
              options={filterOptions.sessions}
              onChange={(v) => handleFilterChange('session', v)}
            />
            <FilterSelect
              id="pa-strategy"
              label="Strategy"
              value={filters.strategy}
              options={filterOptions.strategies}
              onChange={(v) => handleFilterChange('strategy', v)}
            />
            <FilterSelect
              id="pa-mood"
              label="Mood"
              value={filters.mood}
              options={filterOptions.moods}
              onChange={(v) => handleFilterChange('mood', v)}
            />
          </div>
        </CardContent>
      </Card>

      {hasActiveFilters && filteredRows.length === 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
          No entries match the current filters. Clear filters or adjust your selection.
        </div>
      )}

      {/* Metrics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total trades</p>
            <p className="text-2xl font-bold text-white mt-1">{metrics.totalTrades}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Win rate</p>
            <p className="text-2xl font-bold text-white mt-1">{formatPct(metrics.winRatePct)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total R</p>
            <p className="text-2xl font-bold text-white mt-1">{formatR(metrics.totalR)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Avg R</p>
            <p className="text-2xl font-bold text-white mt-1">{formatR(metrics.avgR)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> Best
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{formatR(metrics.bestTrade)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowTrendingDownIcon className="h-3.5 w-3.5" /> Worst
            </p>
            <p className="text-2xl font-bold text-red-400 mt-1">{formatR(metrics.worstTrade)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Equity curve */}
      <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-gold-400" />
            Equity curve
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={equityData}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                  tickFormatter={(v: unknown) => new Date(typeof v === 'string' ? v : String(v ?? '')).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                  tickFormatter={(v: number) => `${v}R`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 15, 28, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#d1d5db' }}
                  formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value}R`, 'Cumulative R']}
                  labelFormatter={(label: unknown) =>
                    typeof label === 'string' ? new Date(label).toLocaleDateString() : String(label ?? '')
                  }
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="cumulativeR"
                  stroke="#EAB308"
                  strokeWidth={2}
                  dot={false}
                  name="Cumulative R"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown tables */}
      <div className="grid lg:grid-cols-3 gap-6">
        <BreakdownCard
          title="Strategy"
          icon={<CubeIcon className="h-5 w-5 text-gold-400" />}
          stats={byStrategy}
          formatR={formatR}
          formatPct={formatPct}
        />
        <BreakdownCard
          title="Session"
          icon={<ClockIcon className="h-5 w-5 text-gold-400" />}
          stats={bySession}
          formatR={formatR}
          formatPct={formatPct}
        />
        <BreakdownCard
          title="Pair / Market"
          icon={<TrophyIcon className="h-5 w-5 text-gold-400" />}
          stats={byPair}
          formatR={formatR}
          formatPct={formatPct}
        />
      </div>

      {/* Setup type, Timeframe, Bias breakdowns */}
      <div className="grid lg:grid-cols-3 gap-6">
        <BreakdownCard
          title="Setup type"
          icon={<Square3Stack3DIcon className="h-5 w-5 text-gold-400" />}
          stats={bySetupType}
          formatR={formatR}
          formatPct={formatPct}
        />
        <BreakdownCard
          title="Timeframe"
          icon={<ClockIcon className="h-5 w-5 text-gold-400" />}
          stats={byTimeframe}
          formatR={formatR}
          formatPct={formatPct}
        />
        <BreakdownCard
          title="Bias"
          icon={<ScaleIcon className="h-5 w-5 text-gold-400" />}
          stats={byBias}
          formatR={formatR}
          formatPct={formatPct}
        />
      </div>

      {/* Rule followed + Score buckets */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-gold-400" />
              Rule followed vs Rule broken
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-2 pr-2 font-medium">—</th>
                  <th className="pb-2 pr-2 font-medium text-right">Trades</th>
                  <th className="pb-2 pr-2 font-medium text-right">Total R</th>
                  <th className="pb-2 font-medium text-right">Avg R</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-2 text-emerald-400 font-medium">Followed</td>
                  <td className="py-2 pr-2 text-right text-gray-300">{ruleFollowed.followed.count}</td>
                  <td className="py-2 pr-2 text-right font-medium text-emerald-400">{formatR(ruleFollowed.followed.totalR)}</td>
                  <td className="py-2 text-right font-medium text-emerald-400/90">{formatR(ruleFollowed.followed.avgR)}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-2 text-amber-400 font-medium">Broken</td>
                  <td className="py-2 pr-2 text-right text-gray-300">{ruleFollowed.broken.count}</td>
                  <td className="py-2 pr-2 text-right font-medium text-amber-400">{formatR(ruleFollowed.broken.totalR)}</td>
                  <td className="py-2 text-right font-medium text-amber-400/90">{formatR(ruleFollowed.broken.avgR)}</td>
                </tr>
                {ruleFollowed.unknown.count > 0 && (
                  <tr className="border-b border-white/5">
                    <td className="py-2 pr-2 text-gray-500 font-medium">Unknown</td>
                    <td className="py-2 pr-2 text-right text-gray-300">{ruleFollowed.unknown.count}</td>
                    <td className="py-2 pr-2 text-right font-medium text-gray-400">{formatR(ruleFollowed.unknown.totalR)}</td>
                    <td className="py-2 text-right font-medium text-gray-400">{formatR(ruleFollowed.unknown.avgR)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white">Avg R by confidence</h2>
          </CardHeader>
          <CardContent className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-2 pr-2 font-medium">Bucket</th>
                  <th className="pb-2 pr-2 font-medium text-right">Trades</th>
                  <th className="pb-2 font-medium text-right">Avg R</th>
                </tr>
              </thead>
              <tbody>
                {avgRByConfidence.map(({ bucket, count, avgR }) => (
                  <tr key={bucket} className="border-b border-white/5 last:border-0">
                    <td className="py-2 pr-2 text-gray-200">{bucket}</td>
                    <td className="py-2 pr-2 text-right text-gray-300">{count}</td>
                    <td className={`py-2 text-right font-medium ${avgR >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}`}>{formatR(avgR)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white">Avg R by execution quality</h2>
          </CardHeader>
          <CardContent className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-2 pr-2 font-medium">Bucket</th>
                  <th className="pb-2 pr-2 font-medium text-right">Trades</th>
                  <th className="pb-2 font-medium text-right">Avg R</th>
                </tr>
              </thead>
              <tbody>
                {avgRByExecution.map(({ bucket, count, avgR }) => (
                  <tr key={bucket} className="border-b border-white/5 last:border-0">
                    <td className="py-2 pr-2 text-gray-200">{bucket}</td>
                    <td className="py-2 pr-2 text-right text-gray-300">{count}</td>
                    <td className={`py-2 text-right font-medium ${avgR >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}`}>{formatR(avgR)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Mistake patterns + Recent performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
              Top mistake patterns
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            {topMistakes.length === 0 ? (
              <p className="text-gray-500 text-sm">No mistake phrases recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {topMistakes.map(({ phrase, count }, i) => (
                  <li key={i} className="flex justify-between items-baseline gap-2 text-sm">
                    <span className="text-gray-200 truncate" title={phrase}>
                      {phrase}
                    </span>
                    <span className="text-gray-500 shrink-0">×{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white">Recent performance</h2>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {recentTrades.map((row) => {
                const r = parseR(row.result_r);
                return (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-gray-500 shrink-0">
                      {new Date(row.entry_date).toLocaleDateString()}
                    </span>
                    <span className="text-white font-medium truncate min-w-0" title={row.title}>
                      {row.title || 'Untitled'}
                    </span>
                    {row.pair && (
                      <span className="text-gray-400">{row.pair}</span>
                    )}
                    {row.strategy_used && (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-xs">
                        {row.strategy_used}
                      </span>
                    )}
                    <span
                      className={
                        r >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'
                      }
                    >
                      {formatR(r)} R
                    </span>
                    {row.mood && (
                      <span className="text-gray-500 text-xs">{row.mood}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  icon,
  stats,
  formatR,
  formatPct,
}: {
  title: string;
  icon: React.ReactNode;
  stats: GroupedStat[];
  formatR: (v: number) => string;
  formatPct: (v: number) => string;
}) {
  if (stats.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {icon}
            {title} breakdown
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-500 text-sm">No data to show.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-white/10 pb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          {icon}
          {title} breakdown
        </h2>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="pb-2 pr-2 font-medium">{title}</th>
                <th className="pb-2 pr-2 font-medium text-right">Trades</th>
                <th className="pb-2 pr-2 font-medium text-right">Win %</th>
                <th className="pb-2 pr-2 font-medium text-right">Total R</th>
                <th className="pb-2 font-medium text-right">Avg R</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.key} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-2 text-gray-200 truncate max-w-[120px]" title={s.key}>
                    {s.key}
                  </td>
                  <td className="py-2 pr-2 text-right text-gray-300">{s.count}</td>
                  <td className="py-2 pr-2 text-right text-gray-300">{formatPct(s.winRatePct)}</td>
                  <td
                    className={`py-2 pr-2 text-right font-medium ${
                      s.totalR >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatR(s.totalR)}
                  </td>
                  <td
                    className={`py-2 text-right font-medium ${
                      s.avgR >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'
                    }`}
                  >
                    {formatR(s.avgR)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
