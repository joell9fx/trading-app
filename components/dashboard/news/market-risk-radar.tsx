'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getRiskRadar, type RiskRadarOutput } from '@/lib/news/risk-radar';
import { DailyRiskBadge } from './daily-risk-badge';
import { RiskWindowCard } from './risk-window-card';
import { AffectedAssetsPanel } from './affected-assets-panel';
import { TraderGuidancePanel } from './trader-guidance-panel';
import { KeyDriversList } from './key-drivers-list';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export function MarketRiskRadar() {
  const [data, setData] = useState<RiskRadarOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiskRadar()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="border-border bg-panel">
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
            Market Risk Radar
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            Loading risk assessment…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-border bg-panel">
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Unable to load risk radar.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-panel overflow-hidden">
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-primary" />
          Market Risk Radar
        </h2>
        <p className="text-sm text-muted-foreground">
          Pre-trade risk briefing based on today&apos;s economic events and macro conditions.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-lg border border-border bg-elevated/40 p-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Daily Risk Level
            </div>
            <DailyRiskBadge level={data.dailyRiskLevel} score={data.riskScore} />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              High-Impact Events Today
            </div>
            <div className="text-lg font-semibold text-foreground">
              {data.highImpactCountToday}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Most Sensitive Assets
            </div>
            <div className="text-sm text-foreground line-clamp-2">
              {data.affectedAssets.slice(0, 3).join(', ') || '—'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Main Macro Driver
            </div>
            <p className="text-sm text-foreground line-clamp-2">
              {data.mainMacroDriver}
            </p>
          </div>
        </div>

        {/* Overall summary */}
        <p className="text-sm text-foreground/90 border-l-2 border-primary/50 pl-3">
          {data.overallSummary}
        </p>

        {/* Main radar area: 3 columns on desktop, stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Risk Level & Drivers
            </h3>
            <DailyRiskBadge level={data.dailyRiskLevel} />
            <KeyDriversList drivers={data.keyDrivers} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              High-Risk Time Windows
            </h3>
            {data.highRiskWindows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No concentrated high-risk windows identified.
              </p>
            ) : (
              <div className="space-y-2">
                {data.highRiskWindows.map((w, i) => (
                  <RiskWindowCard key={i} window={w} />
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Affected Assets
            </h3>
            <AffectedAssetsPanel assets={data.affectedAssets} />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">
              Trader Guidance
            </h3>
            <TraderGuidancePanel notes={data.traderNotes} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
