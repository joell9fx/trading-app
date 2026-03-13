'use client';

import { cn } from '@/lib/utils';
import type { ImpactLevel } from '@/lib/news/economic-calendar';

const impactStyles: Record<ImpactLevel, string> = {
  low: 'bg-elevated border-border text-muted-foreground',
  medium: 'bg-amber-500/15 border-amber-400/40 text-amber-200',
  high: 'bg-red-500/20 border-red-400/50 text-red-200',
};

interface ImpactBadgeProps {
  impact: ImpactLevel;
  className?: string;
}

export function ImpactBadge({ impact, className }: ImpactBadgeProps) {
  const label = impact === 'low' ? 'Low' : impact === 'medium' ? 'Medium' : 'High';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
        impactStyles[impact],
        className
      )}
      aria-label={`Impact: ${label}`}
    >
      {label}
    </span>
  );
}
