'use client';

import type { ImpactLevel } from '@/lib/news/economic-calendar';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'] as const;
const VIEW_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
] as const;
const IMPACT_OPTIONS: { value: 'all' | ImpactLevel; label: string }[] = [
  { value: 'all', label: 'All impact' },
  { value: 'high', label: 'High impact only' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export interface CalendarFiltersState {
  view: 'today' | 'week';
  impact: 'all' | ImpactLevel;
  currency: string;
}

interface CalendarFiltersProps {
  filters: CalendarFiltersState;
  onFiltersChange: (f: CalendarFiltersState) => void;
}

export function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const setView = (view: 'today' | 'week') => onFiltersChange({ ...filters, view });
  const setImpact = (impact: 'all' | ImpactLevel) => onFiltersChange({ ...filters, impact });
  const setCurrency = (currency: string) => onFiltersChange({ ...filters, currency });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-border bg-panel p-1">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setView(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filters.view === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent-muted'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={filters.impact}
        onChange={(e) => setImpact(e.target.value as 'all' | ImpactLevel)}
        className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Filter by impact"
      >
        {IMPACT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={filters.currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground min-w-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Filter by currency"
      >
        <option value="">All currencies</option>
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
