'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LockClosedIcon, TrophyIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';

interface GoldToGloryProps {
  hasAccess?: boolean;
  currentBalance?: number;
  dailyChangePct?: number;
  tradesCount?: number;
}

export function GoldToGlory({
  hasAccess = false,
  currentBalance = 325,
  dailyChangePct = 1.2,
  tradesCount = 28,
}: GoldToGloryProps) {
  const startingBalance = 100;
  const targetBalance = 1000;

  const progress = useMemo(() => {
    const pct = ((currentBalance - startingBalance) / (targetBalance - startingBalance)) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }, [currentBalance]);

  const dailyTone =
    dailyChangePct >= 0 ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' : 'text-rose-200 bg-rose-500/10 border-rose-400/30';

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15">
            <ArrowTrendingUpIcon className="w-4 h-4 text-gold-300" />
            <span className="text-gray-200">Gold to Glory (G2G)</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">100 → 1000 Challenge</h1>
          <p className="text-sm text-gray-300 max-w-3xl">
            Transparent, education-first challenge on GOLD (XAUUSD). Follow the journey, review performance, and learn the decision process—no hype, no guarantees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gold-500/15 border border-gold-500/30 text-gold-100">Ongoing</Badge>
          <Badge variant="outline" className="border-white/20 text-gray-100">Read-only</Badge>
        </div>
      </header>

      {/* Overview */}
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Goal</p>
                <h3 className="text-xl font-semibold text-white">Flip $100 → $1000</h3>
              </div>
              <TrophyIcon className="w-8 h-8 text-gold-300" />
            </div>
            <p className="text-sm text-gray-300">
              Real-time, transparent tracking of a focused GOLD (XAUUSD) challenge. All updates are educational and do not imply performance guarantees.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-200">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-400">Starting balance</p>
                <p className="text-lg font-semibold text-white">${startingBalance.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-400">Target balance</p>
                <p className="text-lg font-semibold text-white">${targetBalance.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-400">Current balance</p>
                <p className="text-lg font-semibold text-emerald-200">${currentBalance.toFixed(2)}</p>
              </div>
              <div className={`rounded-xl border px-3 py-3 ${dailyTone}`}>
                <p className="text-xs text-gray-200/80">Daily P/L</p>
                <p className="text-lg font-semibold">{dailyChangePct >= 0 ? '+' : ''}{dailyChangePct.toFixed(2)}%</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Progress to $1000</span>
                <span className="font-semibold text-white">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/10" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Market</p>
                <p className="text-lg font-semibold text-white">GOLD / XAUUSD</p>
              </div>
              <ClockIcon className="w-6 h-6 text-gold-300" />
            </div>
            <p className="text-sm text-gray-300">
              Single-market focus to keep decisions clear and repeatable. Expect disciplined updates, not signals or promises.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-400">Trades logged</p>
                <p className="text-lg font-semibold text-white">{tradesCount}</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-400">Status</p>
                <p className="text-lg font-semibold text-emerald-200">Active</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Updates / Logs */}
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
          {[
            { day: 'Day 12', result: '+1.2%', note: 'Scalped NY session breakout; kept risk 0.5% per trade.' },
            { day: 'Day 11', result: '-0.6%', note: 'Choppy London; stood down after 2 trades to protect capital.' },
            { day: 'Day 10', result: '+2.1%', note: 'Followed higher-timeframe bias; partials at 1R, runner to 2.5R.' },
          ].map((update) => (
            <div key={update.day} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{update.day}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${update.result.startsWith('+') ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
                  {update.result}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{update.note}</p>
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
              <Button className="bg-gold-500 hover:bg-gold-400 text-black w-full sm:w-auto">
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
