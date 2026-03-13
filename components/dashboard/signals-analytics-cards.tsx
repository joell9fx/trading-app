'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { PerformanceAnalytics } from '@/lib/dashboard/signals-adapter';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Flame,
  Snowflake,
} from 'lucide-react';

export type SignalsAnalyticsCardsProps = {
  data?: PerformanceAnalytics | null;
};

const EMPTY_ANALYTICS: PerformanceAnalytics = {
  bestMonth: null,
  worstMonth: null,
  avgWinR: 0,
  avgLossR: 0,
  currentWinStreak: 0,
  currentLossStreak: 0,
};

export function SignalsAnalyticsCards({ data = EMPTY_ANALYTICS }: SignalsAnalyticsCardsProps) {
  const a = data ?? EMPTY_ANALYTICS;

  const items = [
    {
      label: 'Best month',
      value: a.bestMonth ? `+${a.bestMonth.rr}R` : '—',
      sub: a.bestMonth?.label ?? '',
      icon: Calendar,
      tone: 'text-emerald-300',
    },
    {
      label: 'Worst month',
      value: a.worstMonth != null ? `${a.worstMonth.rr >= 0 ? '+' : ''}${a.worstMonth.rr}R` : '—',
      sub: a.worstMonth?.label ?? '',
      icon: Calendar,
      tone: a.worstMonth && a.worstMonth.rr < 0 ? 'text-rose-300' : 'text-gray-300',
    },
    {
      label: 'Average win',
      value: a.avgWinR > 0 ? `+${a.avgWinR}R` : '—',
      sub: 'Per winning trade',
      icon: TrendingUp,
      tone: 'text-emerald-300',
    },
    {
      label: 'Average loss',
      value: a.avgLossR !== 0 ? `${a.avgLossR}R` : '—',
      sub: 'Per losing trade',
      icon: TrendingDown,
      tone: 'text-rose-300',
    },
    {
      label: 'Win streak',
      value: String(a.currentWinStreak),
      sub: 'Current',
      icon: Flame,
      tone: 'text-gold-300',
    },
    {
      label: 'Loss streak',
      value: String(a.currentLossStreak),
      sub: 'Current',
      icon: Snowflake,
      tone: 'text-rose-300/90',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Supporting analytics</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {items.map(({ label, value, sub, icon: Icon, tone }) => (
          <Card
            key={label}
            className="p-5 bg-white/5 border border-white/10 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{label}</p>
              <Icon className="w-4 h-4 text-gold-300/80" />
            </div>
            <p className={`text-xl font-semibold ${tone}`}>{value}</p>
            {sub ? <p className="text-xs text-gray-500">{sub}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
