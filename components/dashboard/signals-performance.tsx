'use client';

import { Card } from '@/components/ui/card';
import {
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';

// ─── Sample data structure ─────────────────────────────────────────────────

export type SignalsPerformanceStats = {
  winRatePct: number;
  totalSignals: number;
  avgRR: number;
  totalRR: number;
};

export type MonthlyPerformanceEntry = {
  month: string;
  year: number;
  rr: number;
  label: string; // e.g. "Jan", "Feb"
};

export type SignalsPerformanceData = {
  stats: SignalsPerformanceStats;
  monthly: MonthlyPerformanceEntry[];
};

const EMPTY_PERFORMANCE: SignalsPerformanceData = {
  stats: { winRatePct: 0, totalSignals: 0, avgRR: 0, totalRR: 0 },
  monthly: [],
};

// ─── Component ────────────────────────────────────────────────────────────

interface SignalsPerformanceProps {
  /** When undefined, empty stats are shown (no sample data in production). */
  data?: SignalsPerformanceData;
}

const statCards: Array<{
  key: keyof SignalsPerformanceStats;
  label: string;
  format: (v: number) => string;
  icon: React.ReactNode;
}> = [
  {
    key: 'winRatePct',
    label: 'Win Rate',
    format: (v) => `${v}%`,
    icon: <Target className="w-5 h-5 text-gold-300" />,
  },
  {
    key: 'totalSignals',
    label: 'Total Signals',
    format: (v) => String(Math.round(v)),
    icon: <BarChart3 className="w-5 h-5 text-gold-300" />,
  },
  {
    key: 'avgRR',
    label: 'Avg RR',
    format: (v) => `${v}R`,
    icon: <TrendingUp className="w-5 h-5 text-gold-300" />,
  },
  {
    key: 'totalRR',
    label: 'Total RR',
    format: (v) => (v >= 0 ? `+${v}R` : `${v}R`),
    icon: <TrendingUp className="w-5 h-5 text-gold-300" />,
  },
];

export function SignalsPerformance({ data = EMPTY_PERFORMANCE }: SignalsPerformanceProps) {
  const { stats, monthly } = data;

  const cardHover =
    'transition-all duration-200 ease-out hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20';

  return (
    <div className="space-y-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Performance</p>
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, format, icon }) => {
          const value = stats[key];
          const isPositiveRR = (key === 'totalRR' || key === 'avgRR') && value >= 0;
          return (
            <Card
              key={key}
              className={`p-5 bg-white/5 border border-white/10 flex flex-col gap-2 ${cardHover}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                  {label}
                </p>
                {icon}
              </div>
              <p
                className={`text-2xl font-semibold ${
                  isPositiveRR ? 'text-emerald-300' : 'text-white'
                }`}
              >
                {format(value)}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Monthly performance */}
      <Card className={`p-6 bg-white/5 border border-white/10 ${cardHover}`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gold-300" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              By month
            </p>
            <h3 className="text-lg font-semibold text-white">
              Monthly Performance
            </h3>
          </div>
        </div>
        <ul className="space-y-3">
          {monthly.map((entry) => (
            <li
              key={`${entry.month}-${entry.year}`}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <span className="text-gray-200 font-medium">
                {entry.label} {entry.rr >= 0 ? '+' : ''}{entry.rr}R
              </span>
              <span
                className={
                  entry.rr >= 0
                    ? 'text-emerald-300 font-semibold'
                    : 'text-rose-300 font-semibold'
                }
              >
                {entry.rr >= 0 ? '+' : ''}{entry.rr}R
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
