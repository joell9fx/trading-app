'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  computeConsistencyScores,
  type ConsistencyScores,
  type TrendSnapshot,
} from '@/lib/dashboard/consistency-scores';
import {
  ChartBarIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-gold-400';
  return 'text-amber-400';
}

function scoreBgColor(score: number): string {
  if (score >= 70) return 'border-emerald-500/20 bg-emerald-500/5';
  if (score >= 50) return 'border-gold-500/20 bg-gold-500/5';
  return 'border-amber-500/20 bg-amber-500/5';
}

function ScoreCard({
  title,
  score,
  subtitle,
}: {
  title: string;
  score: number;
  subtitle?: string;
}) {
  return (
    <Card className={`rounded-xl overflow-hidden ${scoreBgColor(score)}`}>
      <CardContent className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${scoreColor(score)}`}>{score}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function TrendCard({ label, trend }: { label: string; trend: TrendSnapshot }) {
  if (trend.count === 0) {
    return (
      <Card className="border-white/10 bg-white/5 rounded-xl">
        <CardContent className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-gray-500 text-sm mt-1">No data</p>
        </CardContent>
      </Card>
    );
  }
  const avgR = trend.avgR >= 0 ? `+${trend.avgR.toFixed(1)}` : trend.avgR.toFixed(1);
  return (
    <Card className="border-white/10 bg-white/5 rounded-xl">
      <CardContent className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-white font-semibold mt-1">{trend.count} trades</p>
        <p className="text-gray-400 text-sm mt-0.5">
          {trend.winRatePct.toFixed(0)}% win · {avgR}R avg
        </p>
        {trend.ruleFollowedPct > 0 && (
          <p className="text-gray-500 text-xs mt-0.5">
            Rules followed: {trend.ruleFollowedPct.toFixed(0)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ConsistencySection() {
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setError(null);
    const { data, err } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(200);
    if (err) {
      setError(err.message);
      setEntries([]);
    } else {
      setEntries((data as JournalEntryRow[] | null) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scores: ConsistencyScores = useMemo(
    () => computeConsistencyScores(entries),
    [entries]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Consistency & Discipline</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Process-quality scores from your journal and rule-following.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Consistency & Discipline</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Process-quality scores from your journal and rule-following.
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

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Consistency & Discipline</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Process-quality scores from your journal and rule-following.
          </p>
        </div>
        <Card className="border-white/10 bg-white/5 rounded-xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[280px] text-center">
            <ShieldCheckIcon className="h-12 w-12 text-gray-500 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">No journal data yet</h2>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Log trades in the Growth Journal to see your consistency score, discipline score, and
              streaks.
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Consistency & Discipline</h1>
        <p className="mt-1 text-gray-400 text-sm sm:text-base">
          Process-quality scores from your journal and rule-following.
        </p>
      </div>

      {/* Main scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Overall consistency"
          score={scores.overallConsistency}
          subtitle="Process & data quality"
        />
        <ScoreCard
          title="Discipline"
          score={scores.discipline}
          subtitle="Rule-following rate"
        />
        <ScoreCard
          title="Execution"
          score={scores.execution}
          subtitle="Execution quality avg"
        />
        <ScoreCard
          title="Confidence stability"
          score={scores.confidenceStability}
          subtitle="Low variance = high"
        />
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <FireIcon className="h-8 w-8 text-gold-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Journal streak</p>
              <p className="text-xl font-bold text-white">
                {scores.journalStreak} day{scores.journalStreak !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">Consecutive days with an entry</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircleIcon className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Rule-followed streak</p>
              <p className="text-xl font-bold text-white">
                {scores.ruleFollowedStreak} trade{scores.ruleFollowedStreak !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">Latest entries with rules followed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend cards */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
          <ArrowTrendingUpIcon className="h-5 w-5 text-gold-400" />
          Trend
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <TrendCard label="Last 7 entries" trend={scores.trendLast7} />
          <TrendCard label="Last 30 entries" trend={scores.trendLast30} />
        </div>
      </div>

      {/* Score explanation */}
      <Card className="border-white/10 bg-white/5 rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-gold-400" />
            Score breakdown
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {scores.helping.length > 0 && (
            <div>
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-medium mb-1.5">
                Helping your score
              </p>
              <ul className="space-y-1">
                {scores.helping.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-200">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {scores.hurting.length > 0 && (
            <div>
              <p className="text-xs text-amber-400 uppercase tracking-wider font-medium mb-1.5">
                Hurting your score
              </p>
              <ul className="space-y-1">
                {scores.hurting.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-200">
                    <XCircleIcon className="h-4 w-4 text-amber-400 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {scores.helping.length === 0 && scores.hurting.length === 0 && (
            <p className="text-gray-500 text-sm">Add more journal entries to see what helps or hurts your score.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/dashboard?section=journal"
          className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300"
        >
          <BookOpenIcon className="h-4 w-4" />
          Growth Journal
        </Link>
        <Link
          href="/dashboard?section=ai-coach"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ChartBarIcon className="h-4 w-4" />
          AI Trade Coach
        </Link>
      </div>
    </div>
  );
}
