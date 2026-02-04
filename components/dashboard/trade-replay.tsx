'use client'

import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface TradeReplayProps {
  trade: any
}

export function TradeReplay({ trade }: TradeReplayProps) {
  const [candles, setCandles] = useState<any[]>([])
  const [step, setStep] = useState(0)
  const [commentary, setCommentary] = useState('')
  const [speed, setSpeed] = useState(250)
  const { toast } = useToast()

  useEffect(() => {
    if (!trade?.pair || !trade?.entry_time || !trade?.exit_time) return
    const load = async () => {
      const res = await fetch(`/api/trades/candles?pair=${trade.pair}&start=${trade.entry_time}&end=${trade.exit_time}`)
      const json = await res.json()
      if (res.ok) {
        setCandles(json.candles || [])
        setStep(0)
      } else {
        toast({ title: 'Error', description: json.error || 'Failed to load candles', variant: 'destructive' })
      }
    }
    load()
  }, [trade, toast])

  useEffect(() => {
    if (candles.length === 0) return
    let timer: NodeJS.Timeout
    if (step < candles.length) {
      timer = setTimeout(() => setStep((s) => s + 1), speed)
    } else {
      // finished; request commentary and XP once
      fetch('/api/trades/replay-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade, candles }),
      })
        .then((res) => res.json())
        .then((data) => setCommentary(data.commentary || ''))
        .catch(() => {})

      fetch('/api/trades/replay-xp', { method: 'POST' }).catch(() => {})
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [candles, step, speed, trade])

  const chartData = useMemo(() => candles.slice(0, step), [candles, step])

  return (
    <Card className="bg-black border border-gold-500/40 rounded-2xl p-4 relative">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-gold-400 font-bold text-lg">{trade.pair} Trade Replay</h3>
          <p className="text-xs text-gray-400">Candle-by-candle playback with entry/exit markers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60" onClick={() => setSpeed(400)}>
            1x
          </Button>
          <Button size="sm" variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60" onClick={() => setSpeed(200)}>
            1.5x
          </Button>
          <Button size="sm" variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60" onClick={() => setSpeed(120)}>
            2x
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <LineChart width={560} height={260} data={chartData}>
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#FFD700" strokeWidth={2} dot={false} isAnimationActive={false} />
          {trade?.stop_loss && (
            <ReferenceLine y={Number(trade.stop_loss)} stroke="#ef4444" strokeDasharray="4 4" label="SL" />
          )}
          {trade?.take_profit && (
            <ReferenceLine y={Number(trade.take_profit)} stroke="#22c55e" strokeDasharray="4 4" label="TP" />
          )}
        </LineChart>
      </div>

      <div className="mt-3 text-sm text-gray-300">
        <div className="flex flex-wrap gap-4">
          <span>Entry: {trade.entry_price || '-'}</span>
          <span>Exit: {trade.exit_price || '-'}</span>
          <span>Result: {trade.result || '-'}</span>
          <span>R:R: {trade.risk_reward || '-'}</span>
        </div>
      </div>

      <div className="mt-4">
        <motion.div
          key={step}
          className="text-sm text-gray-200 min-h-[60px] rounded-lg bg-gray-900/60 border border-gray-800 p-3"
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.6 }}
        >
          {commentary || 'Replaying...'}
        </motion.div>
      </div>
    </Card>
  )
}

