'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getTodayMission,
  saveMissionPlan,
  PRIMARY_ASSETS,
  RISK_OPTIONS,
  type MissionPlan,
  type SessionFocus,
} from '@/lib/trader-mission/mission-service';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const SESSION_OPTIONS: SessionFocus[] = ['Asia', 'London', 'New York'];
const MAX_TRADES_OPTIONS = [1, 2, 3, 4, 5];
const GOAL_PLACEHOLDERS = [
  'Follow strategy rules',
  'Avoid revenge trading',
  'Focus on patience',
  'Protect capital',
];

const defaultPlan: MissionPlan = {
  date: '',
  sessionFocus: 'London',
  primaryAsset: PRIMARY_ASSETS[0],
  secondaryAsset: '',
  maxTrades: 3,
  riskPerTrade: '0.5R',
  goal: '',
};

export function DailyTradingPlanCard() {
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const { plan: existing } = getTodayMission();
    const today = new Date().toISOString().slice(0, 10);
    setPlan(existing ? { ...existing, date: today } : { ...defaultPlan, date: today });
  }, []);

  const handleSave = () => {
    if (!plan) return;
    saveMissionPlan({
      sessionFocus: plan.sessionFocus,
      primaryAsset: plan.primaryAsset,
      secondaryAsset: plan.secondaryAsset,
      maxTrades: plan.maxTrades,
      riskPerTrade: plan.riskPerTrade,
      goal: plan.goal,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!plan) return null;

  return (
    <Card className="border-border bg-panel">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <ClipboardDocumentListIcon className="h-5 w-5 text-primary" />
          Daily Trading Plan
        </h3>
        <p className="text-xs text-muted-foreground">Define your focus before entering the market.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Session Focus</label>
          <select
            value={plan.sessionFocus}
            onChange={(e) => setPlan((p) => p && { ...p, sessionFocus: e.target.value as SessionFocus })}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {SESSION_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Primary Asset</label>
            <select
              value={plan.primaryAsset}
              onChange={(e) => setPlan((p) => p && { ...p, primaryAsset: e.target.value })}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {PRIMARY_ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Secondary Asset</label>
            <select
              value={plan.secondaryAsset}
              onChange={(e) => setPlan((p) => p && { ...p, secondaryAsset: e.target.value })}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">—</option>
              {PRIMARY_ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Max Trades</label>
            <select
              value={plan.maxTrades}
              onChange={(e) => setPlan((p) => p && { ...p, maxTrades: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {MAX_TRADES_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Risk Per Trade</label>
            <select
              value={plan.riskPerTrade}
              onChange={(e) => setPlan((p) => p && { ...p, riskPerTrade: e.target.value })}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {RISK_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Session Goal</label>
          <input
            type="text"
            value={plan.goal}
            onChange={(e) => setPlan((p) => p && { ...p, goal: e.target.value })}
            placeholder={GOAL_PLACEHOLDERS[0]}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground hover:bg-accent-hover"
        >
          {saved ? 'Saved' : 'Save Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}
