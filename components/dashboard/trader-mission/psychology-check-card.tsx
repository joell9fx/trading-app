'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getTodayMission,
  savePsychology,
  type BeforeTradingMood,
  type PlanFollowed,
} from '@/lib/trader-mission/mission-service';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const MOOD_OPTIONS: BeforeTradingMood[] = ['Focused', 'Calm', 'Tired', 'Stressed', 'Overconfident'];
const PLAN_OPTIONS: PlanFollowed[] = ['Yes', 'Partially', 'No'];

export function PsychologyCheckCard() {
  const [beforeMood, setBeforeMood] = useState<BeforeTradingMood | null>(null);
  const [afterPlanFollowed, setAfterPlanFollowed] = useState<PlanFollowed | null>(null);

  useEffect(() => {
    const { psychology } = getTodayMission();
    if (psychology?.beforeMood) setBeforeMood(psychology.beforeMood);
    if (psychology?.afterPlanFollowed) setAfterPlanFollowed(psychology.afterPlanFollowed);
  }, []);

  const setMood = (mood: BeforeTradingMood) => {
    setBeforeMood(mood);
    savePsychology({ beforeMood: mood });
  };

  const setPlanFollowed = (value: PlanFollowed) => {
    setAfterPlanFollowed(value);
    savePsychology({ afterPlanFollowed: value });
  };

  return (
    <Card className="border-border bg-panel">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <FaceSmileIcon className="h-5 w-5 text-primary" />
          Psychological Check
        </h3>
        <p className="text-xs text-muted-foreground">Emotional state and plan adherence.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Before trading — How do you feel?</div>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  beforeMood === m
                    ? 'border-primary bg-accent-muted text-foreground'
                    : 'border-border bg-panel text-muted-foreground hover:bg-accent-muted'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">After trading — Did you follow your plan?</div>
          <div className="flex flex-wrap gap-2">
            {PLAN_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlanFollowed(p)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  afterPlanFollowed === p
                    ? 'border-primary bg-accent-muted text-foreground'
                    : 'border-border bg-panel text-muted-foreground hover:bg-accent-muted'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
