'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getTradeCountToday } from '@/lib/trader-mission/mission-service';
import { getTodayMission } from '@/lib/trader-mission/mission-service';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface TradeLimitCardProps {
  userId: string | undefined;
}

export function TradeLimitCard({ userId }: TradeLimitCardProps) {
  const [tradeCount, setTradeCount] = useState<number | null>(null);
  const [maxTrades, setMaxTrades] = useState(3);

  useEffect(() => {
    getTradeCountToday(userId).then(setTradeCount);
    const { plan } = getTodayMission();
    if (plan?.maxTrades != null) setMaxTrades(plan.maxTrades);
  }, [userId]);

  const atOrOverLimit = tradeCount != null && maxTrades > 0 && tradeCount >= maxTrades;

  return (
    <Card className="border-border bg-panel">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-primary" />
          Trade Limit System
        </h3>
        <p className="text-xs text-muted-foreground">Prevent overtrading.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border bg-elevated/40 p-3 text-center">
          <div className="text-2xl font-bold text-foreground">
            {tradeCount ?? '—'}<span className="text-muted-foreground font-normal">/{maxTrades}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Trades Today</div>
        </div>
        {atOrOverLimit && (
          <div className="rounded-lg border border-border bg-elevated/60 p-3 text-sm text-foreground/90">
            <p className="font-medium text-foreground">Trading limit reached</p>
            <p className="text-muted-foreground mt-0.5">
              Consider stopping and reviewing your trades.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
