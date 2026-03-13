'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { generateCoachOutput } from '@/lib/dashboard/ai-coach-insights';
import { computeConsistencyScores, type ConsistencyScores } from '@/lib/dashboard/consistency-scores';
import {
  computePerformanceMetrics,
  type PerformanceMetricsResult,
} from '@/lib/dashboard/performance-metrics';
import {
  generatePerformanceReport,
  type PerformanceReportData,
  type GroupedStat,
} from '@/lib/dashboard/performance-report-generator';
import { buildTodaysFocus } from '@/lib/dashboard/terminal-focus';
import {
  ChartBarIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
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
} from 'recharts';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];
type PerformanceReportRow = Database['public']['Tables']['performance_reports']['Row'];

function parseR(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).trim().replace(/,/g, '').replace(/[Rr]/g, '');
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatR(v: number): string {
  return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
}

// —— Panel: Today's Focus ———————————————————————————————————————————————————
function TodaysFocusPanel({ points }: { points: string[] }) {
  return (
    <Card className="rounded-xl border border-primary/20 bg-accent-muted overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Cog6ToothIcon className="h-4 w-4" />
          Today&apos;s Focus
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <ul className="space-y-2">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="text-primary shrink-0">▸</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// —— Panel: AI Coach Summary ————————————————————————————————————————————————
function AICoachSummaryPanel({
  summary,
  nextActions,
}: {
  summary: string;
  nextActions: string[];
}) {
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-primary" />
          AI Coach Summary
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <p className="text-sm text-foreground/80 leading-snug">{summary}</p>
        {nextActions.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Next actions</p>
            <ul className="space-y-1">
              {nextActions.slice(0, 3).map((a, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// —— Panel: Equity Curve ————————————————————————————————————————————————————
function EquityCurvePanel({ curve }: { curve: { date: string; cumulativeR: number }[] }) {
  if (!curve.length) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Equity Curve
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 h-[120px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No trade data yet</p>
        </CardContent>
      </Card>
    );
  }
  const data = curve.map((c) => ({
    date: c.date.slice(0, 10),
    r: c.cumulativeR,
  }));
  const strokeColor = data[data.length - 1]?.r >= 0 ? '#10b981' : '#f59e0b';
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Equity Curve
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(v: unknown) =>
                new Date(typeof v === 'string' ? v : String(v ?? '')).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(v: unknown) => `${Number(v)}R`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              labelFormatter={(l: unknown) => String(l ?? '')}
              formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value}R`, 'Cumulative R']}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
            <Line
              type="monotone"
              dataKey="r"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              name="Cumulative R"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// —— Panel: Drawdown Snapshot ———————————————————————————————————————————————
function DrawdownPanel({ perf }: { perf: PerformanceMetricsResult | null }) {
  if (!perf || perf.totalTrades === 0) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Drawdown
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-muted-foreground text-sm">—</p>
        </CardContent>
      </Card>
    );
  }
  const current =
    perf.drawdownCurve.length > 0
      ? perf.drawdownCurve[perf.drawdownCurve.length - 1]?.drawdown ?? 0
      : 0;
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Drawdown
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-foreground">
            {perf.maxDrawdown > 0 ? `-${perf.maxDrawdown.toFixed(1)}` : '0'}R
          </span>
          <span className="text-xs text-muted-foreground">max</span>
        </div>
        {current > 0 && (
          <p className="text-xs text-primary mt-1">Current: -{current.toFixed(1)}R</p>
        )}
      </CardContent>
    </Card>
  );
}

// —— Panel: Key Performance Metrics —————————————————————————————————────────
function KeyMetricsPanel({ perf }: { perf: PerformanceMetricsResult | null }) {
  if (!perf || perf.totalTrades === 0) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Key Metrics
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-muted-foreground text-sm">Log trades to see metrics.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Key Metrics
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Total R</dt>
          <dd className={`font-medium text-right ${perf.totalR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatR(perf.totalR)}
          </dd>
          <dt className="text-muted-foreground">Win rate</dt>
          <dd className="text-right font-medium text-foreground">{perf.winRatePct.toFixed(0)}%</dd>
          <dt className="text-muted-foreground">Expectancy</dt>
          <dd className={`text-right font-medium ${perf.expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatR(perf.expectancy)}/trade
          </dd>
          <dt className="text-muted-foreground">Profit factor</dt>
          <dd className="text-right font-medium text-foreground">
            {perf.profitFactor != null ? perf.profitFactor.toFixed(1) : '—'}
          </dd>
        </dl>
      </CardContent>
    </Card>
  );
}

// —— Panel: Best Setup ——————————————————————————————————————————————————————
function BestSetupPanel({ setup }: { setup: GroupedStat | null }) {
  if (!setup || setup.count < 2) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Best Setup
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-muted-foreground text-sm">Need more data</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-emerald-200/90 uppercase tracking-wider">
          Best Setup
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className="font-semibold text-foreground">{setup.key}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {setup.count} trades · {setup.winRatePct.toFixed(0)}% win · {formatR(setup.avgR)} avg
        </p>
      </CardContent>
    </Card>
  );
}

// —— Panel: Biggest Leak —————————————————————————————————————————————————————
function BiggestLeakPanel({
  mistake,
  ruleBrokenWorse,
}: {
  mistake: { phrase: string; count: number } | null;
  ruleBrokenWorse: boolean;
}) {
  const hasMistake = mistake && mistake.count >= 2;
  const hasLeak = hasMistake || ruleBrokenWorse;
  if (!hasLeak) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Biggest Leak
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-muted-foreground text-sm">None identified yet</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-xl border border-primary/20 bg-accent-muted overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Biggest Leak
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {hasMistake && (
          <p className="text-sm text-foreground/90">
            &quot;{mistake!.phrase.slice(0, 60)}{mistake!.phrase.length > 60 ? '…' : ''}&quot; ({mistake!.count}×)
          </p>
        )}
        {ruleBrokenWorse && (
          <p className="text-sm text-foreground/90 mt-1">Rule-broken trades underperform. Reduce breaks.</p>
        )}
      </CardContent>
    </Card>
  );
}

// —— Panel: Discipline Score —————————————————————————————————————————————————
function DisciplineScorePanel({ score }: { score: number | null }) {
  const color =
    score == null ? 'text-muted-foreground' : score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-primary' : 'text-primary/80';
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Discipline
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className={`text-2xl font-bold ${color}`}>{score != null ? score : '—'}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Rule-following score 0–100</p>
      </CardContent>
    </Card>
  );
}

// —— Panel: Consistency Score ————————————————————————————————————————————————
function ConsistencyScorePanel({ score }: { score: number | null }) {
  const color =
    score == null ? 'text-muted-foreground' : score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-primary' : 'text-primary/80';
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Consistency
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className={`text-2xl font-bold ${color}`}>{score != null ? score : '—'}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Process consistency 0–100</p>
      </CardContent>
    </Card>
  );
}

// —— Panel: Recent Trades ————————————————————————————————————————————————————
function RecentTradesPanel({
  entries,
  onOpenJournal,
}: {
  entries: JournalEntryRow[];
  onOpenJournal: () => void;
}) {
  const recent = entries.slice(0, 5);
  if (recent.length === 0) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Recent Trades
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-muted-foreground text-sm">No trades yet</p>
          <Button variant="link" className="text-primary text-xs mt-2 p-0 h-auto" onClick={onOpenJournal}>
            Add journal entry
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Recent Trades
        </h2>
        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={onOpenJournal}>
          View all
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <ul className="space-y-2">
          {recent.map((e) => {
            const r = parseR(e.result_r);
            return (
              <li key={e.id} className="flex justify-between items-center text-sm">
                <span className="text-foreground/80 truncate max-w-[140px]">
                  {(e.setup_type || e.pair || e.title || 'Trade').toString().slice(0, 20)}
                </span>
                <span className={`shrink-0 font-medium ${r >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatR(r)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

// —— Panel: Recent Mistakes —————————————————————————————————————————————————
function RecentMistakesPanel({ mistakes }: { mistakes: { phrase: string; count: number }[] }) {
  const top = mistakes.slice(0, 3);
  if (top.length === 0) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Recent Mistakes
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-muted-foreground text-sm">No patterns yet</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Top Mistakes
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <ul className="space-y-1.5">
          {top.map((m, i) => (
            <li key={i} className="text-sm text-foreground/80 flex justify-between gap-2">
              <span className="truncate" title={m.phrase}>
                {m.phrase.slice(0, 40)}{m.phrase.length > 40 ? '…' : ''}
              </span>
              <span className="text-muted-foreground shrink-0">×{m.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// —— Panel: Latest Report Snapshot —————————————————————————————————────────——
function LatestReportPanel({
  report,
  onOpenReports,
}: {
  report: PerformanceReportRow | null;
  onOpenReports: () => void;
}) {
  if (!report) {
    return (
      <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Latest Report
          </h2>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-muted-foreground text-sm">No saved reports</p>
          <Button variant="link" className="text-primary text-xs mt-2 p-0 h-auto" onClick={onOpenReports}>
            Generate from Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }
  const totalR = report.total_r ?? 0;
  return (
    <Card className="rounded-xl border border-border-subtle bg-panel overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Latest Report
        </h2>
        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={onOpenReports}>
          Open
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className="font-medium text-foreground truncate" title={report.title}>
          {report.title || 'Performance Report'}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {report.total_trades ?? 0} trades · {report.win_rate != null ? `${report.win_rate.toFixed(0)}%` : '—'} win ·{' '}
          <span className={totalR >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatR(totalR)}</span>
        </p>
      </CardContent>
    </Card>
  );
}

// —— Quick Actions —————————————————————————————————————————————————────────——
function QuickActions({ onJournal, onAnalytics, onCoach, onReport }: {
  onJournal: () => void;
  onAnalytics: () => void;
  onCoach: () => void;
  onReport: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        className="border-border bg-panel text-foreground/90 hover:bg-elevated hover:text-foreground"
        onClick={onJournal}
      >
        <PlusIcon className="h-4 w-4 mr-1.5" />
        Add Journal Entry
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-border bg-panel text-foreground/90 hover:bg-elevated hover:text-foreground"
        onClick={onAnalytics}
      >
        <ChartBarIcon className="h-4 w-4 mr-1.5" />
        Open Analytics
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-border bg-panel text-foreground/90 hover:bg-elevated hover:text-foreground"
        onClick={onCoach}
      >
        <SparklesIcon className="h-4 w-4 mr-1.5" />
        Open AI Coach
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-border bg-panel text-foreground/90 hover:bg-elevated hover:text-foreground"
        onClick={onReport}
      >
        <DocumentChartBarIcon className="h-4 w-4 mr-1.5" />
        Generate Report
      </Button>
    </div>
  );
}

// —— Main section —————————————————————————————————————————————————────────———
export function TerminalSection() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [reports, setReports] = useState<PerformanceReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseClient(), []);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    if (!user) {
      setEntries([]);
      setReports([]);
      setLoading(false);
      return;
    }
    setError(null);
    const [entriesRes, reportsRes] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(200),
      supabase
        .from('performance_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);
    if (entriesRes.error) {
      setError(entriesRes.error.message);
      setEntries([]);
    } else {
      setEntries((entriesRes.data as JournalEntryRow[] | null) ?? []);
    }
    if (reportsRes.error) {
      setReports([]);
    } else {
      setReports((reportsRes.data as PerformanceReportRow[] | null) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const report = useMemo(
    () => generatePerformanceReport(entries, { dateFrom: '', dateTo: '' }),
    [entries]
  );
  const reportData = report.report_data;
  const consistency: ConsistencyScores | null = useMemo(
    () => computeConsistencyScores(entries),
    [entries]
  );
  const perf: PerformanceMetricsResult | null = useMemo(
    () => (entries.length ? computePerformanceMetrics(entries) : null),
    [entries]
  );
  const coach = useMemo(() => generateCoachOutput(entries), [entries]);
  const todaysFocus = useMemo(
    () =>
      buildTodaysFocus({
        reportData,
        totalTrades: report.total_trades,
        consistency,
        nextActions: coach.nextActions,
      }),
    [reportData, report.total_trades, consistency, coach.nextActions]
  );

  const bestSetup =
    (reportData.setup_type_breakdown ?? []).filter((s) => s.key && s.key !== '—')[0] ?? null;
  const mistakes = reportData.mistake_patterns ?? [];
  const topMistake = mistakes[0] ?? null;
  const ruleStats = reportData.rule_followed_stats;
  const ruleBrokenWorse =
    ruleStats.broken.count >= 2 &&
    ruleStats.followed.count >= 2 &&
    ruleStats.broken.avgR < ruleStats.followed.avgR;
  const latestReport = reports[0] ?? null;
  const equityCurve = reportData.equity_curve ?? [];

  const goTo = (section: string) => () => router.push(`/dashboard?section=${section}`);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Command Center</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Unified view of journal, analytics, coach, and consistency.
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-panel p-12 flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground text-sm">Loading terminal…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Command Center</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Unified view of journal, analytics, coach, and consistency.
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Command Center</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Single-view summary: focus, metrics, coach, and next actions.
          </p>
        </div>
        <QuickActions
          onJournal={goTo('journal')}
          onAnalytics={goTo('analytics')}
          onCoach={goTo('ai-coach')}
          onReport={goTo('analytics')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="sm:col-span-2">
          <TodaysFocusPanel points={todaysFocus} />
        </div>
        <AICoachSummaryPanel summary={coach.weeklySummary} nextActions={coach.nextActions} />
        <EquityCurvePanel curve={equityCurve} />

        <DrawdownPanel perf={perf} />
        <KeyMetricsPanel perf={perf} />
        <BestSetupPanel setup={bestSetup} />
        <BiggestLeakPanel mistake={topMistake} ruleBrokenWorse={ruleBrokenWorse} />

        <DisciplineScorePanel score={consistency?.discipline ?? null} />
        <ConsistencyScorePanel score={consistency?.overallConsistency ?? null} />
        <RecentTradesPanel entries={entries} onOpenJournal={goTo('journal')} />
        <RecentMistakesPanel mistakes={mistakes} />

        <div className="sm:col-span-2 lg:col-span-4">
          <LatestReportPanel report={latestReport} onOpenReports={goTo('reports')} />
        </div>
      </div>
    </div>
  );
}
