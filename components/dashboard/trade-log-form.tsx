'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function TradeLogForm({ onLogged }: { onLogged?: () => void }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    pair: '',
    direction: 'buy',
    entry_price: '',
    exit_price: '',
    risk_reward: '',
    result: 'win',
    profit: '',
    risked_amount: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const body = {
        ...form,
        entry_price: Number(form.entry_price),
        exit_price: Number(form.exit_price),
        risk_reward: form.risk_reward ? Number(form.risk_reward) : undefined,
        profit: form.profit ? Number(form.profit) : undefined,
        risked_amount: form.risked_amount ? Number(form.risked_amount) : undefined,
      }
      const res = await fetch('/api/trades/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to log trade')
      toast({ title: 'Trade logged', description: 'XP and stats updated.' })
      setForm({
        pair: '',
        direction: 'buy',
        entry_price: '',
        exit_price: '',
        risk_reward: '',
        result: 'win',
        profit: '',
        risked_amount: '',
      })
      onLogged?.()
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to log trade', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
      <h3 className="text-white font-semibold mb-3">Log Trade</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-300">Pair</Label>
          <Input name="pair" value={form.pair} onChange={handleChange} required placeholder="EURUSD" />
        </div>
        <div>
          <Label className="text-gray-300">Direction</Label>
          <select
            name="direction"
            value={form.direction}
            onChange={handleChange}
            className="w-full h-10 rounded-md bg-gray-800 border border-gray-700 text-white px-3"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <Label className="text-gray-300">Entry Price</Label>
          <Input name="entry_price" type="number" step="0.00001" value={form.entry_price} onChange={handleChange} required />
        </div>
        <div>
          <Label className="text-gray-300">Exit Price</Label>
          <Input name="exit_price" type="number" step="0.00001" value={form.exit_price} onChange={handleChange} required />
        </div>
        <div>
          <Label className="text-gray-300">Risk/Reward</Label>
          <Input name="risk_reward" type="number" step="0.01" value={form.risk_reward} onChange={handleChange} />
        </div>
        <div>
          <Label className="text-gray-300">Result</Label>
          <select
            name="result"
            value={form.result}
            onChange={handleChange}
            className="w-full h-10 rounded-md bg-gray-800 border border-gray-700 text-white px-3"
          >
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="breakeven">Breakeven</option>
          </select>
        </div>
        <div>
          <Label className="text-gray-300">Profit</Label>
          <Input name="profit" type="number" step="0.01" value={form.profit} onChange={handleChange} placeholder="Optional" />
        </div>
        <div>
          <Label className="text-gray-300">Risked Amount</Label>
          <Input name="risked_amount" type="number" step="0.01" value={form.risked_amount} onChange={handleChange} placeholder="Optional" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" className="bg-gold-500 text-black hover:bg-gold-600" disabled={isSubmitting}>
            {isSubmitting ? 'Logging...' : 'Add Trade'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

