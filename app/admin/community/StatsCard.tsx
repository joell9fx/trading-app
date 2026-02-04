'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  accent?: 'blue' | 'gold';
}

export default function StatsCard({ label, value, helper, icon, accent = 'blue' }: StatsCardProps) {
  const accentClass = accent === 'gold' ? 'text-amber-500' : 'text-blue-500';
  return (
    <Card className="bg-gray-900 text-white border-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-gray-300">{label}</CardTitle>
        <div className={accentClass}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {helper ? <p className="text-xs text-gray-400 mt-1">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}

