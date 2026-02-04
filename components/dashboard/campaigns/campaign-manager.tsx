'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface Campaign {
  id: string
  platform: string
  campaign_name: string
  ad_copy: string | null
  image_url: string | null
  targeting: string | null
  budget: number | null
  spend: number | null
  conversions: number | null
  revenue: number | null
  roi: number | null
  status: string
  created_at: string
}

export function CampaignManager() {
  const { toast } = useToast()
  const [platform, setPlatform] = useState('TikTok')
  const [goal, setGoal] = useState('Drive signups')
  const [budget, setBudget] = useState<number | string>(100)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [output, setOutput] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)

  const loadCampaigns = async () => {
    const res = await fetch('/api/campaigns')
    if (res.ok) {
      const json = await res.json()
      setCampaigns(json.campaigns || [])
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const generateCampaign = async () => {
    setLoading(true)
    setOutput(null)
    try {
      const res = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, goal, budget: Number(budget) }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate')
      }
      setOutput(data.campaign)
      toast({ title: 'Campaign generated', description: 'Review and activate your ad.' })
      await loadCampaigns()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Generation failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo(() => {
    const spend = campaigns.reduce((s, c) => s + Number(c.spend || 0), 0)
    const revenue = campaigns.reduce((s, c) => s + Number(c.revenue || 0), 0)
    const avgRoi =
      campaigns.length > 0 ? campaigns.reduce((s, c) => s + Number(c.roi || 0), 0) / campaigns.length : 0
    const topPlatform =
      campaigns
        .reduce<Record<string, number>>((acc, c) => {
          acc[c.platform] = (acc[c.platform] || 0) + Number(c.revenue || 0)
          return acc
        }, {})
    const best = Object.entries(topPlatform || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    return { spend, revenue, avgRoi, best }
  }, [campaigns])

  return (
    <div className="space-y-6">
      <Card className="bg-black border border-gold-500/50 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-2xl text-gold-400 font-bold">📊 Smart Ad Campaign Manager</h2>
          <p className="text-sm text-gray-400">Data doesn’t lie — scale what performs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-neutral-900 border border-gray-700 p-2 rounded-lg text-white"
          >
            <option>TikTok</option>
            <option>Instagram</option>
            <option>Facebook</option>
            <option>Google Ads</option>
            <option>Meta</option>
          </select>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="bg-neutral-900 border border-gray-700 text-white"
            placeholder="Goal (e.g., drive signups)"
          />
          <Input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="bg-neutral-900 border border-gray-700 text-white"
            placeholder="Budget (£)"
          />
        </div>

        <Button
          onClick={generateCampaign}
          disabled={loading}
          className="bg-gold-500 text-black font-semibold hover:bg-gold-600 w-fit"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...
            </>
          ) : (
            'Generate Campaign'
          )}
        </Button>

        {output && (
          <div className="mt-4 bg-neutral-900 border border-gold-500/50 p-4 rounded-xl space-y-3">
            <h3 className="text-lg text-gold-300 font-semibold">{output.campaign_name}</h3>
            <p className="text-xs text-gray-400">Platform: {output.platform}</p>
            {output.ad_copy && <Textarea readOnly value={output.ad_copy} className="bg-gray-900 border-gray-700 text-sm" />}
            {output.image_url && (
              <img src={output.image_url} className="rounded-xl border border-gold-500/40" alt="Ad creative" />
            )}
            <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60">
              Activate Campaign
            </Button>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Total Spend</p>
          <p className="text-2xl font-bold text-white">£{totals.spend.toFixed(2)}</p>
        </Card>
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">£{totals.revenue.toFixed(2)}</p>
        </Card>
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Average ROI</p>
          <p className="text-2xl font-bold text-gold-400">{totals.avgRoi.toFixed(1)}%</p>
        </Card>
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Best Platform</p>
          <p className="text-2xl font-bold text-white">{totals.best}</p>
        </Card>
      </div>

      <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
        <h3 className="text-white font-semibold mb-3">Active Campaigns</h3>
        <div className="space-y-3">
          {campaigns.length === 0 && <p className="text-sm text-gray-500">No campaigns yet.</p>}
          {campaigns.map((c) => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{c.campaign_name}</p>
                  <p className="text-xs text-gray-400">{c.platform} • Status: {c.status}</p>
                </div>
                <p className="text-sm text-gold-300">{(c.roi || 0).toFixed(1)}% ROI</p>
              </div>
              {c.ad_copy && <p className="text-xs text-gray-400 mt-2 line-clamp-3 whitespace-pre-wrap">{c.ad_copy}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

