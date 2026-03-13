'use client';

import { cn } from '@/lib/utils';
import type { RiskWindow } from '@/lib/news/risk-radar';
import { ClockIcon } from '@heroicons/react/24/outline';

const severityStyles = {
  elevated: 'border-border bg-elevated/60 text-foreground',
  high: 'border-amber-400/30 bg-amber-500/5 text-foreground',
  extreme: 'border-red-400/30 bg-red-500/5 text-foreground',
};

interface RiskWindowCardProps {
  window: RiskWindow;
  className?: string;
}

export function RiskWindowCard({ window: w, className }: RiskWindowCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        severityStyles[w.severity],
        className
      )}
    >
      <div className="flex items-start gap-2">
        <ClockIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {w.start}–{w.end} UTC
          </div>
          <div className="text-sm font-medium text-foreground mt-0.5">
            {w.label}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{w.reason}</p>
        </div>
      </div>
    </div>
  );
}
