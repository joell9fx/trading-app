'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { generateCoachOutput, type CoachInsight } from '@/lib/dashboard/ai-coach-insights';
import {
  SparklesIcon,
  ChartBarIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

function InsightCard({ insight }: { insight: CoachInsight }) {
  const icon =
    insight.type === 'positive' ? (
      <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0" />
    ) : insight.type === 'warning' ? (
      <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 shrink-0" />
    ) : (
      <LightBulbIcon className="h-5 w-5 text-gold-400 shrink-0" />
    );
  const borderClass =
    insight.type === 'positive'
      ? 'border-emerald-500/20 bg-emerald-500/5'
      : insight.type === 'warning'
        ? 'border-amber-500/20 bg-amber-500/5'
        : 'border-white/10 bg-white/5';
  return (
    <Card className={`rounded-xl overflow-hidden ${borderClass}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {icon}
          <div>
            <h3 className="font-semibold text-white text-sm">{insight.title}</h3>
            <p className="text-gray-300 text-sm mt-1">{insight.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AICoachSection() {
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseClient(), []);

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
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(200);
    if (error) {
      setError(error.message);
      setEntries([]);
    } else {
      setEntries((data as JournalEntryRow[] | null) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const computed = useMemo(() => generateCoachOutput(entries), [entries]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Trade Coach</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Data-driven insights and weekly coaching from your journal and performance.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-400 text-sm">Loading your data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Trade Coach</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Data-driven insights and weekly coaching from your journal and performance.
          </p>
        </div>
        <Card className="border-red-500/30 bg-red-500/5 rounded-xl">
          <CardContent className="p-6">
            <p className="text-red-200 text-sm">Could not load journal data: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { insights, weeklySummary, nextActions } = computed;

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Trade Coach</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Data-driven insights and weekly coaching from your journal and performance.
          </p>
        </div>
        <Card className="border-white/10 bg-white/5 rounded-xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[280px] text-center">
            <SparklesIcon className="h-12 w-12 text-gray-500 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">No journal data yet</h2>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Add trades in the Growth Journal with setup type, session, and rule-followed to get
              personalised coaching insights and weekly summaries.
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Trade Coach</h1>
        <p className="mt-1 text-gray-400 text-sm sm:text-base">
          Data-driven insights and weekly coaching from your journal and performance.
        </p>
      </div>

      {/* Weekly Coach Summary */}
      <Card className="border-gold-500/20 bg-gold-500/5 rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-gold-400" />
            Weekly Coach Summary
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm leading-relaxed">{weeklySummary}</p>
        </CardContent>
      </Card>

      {/* Insight cards */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <ChartBarIcon className="h-5 w-5 text-gold-400" />
            Insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Next actions */}
      <Card className="border-white/10 bg-white/5 rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ListBulletIcon className="h-5 w-5 text-gold-400" />
            Next actions
          </h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {nextActions.map((action, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-200"
              >
                <ArrowTrendingUpIcon className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
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
          href="/dashboard?section=analytics"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ChartBarIcon className="h-4 w-4" />
          Performance Analytics
        </Link>
      </div>
    </div>
  );
}
