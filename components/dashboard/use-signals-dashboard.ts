'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SignalsHistoryData } from './signals-history';
import type { SignalsPerformanceData } from './signals-performance';
import type { EquityCurvePoint, PerformanceAnalytics } from '@/lib/dashboard/signals-adapter';

export type SignalFeedItem = {
  id: string;
  asset: string;
  timeframe: string;
  bias: 'long' | 'short';
  entry: string;
  stop: string;
  takeProfit: string;
  rr: number;
  status: 'new' | 'active' | 'closed';
  rationale: string;
  timestamp: string;
};

export type SignalsDashboardData = {
  signals: SignalFeedItem[];
  history: SignalsHistoryData;
  performance: SignalsPerformanceData;
  equityCurve: EquityCurvePoint[];
  analytics: PerformanceAnalytics;
};

export function useSignalsDashboard(userId: string | undefined) {
  const [data, setData] = useState<SignalsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/signals/dashboard', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed: ${res.status}`);
      }
      const json = await res.json();
      setData({
        signals: json.signals ?? [],
        history: json.history ?? { entries: [] },
        performance: json.performance ?? {
          stats: { winRatePct: 0, totalSignals: 0, avgRR: 0, totalRR: 0 },
          monthly: [],
        },
        equityCurve: json.equityCurve ?? [],
        analytics: json.analytics ?? {
          bestMonth: null,
          worstMonth: null,
          avgWinR: 0,
          avgLossR: 0,
          currentWinStreak: 0,
          currentLossStreak: 0,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load signals');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
