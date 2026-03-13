'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, History } from 'lucide-react';

// ─── Sample data structure ─────────────────────────────────────────────────

export type SignalDirection = 'BUY' | 'SELL';

export type SignalsHistoryEntry = {
  id: string;
  date: string;       // display e.g. "Mar 6"
  dateIso: string;    // for sorting/filtering
  asset: string;
  direction: SignalDirection;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  resultR: number;    // e.g. +3, -1.5
  timeframe?: string; // optional for filtering
};

export type SignalsHistoryData = {
  entries: SignalsHistoryEntry[];
};

const EMPTY_HISTORY: SignalsHistoryData = { entries: [] };

// ─── Component ────────────────────────────────────────────────────────────

type WinLossFilter = 'all' | 'win' | 'loss';

interface SignalsHistoryProps {
  /** When undefined, empty state is shown (no sample data in production). */
  data?: SignalsHistoryData;
}

const directionTone: Record<SignalDirection, string> = {
  BUY: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
  SELL: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
};

function formatResultR(r: number): string {
  const sign = r >= 0 ? '+' : '';
  return `${sign}${r}R`;
}

export function SignalsHistory({ data = EMPTY_HISTORY }: SignalsHistoryProps) {
  const [filters, setFilters] = useState({
    asset: 'all',
    timeframe: 'all',
    winLoss: 'all' as WinLossFilter,
  });

  const entries = data?.entries ?? [];
  const assets = useMemo(() => {
    const set = new Set(entries.map((e) => e.asset));
    return ['all', ...Array.from(set).sort()];
  }, [entries]);

  const timeframes = useMemo(() => {
    const set = new Set(
      entries.map((e) => e.timeframe).filter(Boolean) as string[]
    );
    return ['all', ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const assetOk = filters.asset === 'all' || e.asset === filters.asset;
      const tfOk =
        filters.timeframe === 'all' || e.timeframe === filters.timeframe;
      const wlOk =
        filters.winLoss === 'all' ||
        (filters.winLoss === 'win' && e.resultR >= 0) ||
        (filters.winLoss === 'loss' && e.resultR < 0);
      return assetOk && tfOk && wlOk;
    });
  }, [entries, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <History className="h-4 w-4 text-gold-300" />
            Closed signals
          </p>
          <h2 className="text-xl font-semibold text-white">Signals History</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Filter className="h-4 w-4 text-gold-300" />
          Filters:
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="bg-panel border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={filters.asset}
            onChange={(e) =>
              setFilters((f) => ({ ...f, asset: e.target.value }))
            }
          >
            {assets.map((a) => (
              <option key={a} value={a}>
                {a === 'all' ? 'All assets' : a}
              </option>
            ))}
          </select>
          <select
            className="bg-panel border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={filters.timeframe}
            onChange={(e) =>
              setFilters((f) => ({ ...f, timeframe: e.target.value }))
            }
          >
            {timeframes.map((tf) => (
              <option key={tf} value={tf}>
                {tf === 'all' ? 'All timeframes' : tf}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {(['all', 'win', 'loss'] as const).map((wl) => (
              <button
                key={wl}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, winLoss: wl }))}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  filters.winLoss === wl
                    ? 'bg-gold-500 text-black'
                    : 'border border-white/20 text-gray-200 hover:bg-white/5'
                }`}
              >
                {wl === 'all' ? 'All' : wl === 'win' ? 'Win' : 'Loss'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table card */}
      <Card className="bg-white/5 border border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs uppercase tracking-[0.12em] text-gray-400 font-medium py-4 px-4">
                    Date
                  </th>
                  <th className="text-left text-xs uppercase tracking-[0.12em] text-gray-400 font-medium py-4 px-4">
                    Pair
                  </th>
                  <th className="text-left text-xs uppercase tracking-[0.12em] text-gray-400 font-medium py-4 px-4">
                    Direction
                  </th>
                  <th className="text-left text-xs uppercase tracking-[0.12em] text-gray-400 font-medium py-4 px-4">
                    Entry
                  </th>
                  <th className="text-left text-xs uppercase tracking-[0.12em] text-gray-400 font-medium py-4 px-4">
                    SL
                  </th>
                  <th className="text-left text-xs uppercase tracking-[0.12em] text-gray-400 font-medium py-4 px-4">
                    TP
                  </th>
                  <th className="text-right text-xs uppercase tracking-[0.12em] text-gray-400 font-medium py-4 px-4">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-200">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-white">
                      {row.asset}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${directionTone[row.direction]}`}
                      >
                        {row.direction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-200">
                      {row.entry}
                    </td>
                    <td className="py-3 px-4 text-sm text-rose-200/90">
                      {row.stopLoss}
                    </td>
                    <td className="py-3 px-4 text-sm text-emerald-200/90">
                      {row.takeProfit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={
                          row.resultR >= 0
                            ? 'text-emerald-300 font-semibold'
                            : 'text-rose-300 font-semibold'
                        }
                      >
                        {formatResultR(row.resultR)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No signals match the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
