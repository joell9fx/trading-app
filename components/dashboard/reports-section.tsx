'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type {
  PerformanceReportData,
  GroupedStat,
} from '@/lib/dashboard/performance-report-generator';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowLeftIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  DocumentChartBarIcon,
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

type PerformanceReportRow = Database['public']['Tables']['performance_reports']['Row'];

function formatR(v: number): string {
  return v >= 0 ? `+${v}` : String(v);
}
function formatPct(v: number): string {
  return `${Number(v).toFixed(1)}%`;
}

function isPerformanceReportData(v: unknown): v is PerformanceReportData {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    Array.isArray(o.equity_curve) &&
    Array.isArray(o.strategy_breakdown) &&
    Array.isArray(o.session_breakdown) &&
    Array.isArray(o.mistake_patterns)
  );
}

function ReportDetailView({
  report,
  onBack,
}: {
  report: PerformanceReportRow;
  onBack: () => void;
}) {
  const data = report.report_data;
  const metrics = {
    totalTrades: report.total_trades ?? 0,
    winRatePct: report.win_rate ?? 0,
    totalR: report.total_r ?? 0,
    avgR: report.avg_r ?? 0,
    bestTrade: report.best_trade ?? 0,
    worstTrade: report.worst_trade ?? 0,
  };

  if (!data || !isPerformanceReportData(data)) {
    return (
      <div className="space-y-6">
        <Button
          type="button"
          variant="ghost"
          className="text-gray-400 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to reports
        </Button>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-6">
            <p className="text-gray-400">This report has no saved analytics data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const equityCurve = data.equity_curve ?? [];
  const strategyBreakdown = (data.strategy_breakdown ?? []) as GroupedStat[];
  const sessionBreakdown = (data.session_breakdown ?? []) as GroupedStat[];
  const mistakePatterns = (data.mistake_patterns ?? []) as { phrase: string; count: number }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to reports
        </Button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {report.title || 'Performance Report'}
        </h1>
        <p className="mt-1 text-gray-400 text-sm">
          Saved {report.created_at ? new Date(report.created_at).toLocaleString() : ''}
          {report.date_from || report.date_to
            ? ` · ${report.date_from ?? '…'} to ${report.date_to ?? '…'}`
            : ''}
        </p>
      </div>

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
      {equityCurve.length > 0 && (
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
                  data={equityCurve}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }
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
                    formatter={(value: number) => [
                      `${value >= 0 ? '+' : ''}${value}R`,
                      'Cumulative R',
                    ]}
                    labelFormatter={(label: unknown) =>
                      typeof label === 'string'
                        ? new Date(label).toLocaleDateString()
                        : String(label ?? '')
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
      )}

      {/* Strategy & Session breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CubeIcon className="h-5 w-5 text-gold-400" />
              Strategy breakdown
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            {strategyBreakdown.length === 0 ? (
              <p className="text-gray-500 text-sm">No data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="pb-2 pr-2 font-medium">Strategy</th>
                      <th className="pb-2 pr-2 font-medium text-right">Trades</th>
                      <th className="pb-2 pr-2 font-medium text-right">Win %</th>
                      <th className="pb-2 pr-2 font-medium text-right">Total R</th>
                      <th className="pb-2 font-medium text-right">Avg R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategyBreakdown.map((s) => (
                      <tr key={s.key} className="border-b border-white/5 last:border-0">
                        <td className="py-2 pr-2 text-gray-200 truncate max-w-[120px]" title={s.key}>
                          {s.key}
                        </td>
                        <td className="py-2 pr-2 text-right text-gray-300">{s.count}</td>
                        <td className="py-2 pr-2 text-right text-gray-300">
                          {formatPct(s.winRatePct)}
                        </td>
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
            )}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-gold-400" />
              Session breakdown
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            {sessionBreakdown.length === 0 ? (
              <p className="text-gray-500 text-sm">No data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="pb-2 pr-2 font-medium">Session</th>
                      <th className="pb-2 pr-2 font-medium text-right">Trades</th>
                      <th className="pb-2 pr-2 font-medium text-right">Win %</th>
                      <th className="pb-2 pr-2 font-medium text-right">Total R</th>
                      <th className="pb-2 font-medium text-right">Avg R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionBreakdown.map((s) => (
                      <tr key={s.key} className="border-b border-white/5 last:border-0">
                        <td className="py-2 pr-2 text-gray-200 truncate max-w-[120px]" title={s.key}>
                          {s.key}
                        </td>
                        <td className="py-2 pr-2 text-right text-gray-300">{s.count}</td>
                        <td className="py-2 pr-2 text-right text-gray-300">
                          {formatPct(s.winRatePct)}
                        </td>
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mistake analysis */}
      <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
            Top mistake patterns
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          {mistakePatterns.length === 0 ? (
            <p className="text-gray-500 text-sm">No mistake phrases in this report.</p>
          ) : (
            <ul className="space-y-2">
              {mistakePatterns.map(({ phrase, count }, i) => (
                <li
                  key={i}
                  className="flex justify-between items-baseline gap-2 text-sm"
                >
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
    </div>
  );
}

export function ReportsSection() {
  const [reports, setReports] = useState<PerformanceReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  const fetchReports = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }
    setError(null);
    const { data, error } = await supabase
      .from('performance_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setReports([]);
    } else {
      setReports((data as PerformanceReportRow[] | null) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const selectedReport = selectedReportId
    ? reports.find((r) => r.id === selectedReportId) ?? null
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Saved performance snapshots from your journal analytics.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-400 text-sm">Loading reports…</p>
        </div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <ReportDetailView
        report={selectedReport}
        onBack={() => setSelectedReportId(null)}
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Saved performance snapshots from your journal analytics.
          </p>
        </div>
        <Card className="border-red-500/30 bg-red-500/5 rounded-xl">
          <CardContent className="p-6">
            <p className="text-red-200 text-sm">Could not load reports: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dateRange = (r: PerformanceReportRow) => {
    if (r.date_from && r.date_to) return `${r.date_from} to ${r.date_to}`;
    if (r.date_from) return `From ${r.date_from}`;
    if (r.date_to) return `Until ${r.date_to}`;
    return 'All time';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
        <p className="mt-1 text-gray-400 text-sm sm:text-base">
          Saved performance snapshots from your journal analytics.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="border-white/10 bg-white/5 rounded-xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[280px] text-center">
            <DocumentChartBarIcon className="h-12 w-12 text-gray-500 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">No reports yet</h2>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Generate a report from Performance Analytics to save a snapshot of your metrics,
              equity curve, and breakdowns.
            </p>
            <Link
              href="/dashboard?section=analytics"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-gold-400 transition"
            >
              <ChartBarIcon className="h-5 w-5" />
              Open Performance Analytics
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="border-white/10 bg-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-gold-500/30 hover:bg-white/[0.07] transition"
              onClick={() => setSelectedReportId(report.id)}
            >
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-white truncate" title={report.title ?? undefined}>
                  {report.title || 'Performance Report'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{dateRange(report)}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-gray-500">Trades</dt>
                  <dd className="text-white font-medium text-right">{report.total_trades ?? 0}</dd>
                  <dt className="text-gray-500">Win rate</dt>
                  <dd className="text-right font-medium text-emerald-400">
                    {report.win_rate != null ? formatPct(report.win_rate) : '—'}
                  </dd>
                  <dt className="text-gray-500">Total R</dt>
                  <dd
                    className={`text-right font-medium ${
                      (report.total_r ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {report.total_r != null ? formatR(report.total_r) : '—'}
                  </dd>
                  <dt className="text-gray-500">Saved</dt>
                  <dd className="text-right text-gray-400 text-xs">
                    {report.created_at
                      ? new Date(report.created_at).toLocaleDateString()
                      : '—'}
                  </dd>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
