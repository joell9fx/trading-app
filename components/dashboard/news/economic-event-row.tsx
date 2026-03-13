'use client';

import type { EconomicEvent } from '@/lib/news/economic-calendar';
import { ImpactBadge } from './impact-badge';
import { cn } from '@/lib/utils';

interface EconomicEventRowProps {
  event: EconomicEvent;
  className?: string;
}

export function EconomicEventRow({ event, className }: EconomicEventRowProps) {
  const isHighImpact = event.impact === 'high';
  return (
    <tr
      className={cn(
        'border-b border-border last:border-b-0 transition-colors',
        isHighImpact && 'bg-red-500/5',
        className
      )}
    >
      <td className="px-3 py-2.5 text-sm text-muted-foreground whitespace-nowrap tabular-nums">
        {event.time}
      </td>
      <td className="px-3 py-2.5 text-sm font-medium text-foreground whitespace-nowrap">
        {event.currency}
      </td>
      <td className="px-3 py-2.5 text-sm text-foreground">
        {event.eventName}
      </td>
      <td className="px-3 py-2.5">
        <ImpactBadge impact={event.impact} />
      </td>
      <td className="px-3 py-2.5 text-sm text-muted-foreground tabular-nums">
        {event.previous ?? '—'}
      </td>
      <td className="px-3 py-2.5 text-sm text-foreground tabular-nums">
        {event.forecast ?? '—'}
      </td>
      <td className="px-3 py-2.5 text-sm tabular-nums">
        {event.actual != null ? (
          <span className="text-primary font-medium">{event.actual}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}
