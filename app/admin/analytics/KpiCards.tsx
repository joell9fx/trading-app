'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Kpi = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  accent?: 'blue' | 'gold' | 'red' | 'green';
};

const accentClassMap: Record<NonNullable<Kpi['accent']>, string> = {
  blue: 'text-blue-400',
  gold: 'text-amber-400',
  red: 'text-red-400',
  green: 'text-emerald-400',
};

export default function KpiCards({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="bg-panel text-foreground border-border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
            <div className={item.accent ? accentClassMap[item.accent] : 'text-blue-400'}>{item.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{item.value}</div>
            {item.helper ? <p className="text-xs text-muted-foreground mt-1">{item.helper}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

