'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TradeReplay } from './trade-replay'
import { FeedbackCard } from './feedback-card'

interface TradesWithReplayProps {
  trades: any[]
}

export function TradesWithReplay({ trades }: TradesWithReplayProps) {
  const [selected, setSelected] = useState<any | null>(null)

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <h2 className="text-white font-semibold text-lg mb-3">Your Trades</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Pair</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Result</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">R:R</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Entry</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Exit</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Replay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {trades.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2 text-sm text-white">{t.pair}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{t.result}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{t.risk_reward}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{t.entry_price || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{t.exit_price || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">
                    <Button size="sm" className="bg-gold-500 text-black hover:bg-gold-600" onClick={() => setSelected(t)}>
                      🎥 Replay
                    </Button>
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-400" colSpan={6}>
                    No trades found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <div className="space-y-4">
          <TradeReplay trade={selected} />
          <FeedbackCard feedback={selected.ai_feedback} sentiment={selected.feedback_sentiment} />
        </div>
      )}
    </div>
  )
}

