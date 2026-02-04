'use client'

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#22c55e', '#ef4444', '#facc15']

export function WinLossPie({ wins, losses, breakevens }: { wins: number; losses: number; breakevens: number }) {
  const data = [
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses },
    { name: 'Breakevens', value: breakevens },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-2">Win / Loss</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={90} label>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

