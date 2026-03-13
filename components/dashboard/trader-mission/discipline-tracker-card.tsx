'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getTodayMission,
  updateDiscipline,
  getDisciplineScore,
  DISCIPLINE_RULES,
  type DisciplineRuleKey,
} from '@/lib/trader-mission/mission-service';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const defaultRules: Record<DisciplineRuleKey, boolean> = {
  usedStopLoss: false,
  followedEntryRules: false,
  stayedWithinMaxTrades: false,
  followedRiskPlan: false,
  avoidedRevengeTrading: false,
};

export function DisciplineTrackerCard() {
  const [rules, setRules] = useState<Record<DisciplineRuleKey, boolean>>(defaultRules);

  useEffect(() => {
    const { discipline } = getTodayMission();
    if (discipline?.rules) setRules(discipline.rules);
  }, []);

  const score = getDisciplineScore({ date: '', rules });
  const followed = DISCIPLINE_RULES.filter((r) => rules[r.key]).map((r) => r.label);
  const broken = DISCIPLINE_RULES.filter((r) => !rules[r.key]).map((r) => r.label);

  const toggle = (key: DisciplineRuleKey) => {
    const next = { ...rules, [key]: !rules[key] };
    setRules(next);
    updateDiscipline(next);
  };

  return (
    <Card className="border-border bg-panel">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-foreground">Discipline Tracker</h3>
        <p className="text-xs text-muted-foreground">Track whether you followed your rules today.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-elevated/40 p-3 text-center">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Discipline Score Today</div>
          <div className={cn(
            'text-2xl font-bold mt-1',
            score >= 80 ? 'text-foreground' : score >= 50 ? 'text-muted-foreground' : 'text-muted-foreground'
          )}>
            {score}%
          </div>
        </div>
        <div className="space-y-2">
          {DISCIPLINE_RULES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => toggle(r.key)}
              className={cn(
                'w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
                rules[r.key]
                  ? 'border-border bg-elevated/60 text-foreground'
                  : 'border-border bg-panel text-muted-foreground hover:bg-accent-muted'
              )}
            >
              <span>{r.label}</span>
              {rules[r.key] ? (
                <CheckCircleIcon className="h-5 w-5 text-primary" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
        {(followed.length > 0 || broken.length > 0) && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="font-medium text-muted-foreground mb-1">Rules Followed</div>
              <ul className="space-y-0.5 text-foreground/90">
                {followed.map((l) => (
                  <li key={l}>{l}</li>
                ))}
                {followed.length === 0 && <li className="text-muted-foreground">—</li>}
              </ul>
            </div>
            <div>
              <div className="font-medium text-muted-foreground mb-1">Rules Broken</div>
              <ul className="space-y-0.5 text-muted-foreground">
                {broken.map((l) => (
                  <li key={l}>{l}</li>
                ))}
                {broken.length === 0 && <li>—</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
