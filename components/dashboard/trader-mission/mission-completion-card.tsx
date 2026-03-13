'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getTodayMission,
  completeMission,
  getDisciplineScore,
  getTradeCountToday,
} from '@/lib/trader-mission/mission-service';
import { CheckBadgeIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface MissionCompletionCardProps {
  userId: string | undefined;
}

export function MissionCompletionCard({ userId }: MissionCompletionCardProps) {
  const [completion, setCompletion] = useState<ReturnType<typeof getTodayMission>['completion']>(null);
  const [plan, setPlan] = useState<ReturnType<typeof getTodayMission>['plan']>(null);
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    const mission = getTodayMission();
    setCompletion(mission.completion);
    setPlan(mission.plan);
    setDisciplineScore(getDisciplineScore(mission.discipline));
    getTradeCountToday(userId).then(setTradeCount);
  }, [userId, justCompleted]);

  const maxTrades = plan?.maxTrades ?? 3;
  const stayedWithinTrades = tradeCount <= maxTrades;
  const success = completion?.completed ?? false;
  const summaryPoints = completion?.summaryPoints ?? [];
  const suggestions = completion?.suggestions ?? [];

  const handleComplete = () => {
    const points: string[] = [];
    if (disciplineScore >= 80) points.push('Followed trading plan');
    if (stayedWithinTrades) points.push('Stayed within risk');
    if (disciplineScore >= 60) points.push('Maintained discipline');
    if (points.length === 0) points.push('Reviewed today’s session');

    const sugs: string[] = [];
    if (disciplineScore < 80) sugs.push('Focus on one rule tomorrow (e.g. strict stop loss).');
    if (!stayedWithinTrades) sugs.push('Reduce number of trades tomorrow.');
    if (plan?.sessionFocus) sugs.push(`Focus on ${plan.sessionFocus} session setups.`);

    completeMission({ summaryPoints: points, suggestions: sugs.length > 0 ? sugs : ['Keep a consistent routine.'] });
    setCompletion({
      date: new Date().toISOString().slice(0, 10),
      completed: true,
      summaryPoints: points,
      suggestions: sugs.length > 0 ? sugs : ['Keep a consistent routine.'],
    });
    setJustCompleted(true);
  };

  return (
    <Card className="border-border bg-panel">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CheckBadgeIcon className="h-5 w-5 text-primary" />
          Mission Completion
        </h3>
        <p className="text-xs text-muted-foreground">End-of-day result and improvement suggestions.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <>
            <div className="rounded-lg border border-border bg-elevated/40 p-3">
              <div className="text-sm font-medium text-foreground mb-2">Mission Completed</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {summaryPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            {suggestions.length > 0 && (
              <div className="rounded-lg border border-border bg-elevated/40 p-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <LightBulbIcon className="h-4 w-4" />
                  Suggestions
                </div>
                <ul className="space-y-1 text-sm text-foreground/90">
                  {suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Mark your mission complete at the end of the day to record your discipline and get suggestions.
            </p>
            <Button
              onClick={handleComplete}
              className="w-full bg-primary text-primary-foreground hover:bg-accent-hover"
            >
              Complete Mission
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
