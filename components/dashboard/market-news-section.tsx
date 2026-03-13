'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EconomicCalendar } from './news/economic-calendar';
import { GlobalNewsFeed } from './news/global-news-feed';
import { MarketRiskRadar } from './news/market-risk-radar';
import { CalendarDaysIcon, NewspaperIcon } from '@heroicons/react/24/outline';

type NewsTab = 'calendar' | 'global';

const TABS: { id: NewsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'calendar', label: 'Economic Calendar', icon: CalendarDaysIcon },
  { id: 'global', label: 'Global Market News', icon: NewspaperIcon },
];

export function MarketNewsSection() {
  const [activeTab, setActiveTab] = useState<NewsTab>('calendar');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <NewspaperIcon className="h-8 w-8 text-primary" />
          Market News
        </h1>
        <p className="mt-1 text-muted-foreground text-sm sm:text-base">
          Stay ahead of the markets with upcoming economic events and global macro developments.
        </p>
      </div>

      <MarketRiskRadar />

      <div className="flex rounded-lg border border-border bg-panel p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'calendar' && (
        <EconomicCalendar />
      )}

      {activeTab === 'global' && (
        <Card className="border-border bg-panel">
          <CardHeader>
            <CardTitle className="text-foreground">Global Market News</CardTitle>
            <CardDescription>
              Macro and geopolitical developments that affect markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GlobalNewsFeed />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
