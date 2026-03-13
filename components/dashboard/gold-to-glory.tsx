'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LockClosedIcon, TrophyIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

/** Progress stats: start, current, target (numeric for calculations). */
export type G2GProgressStats = {
  startBalance: number;
  currentBalance: number;
  targetBalance: number;
  currency: 'GBP';
};

/** Single entry in the recent trade timeline (e.g. "Mar 6  +4R  Gold Buy"). */
export type G2GRecentUpdate = {
  id: string;
  dateLabel: string;   // e.g. "Mar 6"
  dateIso: string;
  resultR: number;     // e.g. 4, -1
  label: string;       // e.g. "Gold Buy", "Gold Sell", "Loss"
};

/** Full-day timeline entry with note (legacy/detailed view). */
export type G2GTimelineEntry = {
  id: string;
  title: string;
  result: string;
  note: string;
  timestamp: string;
};

export type G2GHighlight = {
  id: string;
  title: string;
  detail: string;
};

interface GoldToGloryProps {
  hasAccess?: boolean;
}

const SAMPLE_PROGRESS: G2GProgressStats = {
  startBalance: 100,
  currentBalance: 427,
  targetBalance: 1000,
  currency: 'GBP',
};

const SAMPLE_RECENT_UPDATES: G2GRecentUpdate[] = [
  { id: 'ru1', dateLabel: 'Mar 6', dateIso: '2026-03-06', resultR: 4, label: 'Gold Buy' },
  { id: 'ru2', dateLabel: 'Mar 5', dateIso: '2026-03-05', resultR: 2, label: 'Gold Sell' },
  { id: 'ru3', dateLabel: 'Mar 4', dateIso: '2026-03-04', resultR: -1, label: 'Loss' },
];

const SAMPLE_STATE = {
  ...SAMPLE_PROGRESS,
  dailyChangePct: 1.2,
  tradesCount: 28,
  status: 'Ongoing' as const,
  market: 'GOLD / XAUUSD',
};

const SAMPLE_TIMELINE: G2GTimelineEntry[] = [
  {
    id: 'd12',
    title: 'Day 12',
    result: '+1.2%',
    note: 'Scalped NY session breakout; kept risk 0.5% per trade.',
    timestamp: '2026-01-15T13:30:00Z',
  },
  {
    id: 'd11',
    title: 'Day 11',
    result: '-0.6%',
    note: 'Choppy London; stood down after 2 trades to protect capital.',
    timestamp: '2026-01-14T10:15:00Z',
  },
  {
    id: 'd10',
    title: 'Day 10',
    result: '+2.1%',
    note: 'Followed higher-timeframe bias; partials at 1R, runner to 2.5R.',
    timestamp: '2026-01-13T14:50:00Z',
  },
  {
    id: 'd9',
    title: 'Day 9',
    result: '+0.8%',
    note: 'Patience on Asia open, executed only when volatility confirmed.',
    timestamp: '2026-01-12T08:40:00Z',
  },
];

const SAMPLE_HIGHLIGHTS: G2GHighlight[] = [
  { id: 'h1', title: 'Risk discipline', detail: 'Capped daily loss at 1% to avoid overtrading.' },
  { id: 'h2', title: 'Session focus', detail: 'Best performance during NY; avoid late Asia chop.' },
  { id: 'h3', title: 'Process > outcome', detail: 'Journaled every trade with pre/post plan notes.' },
];

const CURRENCY_SYMBOL: Record<string, string> = { GBP: '£' };

function formatResultR(r: number): string {
  const sign = r >= 0 ? '+' : '';
  return `${sign}${r}R`;
}

export function GoldToGlory({ hasAccess = false }: GoldToGloryProps) {
  const router = useRouter();
  const {
    startBalance,
    currentBalance,
    targetBalance,
    currency,
    dailyChangePct,
    tradesCount,
    status,
    market,
  } = SAMPLE_STATE;

  const symbol = CURRENCY_SYMBOL[currency] ?? '£';

  const progressPct = useMemo(() => {
    const range = targetBalance - startBalance;
    if (range <= 0) return 0;
    const pct = ((currentBalance - startBalance) / range) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }, [currentBalance, startBalance, targetBalance]);

  const dailyTone =
    dailyChangePct >= 0
      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30'
      : 'text-rose-200 bg-rose-500/10 border-rose-400/30';

  const cardHover =
    'transition-all duration-200 ease-out hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20';

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Challenge</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15">
            <ArrowTrendingUpIcon className="w-4 h-4 text-gold-300" />
            <span className="text-gray-200">Gold to Glory (G2G)</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">
            {symbol}{startBalance} → {symbol}{targetBalance} Challenge
          </h1>
          <p className="text-sm text-gray-300 max-w-3xl">
            Transparent, education-first challenge on GOLD (XAUUSD). Follow the
            journey, review performance, and learn the decision process—no hype,
            no guarantees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gold-500/15 border border-gold-500/30 text-gold-100">
            {status}
          </Badge>
          <Badge variant="outline" className="border-white/20 text-gray-100">
            Read-only
          </Badge>
        </div>
      </header>

      {/* Progress stats card */}
      <Card className={`p-6 bg-white/5 border border-white/10 ${cardHover}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Challenge progress
          </p>
          <TrophyIcon className="w-6 h-6 text-gold-300" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-400">
              Start balance
            </p>
            <p className="text-xl font-semibold text-white mt-1">
              {symbol}{startBalance}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-400">
              Current balance
            </p>
            <p className="text-xl font-semibold text-emerald-200 mt-1">
              {symbol}{currentBalance}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-400">
              Target
            </p>
            <p className="text-xl font-semibold text-white mt-1">
              {symbol}{targetBalance}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Progress</span>
            <span className="font-semibold text-white">
              {progressPct.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={progressPct}
            className="h-3 bg-white/10 [&>div]:bg-gold-500/80"
          />
        </div>
      </Card>

      {/* Recent Updates */}
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
              Latest activity
            </p>
            <h3 className="text-lg font-semibold text-white">
              Recent Updates
            </h3>
          </div>
        </div>
        <ul className="space-y-2">
          {SAMPLE_RECENT_UPDATES.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <span className="text-sm font-medium text-gray-200">{u.dateLabel}</span>
              <span
                className={
                  u.resultR >= 0
                    ? 'text-emerald-300 font-semibold'
                    : 'text-rose-300 font-semibold'
                }
              >
                {formatResultR(u.resultR)}
              </span>
              <span className="text-sm text-gray-300">{u.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Overview (goal + market) */}
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                  Goal
                </p>
                <h3 className="text-xl font-semibold text-white">
                  Flip {symbol}{startBalance} → {symbol}{targetBalance}
                </h3>
              </div>
              <TrophyIcon className="w-8 h-8 text-gold-300" />
            </div>
            <p className="text-sm text-gray-300">
              Real-time, transparent tracking of a focused GOLD (XAUUSD)
              challenge. All updates are educational and do not imply performance
              guarantees.
            </p>
            <div className={`rounded-xl border px-3 py-3 ${dailyTone}`}>
              <p className="text-xs text-gray-200/80">Daily P/L</p>
              <p className="text-lg font-semibold">
                {dailyChangePct >= 0 ? '+' : ''}
                {dailyChangePct.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                  Market
                </p>
                <p className="text-lg font-semibold text-white">{market}</p>
              </div>
              <ClockIcon className="w-6 h-6 text-gold-300" />
            </div>
            <p className="text-sm text-gray-300">
              Single-market focus to keep decisions clear and repeatable.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-400">Trades logged</p>
                <p className="text-lg font-semibold text-white">{tradesCount}</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-400">Status</p>
                <p className="text-lg font-semibold text-emerald-200">
                  {status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Daily updates</p>
            <h3 className="text-lg font-semibold text-white">Timeline</h3>
            <p className="text-sm text-gray-400">Newest first. Concise reasoning per day.</p>
          </div>
          <Badge variant="outline" className="border-white/20 text-gray-100">Mobile-friendly</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {SAMPLE_TIMELINE.map((update) => (
            <div key={update.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-200">
                  <span className="font-semibold text-white">{update.title}</span>
                  <span className="text-xs text-gray-400">{new Date(update.timestamp).toLocaleString()}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${update.result.startsWith('+') ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
                  {update.result}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{update.note}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Highlights */}
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Key takeaways</p>
            <h3 className="text-lg font-semibold text-white">Highlights & lessons</h3>
            <p className="text-sm text-gray-400">Bite-sized learnings from the challenge.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_HIGHLIGHTS.map((h) => (
            <div key={h.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{h.title}</p>
              <p className="text-sm text-gray-200">{h.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Locked / Unlocked */}
      <Card className="p-6 bg-white/5 border border-white/10 relative overflow-hidden">
        {!hasAccess && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3 px-6">
              <LockClosedIcon className="h-10 w-10 text-gold-300 mx-auto" />
              <p className="text-white font-semibold">Full G2G breakdown is locked</p>
              <p className="text-sm text-gray-300">Unlock to see detailed trade notes and deeper rationale.</p>
              <Button
                className="bg-gold-500 hover:bg-gold-400 text-black w-full sm:w-auto"
                onClick={() => router.push('/pricing?product=gold_to_glory')}
              >
                Unlock full G2G access
              </Button>
            </div>
          </div>
        )}

        <div className={`space-y-4 ${!hasAccess ? 'opacity-50 pointer-events-none select-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Deep dive</p>
              <h3 className="text-lg font-semibold text-white">Strategy notes & trade breakdowns</h3>
            </div>
            <Badge className={hasAccess ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' : 'bg-white/10 text-gray-200 border-white/15'}>
              {hasAccess ? 'Unlocked' : 'Locked'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-400">Session plans</p>
              <p className="text-sm text-gray-200">Bias, key levels, invalidation map.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-400">Executed trades</p>
              <p className="text-sm text-gray-200">Entry/exit rationale and post-trade notes.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-400">Adjustments</p>
              <p className="text-sm text-gray-200">Risk tweaks, rule adherence, and learnings.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
