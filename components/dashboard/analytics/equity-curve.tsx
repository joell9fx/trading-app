'use client'

import { LineChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export function EquityCurve({ data }: { data: { created_at: string; profit: number }[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-2">Equity Curve</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="created_at" hide />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="profit" stroke="#FFD700" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

