'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface StatsResponse {
  tier: string
  total_referrals: number
  converted_referrals: number
  pending_referrals: number
  total_commission: number
  monthly: { month: string; commission: number }[]
  next_tier: { name: string; remaining: number } | null
}

interface PayoutRow {
  id: string
  amount: number
  status: string
  created_at: string
  paid_at: string | null
}

export function AffiliateDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [sRes, pRes] = await Promise.all([fetch('/api/affiliate/stats'), fetch('/api/affiliate/payouts')])
        if (sRes.ok) {
          setStats(await sRes.json())
        }
        if (pRes.ok) {
          const p = await pRes.json()
          setPayouts(p.payouts || [])
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load affiliate data', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const progressPercent = useMemo(() => {
    if (!stats?.next_tier) return 100
    const current = stats.converted_referrals
    const target = current + stats.next_tier.remaining
    if (target === 0) return 0
    return Math.min(100, Math.round((current / target) * 100))
  }, [stats])

  if (loading) {
    return <div className="text-foreground/80">Loading affiliate dashboard...</div>
  }

  if (!stats) {
    return <div className="text-foreground/80">No affiliate data available.</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-950 border border-gold-500/50 p-4 rounded-2xl shadow-lg">
          <p className="text-sm text-muted-foreground">Current Tier</p>
          <p className="text-3xl font-bold text-primary mt-1">{stats.tier}</p>
          {stats.next_tier && (
            <p className="text-xs text-muted-foreground mt-1">
              {stats.next_tier.remaining} converted left to reach {stats.next_tier.name}
            </p>
          )}
        </Card>
        <Card className="bg-panel border border-border p-4 rounded-2xl">
          <p className="text-sm text-muted-foreground">Converted Referrals</p>
          <p className="text-3xl font-bold text-foreground mt-1">{stats.converted_referrals}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.pending_referrals} pending</p>
        </Card>
        <Card className="bg-panel border border-border p-4 rounded-2xl">
          <p className="text-sm text-muted-foreground">Total Commission</p>
          <p className="text-3xl font-bold text-green-400 mt-1">£{(stats.total_commission || 0).toFixed(2)}</p>
        </Card>
      </div>

      <Card className="bg-panel border border-border p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground font-semibold">Progress to next tier</h3>
          <Badge className="bg-accent-muted text-primary border border-primary/50">{progressPercent}%</Badge>
        </div>
        <div className="w-full h-3 bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent-hover" style={{ width: `${progressPercent}%` }} />
        </div>
        {stats.next_tier ? (
          <p className="text-xs text-muted-foreground mt-2">
            Convert {stats.next_tier.remaining} more to reach {stats.next_tier.name}
          </p>
        ) : (
          <p className="text-xs text-green-400 mt-2">You are at the top tier. Great work!</p>
        )}
      </Card>

      <Card className="bg-panel border border-border p-4 rounded-2xl">
        <h3 className="text-foreground font-semibold mb-3">Monthly Commission</h3>
        <div className="space-y-2">
          {stats.monthly.length === 0 && <p className="text-sm text-muted-foreground">No commission yet.</p>}
          {stats.monthly.map((m) => (
            <div key={m.month} className="flex items-center justify-between text-sm text-foreground/90">
              <span>{m.month}</span>
              <span className="text-green-400">£{m.commission.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-panel border border-border p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-semibold">Payout History</h3>
          <Button variant="outline" className="border-border text-foreground/90 hover:border-primary/60 hover:text-primary" disabled>
            Connect Payouts (Coming Soon)
          </Button>
        </div>
        <div className="space-y-3">
          {payouts.length === 0 && <p className="text-sm text-muted-foreground">No payouts yet.</p>}
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-panel border border-border rounded-xl p-3">
              <div>
                <p className="text-foreground font-semibold">£{Number(p.amount || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <Badge className={p.status === 'paid' ? 'bg-green-600/20 text-green-200' : 'bg-elevated text-foreground/90'}>
                {p.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

