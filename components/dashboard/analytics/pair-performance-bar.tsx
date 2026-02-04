'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PairPerformance {
  pair: string
  profit: number
}

export function PairPerformanceBar({ data }: { data: PairPerformance[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-2">Pair Performance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="pair" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip />
            <Bar dataKey="profit" fill="#FFD700" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

