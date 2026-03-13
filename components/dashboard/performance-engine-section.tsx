'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  computePerformanceMetrics,
  type PerformanceMetricsResult,
} from '@/lib/dashboard/performance-metrics';
import {
  ChartBarIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

const ALL_FILTER = '';

interface Filters {
  dateFrom: string;
  dateTo: string;
  pair: string;
  session: string;
  strategy: string;
  mood: string;
}

const DEFAULT_FILTERS: Filters = {
  dateFrom: '',
  dateTo: '',
  pair: ALL_FILTER,
  session: ALL_FILTER,
  strategy: ALL_FILTER,
  mood: ALL_FILTER,
};

function parseR(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).trim().replace(/,/g, '').replace(/[Rr]/g, '');
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function applyFilters(rows: JournalEntryRow[], filters: Filters): JournalEntryRow[] {
  return rows.filter((row) => {
    if (filters.dateFrom && row.entry_date < filters.dateFrom) return false;
    if (filters.dateTo && row.entry_date > filters.dateTo) return false;
    if (filters.pair !== ALL_FILTER && (row.pair ?? '').trim() !== filters.pair) return false;
    if (filters.session !== ALL_FILTER && (row.session ?? '').trim() !== filters.session)
      return false;
    if (filters.strategy !== ALL_FILTER && (row.strategy_used ?? '').trim() !== filters.strategy)
      return false;
    if (filters.mood !== ALL_FILTER && (row.mood ?? '').trim() !== filters.mood) return false;
    return true;
  });
}

function uniqueSorted(values: string[]): string[] {
  const set = new Set(values.filter((s) => (s ?? '').trim() !== ''));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function formatR(v: number): string {
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}

export function PerformanceEngineSection() {
  const [rows, setRows] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const supabase = useMemo(() => createSupabaseClient(), []);

  const fetchData = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setError(null);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: true });
    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data as JournalEntryRow[] | null) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterOptions = useMemo(() => {
    const pairs = uniqueSorted(rows.map((r) => r.pair ?? '').filter(Boolean));
    const sessions = uniqueSorted(rows.map((r) => r.session ?? '').filter(Boolean));
    const strategies = uniqueSorted(rows.map((r) => r.strategy_used ?? '').filter(Boolean));
    const moods = uniqueSorted(rows.map((r) => r.mood ?? '').filter(Boolean));
    return { pairs, sessions, strategies, moods };
  }, [rows]);

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const metrics: PerformanceMetricsResult = useMemo(
    () => computePerformanceMetrics(filteredRows),
    [filteredRows]
  );

  const hasActiveFilters =
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.pair !== ALL_FILTER ||
    filters.session !== ALL_FILTER ||
    filters.strategy !== ALL_FILTER ||
    filters.mood !== ALL_FILTER;

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Performance Engine</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Equity curve, drawdown, profit factor, and expectancy from your journal.
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-panel p-8 flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Performance Engine</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Equity curve, drawdown, profit factor, and expectancy from your journal.
          </p>
        </div>
        <Card className="border-red-500/30 bg-red-500/5 rounded-xl">
          <CardContent className="p-6">
            <p className="text-red-200 text-sm">Could not load data: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Performance Engine</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Equity curve, drawdown, profit factor, and expectancy from your journal.
          </p>
        </div>
        <Card className="border-border-subtle bg-panel rounded-xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[280px] text-center">
            <ChartBarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">No journal data yet</h2>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Add trades in the Growth Journal with result (R) to see equity curve, drawdown, and
              performance metrics.
            </p>
            <Link
              href="/dashboard?section=journal"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent-hover transition"
            >
              <BookOpenIcon className="h-5 w-5" />
              Open Growth Journal
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartMargin = { top: 8, right: 8, left: 8, bottom: 8 };
  const gridStroke = 'rgba(255,255,255,0.06)';
  const axisStroke = 'rgba(255,255,255,0.1)';
  const tooltipStyle = {
    backgroundColor: 'rgba(10, 15, 28, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Performance Engine</h1>
        <p className="mt-1 text-muted-foreground text-sm sm:text-base">
          Equity curve, drawdown, profit factor, and expectancy from your journal.
        </p>
      </div>

      {/* Filters */}
      <Card className="border-border-subtle bg-panel rounded-xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-primary" />
              Filters
              {filteredRows.length < rows.length && (
                <span className="text-xs font-normal text-muted-foreground">
                  Showing {filteredRows.length} of {rows.length} entries
                </span>
              )}
            </h2>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
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
              <label htmlFor="pe-date-from" className="text-xs text-muted-foreground">Date from</label>
              <input
                id="pe-date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="pe-date-to" className="text-xs text-muted-foreground">Date to</label>
              <input
                id="pe-date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="pe-pair" className="text-xs text-muted-foreground">Pair</label>
              <select
                id="pe-pair"
                value={filters.pair}
                onChange={(e) => handleFilterChange('pair', e.target.value)}
                className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value={ALL_FILTER}>All</option>
                {filterOptions.pairs.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="pe-session" className="text-xs text-muted-foreground">Session</label>
              <select
                id="pe-session"
                value={filters.session}
                onChange={(e) => handleFilterChange('session', e.target.value)}
                className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value={ALL_FILTER}>All</option>
                {filterOptions.sessions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasActiveFilters && filteredRows.length === 0 && (
        <div className="rounded-xl border border-primary/20 bg-accent-muted px-4 py-3 text-sm text-primary">
          No entries match the current filters. Clear filters or adjust your selection.
        </div>
      )}

      {filteredRows.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total R</p>
                <p className={`text-2xl font-bold mt-1 ${metrics.totalR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatR(metrics.totalR)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Profit factor</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {metrics.profitFactor != null ? metrics.profitFactor.toFixed(2) : '—'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Expectancy</p>
                <p className={`text-2xl font-bold mt-1 ${metrics.expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatR(metrics.expectancy)} <span className="text-sm font-normal text-muted-foreground">/ trade</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Max drawdown</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {metrics.maxDrawdown > 0 ? `-${metrics.maxDrawdown.toFixed(1)}R` : '0'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Avg win</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {metrics.averageWin != null ? formatR(metrics.averageWin) : '—'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Avg loss</p>
                <p className="text-lg font-semibold text-red-400">
                  {metrics.averageLoss != null ? formatR(metrics.averageLoss) : '—'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Win streak</p>
                <p className="text-lg font-semibold text-white">{metrics.largestWinningStreak}</p>
              </CardContent>
            </Card>
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Loss streak</p>
                <p className="text-lg font-semibold text-white">{metrics.largestLosingStreak}</p>
              </CardContent>
            </Card>
            <Card className="border-border-subtle bg-panel rounded-xl">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Risk consistency</p>
                <p className="text-lg font-semibold text-white">{metrics.riskConsistency}</p>
              </CardContent>
            </Card>
          </div>

          {/* Equity curve */}
          <Card className="border-border-subtle bg-panel rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border-subtle pb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-primary" />
                Equity curve (cumulative R)
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.equityCurve} margin={chartMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={{ stroke: axisStroke }}
                      tickLine={{ stroke: axisStroke }}
                      tickFormatter={(v: unknown) =>
                        new Date(typeof v === 'string' ? v : String(v ?? '')).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={{ stroke: axisStroke }}
                      tickLine={{ stroke: axisStroke }}
                      tickFormatter={(v: number) => `${v}R`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(l: unknown) =>
                        typeof l === 'string' ? new Date(l).toLocaleDateString() : String(l ?? '')
                      }
                      formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value}R`, 'Cumulative R']}
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

          {/* Drawdown curve */}
          <Card className="border-border-subtle bg-panel rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border-subtle pb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
                Drawdown curve
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.drawdownCurve} margin={chartMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={{ stroke: axisStroke }}
                      tickLine={{ stroke: axisStroke }}
                      tickFormatter={(v: unknown) =>
                        new Date(typeof v === 'string' ? v : String(v ?? '')).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={{ stroke: axisStroke }}
                      tickLine={{ stroke: axisStroke }}
                      tickFormatter={(v: number) => `-${v}R`}
                      domain={['auto', 0]}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(l: unknown) =>
                        typeof l === 'string' ? new Date(l).toLocaleDateString() : String(l ?? '')
                      }
                      formatter={(value: number) => [`-${value}R`, 'Drawdown']}
                    />
                    <Line
                      type="monotone"
                      dataKey="drawdown"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Drawdown"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly R */}
          {metrics.monthlyR.length > 0 && (
            <Card className="border-border-subtle bg-panel rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border-subtle pb-4">
                <h2 className="text-lg font-semibold text-white">Monthly R performance</h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.monthlyR} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        axisLine={{ stroke: axisStroke }}
                        tickLine={{ stroke: axisStroke }}
                        tickFormatter={(v: unknown) => {
                          const s = typeof v === 'string' ? v : String(v ?? '');
                          const [y, m] = s.split('-');
                          return m && y ? `${m}/${y.slice(2)}` : s;
                        }}
                      />
                      <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        axisLine={{ stroke: axisStroke }}
                        tickLine={{ stroke: axisStroke }}
                        tickFormatter={(v: number) => `${v}R`}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelFormatter={(l: unknown) => String(l ?? '')}
                        formatter={(value: number, _name: string, props: { payload?: { trades?: number; winRatePct?: number } }) => {
                          const p = props?.payload;
                          const extra =
                            p && typeof p.trades === 'number'
                              ? ` (${p.trades} trades${typeof p.winRatePct === 'number' ? `, ${p.winRatePct.toFixed(0)}% win` : ''})`
                              : '';
                          return [
                            `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)}R${extra}`,
                            'Total R',
                          ];
                        }}
                      />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                      <Bar
                        dataKey="totalR"
                        fill="#EAB308"
                        radius={[4, 4, 0, 0]}
                        name="Total R"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/dashboard?section=journal"
          className="inline-flex items-center gap-2 text-primary hover:text-accent-hover"
        >
          <BookOpenIcon className="h-4 w-4" />
          Growth Journal
        </Link>
        <Link
          href="/dashboard?section=analytics"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChartBarIcon className="h-4 w-4" />
          Performance Analytics
        </Link>
      </div>
    </div>
  );
}
