'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';

type ChartsSectionProps = {
  messagesOverTime: { day: string; message_count: number; unique_authors?: number }[];
  topChannels: { channel_name: string; message_count: number }[];
  moderationSummary: { action_type: string; action_count: number }[];
};

const COLORS = ['#60a5fa', '#22c55e', '#facc15', '#f97316', '#ef4444', '#a855f7'];

export default function ChartsSection({ messagesOverTime, topChannels, moderationSummary }: ChartsSectionProps) {
  const pieData = useMemo(
    () => moderationSummary.map((m, idx) => ({ ...m, fill: COLORS[idx % COLORS.length] })),
    [moderationSummary]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="bg-gray-950 border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase text-gray-500">Messages</p>
            <h3 className="text-lg font-semibold text-white">Messages over time</h3>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={messagesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#9ca3af" hide />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', borderColor: '#1f2937', color: '#e5e7eb' }} />
              <Line type="monotone" dataKey="message_count" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="bg-gray-950 border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase text-gray-500">Channels</p>
            <h3 className="text-lg font-semibold text-white">Top channels</h3>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topChannels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="channel_name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', borderColor: '#1f2937', color: '#e5e7eb' }} />
              <Bar dataKey="message_count" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="bg-gray-950 border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase text-gray-500">Moderation</p>
            <h3 className="text-lg font-semibold text-white">Action mix</h3>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="action_count"
                nameKey="action_type"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.action_type} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', borderColor: '#1f2937', color: '#e5e7eb' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

