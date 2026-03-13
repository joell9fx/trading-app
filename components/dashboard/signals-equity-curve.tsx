'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { EquityCurvePoint } from '@/lib/dashboard/signals-adapter';
import { TrendingUp } from 'lucide-react';

export type SignalsEquityCurveProps = {
  data?: EquityCurvePoint[];
};

const EMPTY_DATA: EquityCurvePoint[] = [];

const CARD_HOVER =
  'transition-all duration-200 ease-out hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20';

export function SignalsEquityCurve({ data = EMPTY_DATA }: SignalsEquityCurveProps) {
  const hasData = data.length > 0;

  return (
    <Card className={`bg-white/5 border border-white/10 overflow-hidden ${CARD_HOVER}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gold-300" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Cumulative R</p>
            <CardTitle className="text-lg font-semibold text-white">Equity Curve</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center"
            style={{ minHeight: 240 }}
          >
            <p className="text-sm text-gray-400">No trade history yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
              Your cumulative R curve will appear here once you have closed trades.
            </p>
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                  tickFormatter={(v: number) => `${v}R`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 15, 28, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#d1d5db' }}
                  formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value}R`, 'Cumulative R']}
                  labelFormatter={(label: unknown) => String(label ?? '')}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="cumulativeR"
                  stroke="rgba(250, 204, 21, 0.9)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'rgba(250, 204, 21, 0.5)', stroke: '#facc15' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
