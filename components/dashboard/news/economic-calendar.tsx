'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getEconomicEvents, type EconomicEvent, type ImpactLevel } from '@/lib/news/economic-calendar';
import { EconomicEventRow } from './economic-event-row';
import { CalendarFilters, type CalendarFiltersState } from './calendar-filters';

const DEFAULT_FILTERS: CalendarFiltersState = {
  view: 'week',
  impact: 'all',
  currency: '',
};

function getDateRange(view: 'today' | 'week'): { from: string; to: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (view === 'today') {
    return { from: today, to: today };
  }
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  return { from: today, to: end.toISOString().slice(0, 10) };
}

export function EconomicCalendar() {
  const [filters, setFilters] = useState<CalendarFiltersState>(DEFAULT_FILTERS);
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const { from, to } = useMemo(() => getDateRange(filters.view), [filters.view]);

  useEffect(() => {
    setLoading(true);
    getEconomicEvents({
      from,
      to,
      impactOnly: filters.impact === 'all' ? undefined : (filters.impact as ImpactLevel),
      currencies: filters.currency ? [filters.currency] : [],
    })
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [from, to, filters.impact, filters.currency]);

  const byDate = useMemo(() => {
    const map = new Map<string, EconomicEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  return (
    <Card className="border-border bg-panel">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Economic Calendar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upcoming releases that can move markets
            </p>
          </div>
          <CalendarFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            Loading events…
          </div>
        ) : byDate.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No events match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {byDate.map(([date, dayEvents]) => (
              <div key={date} className="border-b border-border last:border-b-0">
                <div className="px-4 py-2 bg-elevated/60 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <table className="w-full min-w-[640px]" cellPadding={0} cellSpacing={0}>
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">Currency</th>
                      <th className="px-3 py-2 font-medium">Event</th>
                      <th className="px-3 py-2 font-medium">Impact</th>
                      <th className="px-3 py-2 font-medium">Previous</th>
                      <th className="px-3 py-2 font-medium">Forecast</th>
                      <th className="px-3 py-2 font-medium">Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayEvents.map((ev) => (
                      <EconomicEventRow key={ev.id} event={ev} />
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
