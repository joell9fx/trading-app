'use client';

import { useRole } from './role-provider';
import { DailyTradingPlanCard } from './trader-mission/daily-trading-plan-card';
import { DisciplineTrackerCard } from './trader-mission/discipline-tracker-card';
import { TradeLimitCard } from './trader-mission/trade-limit-card';
import { PsychologyCheckCard } from './trader-mission/psychology-check-card';
import { MissionCompletionCard } from './trader-mission/mission-completion-card';
import { FlagIcon } from '@heroicons/react/24/outline';

export function TraderMissionSection() {
  const { user } = useRole();
  const userId = user?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <FlagIcon className="h-8 w-8 text-primary" />
          Trader Mission
        </h1>
        <p className="mt-1 text-muted-foreground text-sm sm:text-base">
          Plan your trading day, follow discipline rules, and build consistent trading habits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyTradingPlanCard />
        <DisciplineTrackerCard />
        <TradeLimitCard userId={userId} />
        <PsychologyCheckCard />
      </div>

      <div className="max-w-2xl">
        <MissionCompletionCard userId={userId} />
      </div>
    </div>
  );
}
