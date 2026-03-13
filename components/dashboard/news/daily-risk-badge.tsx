'use client';

import { cn } from '@/lib/utils';
import type { DailyRiskLevel } from '@/lib/news/risk-radar';

const levelStyles: Record<DailyRiskLevel, string> = {
  low: 'bg-elevated border-border text-foreground',
  moderate: 'border-amber-400/50 bg-amber-500/10 text-amber-200',
  high: 'border-red-400/40 bg-red-500/10 text-red-200',
  extreme: 'border-red-400/60 bg-red-500/15 text-red-100',
};

interface DailyRiskBadgeProps {
  level: DailyRiskLevel;
  score?: number;
  className?: string;
}

export function DailyRiskBadge({ level, score, className }: DailyRiskBadgeProps) {
  const label =
    level === 'low'
      ? 'Low'
      : level === 'moderate'
        ? 'Moderate'
        : level === 'high'
          ? 'High'
          : 'Extreme';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-semibold uppercase tracking-wide',
        levelStyles[level],
        className
      )}
      aria-label={`Daily risk level: ${label}`}
    >
      <span>{label}</span>
      {score != null && (
        <span className="opacity-80 text-xs font-normal normal-case">
          {score}
        </span>
      )}
    </div>
  );
}
