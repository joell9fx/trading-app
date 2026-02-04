'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, LineChart, Line } from 'recharts'
import { useToast } from '@/hooks/use-toast'

interface Overview {
  users: { total: number; avgXp: number; tierDist: Record<string, number> }
  referrals: { total: number; conversions: number }
  payouts: { pendingAmount: number; paidAmount: number; pendingCount: number; paidCount: number }
  campaigns: {
    total: number
    totalSpend: number
    totalRevenue: number
    avgRoi: number
    roiByPlatform: Record<string, { spend: number; revenue: number }>
  }
  journals: number
  showcases: number
  marketingAssets: number
  optimizations: { total: number; avgImprovement: number }
}

interface Forecast {
  forecast: {
    usersGrowth: Record<'7d' | '30d' | '90d', number>
    revenueGrowth: Record<'7d' | '30d' | '90d', number>
    roiProjection: Record<'7d' | '30d' | '90d', number>
    referralsGrowth: Record<'7d' | '30d' | '90d', number>
  }
  summary: string
}

export function AdminDashboardClient() {
  const { toast } = useToast()
  const [data, setData] = useState<Overview | null>(null)
  const [insights, setInsights] = useState('')
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [oRes, iRes, fRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/insights'),
        fetch('/api/admin/forecast'),
      ])
      if (oRes.ok) setData(await oRes.json())
      if (iRes.ok) {
        const j = await iRes.json()
        setInsights(j.insights || '')
      }
      if (fRes.ok) {
        setForecast(await fRes.json())
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load analytics', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const tierChart = useMemo(() => {
    if (!data) return []
    return Object.entries(data.users.tierDist || {}).map(([name, value]) => ({ name, value }))
  }, [data])

  const roiChart = useMemo(() => {
    if (!data) return []
    return Object.entries(data.campaigns.roiByPlatform || {}).map(([platform, vals]) => {
      const roi = vals.spend > 0 ? ((vals.revenue - vals.spend) / vals.spend) * 100 : 0
      return { platform, roi: Number(roi.toFixed(1)) }
    })
  }, [data])

  const forecastLines = useMemo(() => {
    if (!forecast) return []
    const f = forecast.forecast
    return [
      { label: 'Now', Users: f.usersGrowth['7d'] / 1.08, ROI: f.roiProjection['7d'] / 1.05 },
      { label: '7d', Users: f.usersGrowth['7d'], ROI: f.roiProjection['7d'] },
      { label: '30d', Users: f.usersGrowth['30d'], ROI: f.roiProjection['30d'] },
      { label: '90d', Users: f.usersGrowth['90d'], ROI: f.roiProjection['90d'] },
    ]
  }, [forecast])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-300">
        <LoadingSpinner /> <span>Loading analytics...</span>
      </div>
    )
  }

  if (!data) {
    return <p className="text-gray-400">No analytics available.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gold-400 font-bold">🧠 VisionEdge Intelligence Hub</h1>
          <p className="text-sm text-gray-400">From insight to execution — this is where growth begins.</p>
        </div>
        <Button onClick={load} variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60">
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-950 border border-gold-500/50 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gold-300">{data.users.total}</p>
          <p className="text-xs text-gray-500 mt-1">Avg XP: {Math.round(data.users.avgXp)}</p>
        </Card>
        <Card className="bg-gray-950 border border-gold-500/50 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Referral Conversions</p>
          <p className="text-2xl font-bold text-green-400">{data.referrals.conversions}</p>
          <p className="text-xs text-gray-500 mt-1">Total Referrals: {data.referrals.total}</p>
        </Card>
        <Card className="bg-gray-950 border border-gold-500/50 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Avg ROI</p>
          <p className="text-2xl font-bold text-gold-300">{data.campaigns.avgRoi.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">
            Spend £{data.campaigns.totalSpend.toFixed(0)} / Rev £{data.campaigns.totalRevenue.toFixed(0)}
          </p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <h3 className="text-white font-semibold mb-3">ROI by Platform</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roiChart}>
              <XAxis dataKey="platform" stroke="#777" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="roi" fill="#FFD700" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <h3 className="text-white font-semibold mb-3">Tier Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={tierChart} dataKey="value" nameKey="name" outerRadius={100} label>
                {tierChart.map((_, idx) => (
                  <Cell key={idx} fill={['#FFD700', '#C0C0C0', '#E5E4E2', '#b08d57', '#7e6d57'][idx % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Affiliate Payouts</p>
          <p className="text-lg font-semibold text-gold-300">Paid: £{data.payouts.paidAmount.toFixed(0)}</p>
          <p className="text-sm text-gray-400">Pending: £{data.payouts.pendingAmount.toFixed(0)}</p>
        </Card>
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">Community</p>
          <p className="text-lg font-semibold text-white">Showcases: {data.showcases}</p>
          <p className="text-sm text-gray-400">Journals: {data.journals}</p>
        </Card>
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <p className="text-sm text-gray-400">AI Activity</p>
          <p className="text-lg font-semibold text-white">Marketing Assets: {data.marketingAssets}</p>
          <p className="text-sm text-gray-400">Optimizations: {data.optimizations.total}</p>
        </Card>
      </div>

      <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
        <h3 className="text-white font-semibold mb-2">AI Insights</h3>
        <p className="text-sm text-gray-200 whitespace-pre-wrap">{insights || 'No insights yet.'}</p>
      </Card>

      {forecast && (
        <Card className="bg-gray-950 border border-gold-500/40 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">📈 AI Forecasting & Predictive Analytics</h3>
            <span className="text-xs text-gray-400">7d / 30d / 90d projections</span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="bg-black border border-gray-800 p-3 rounded-xl">
              <p className="text-xs text-gray-400">User Growth (30d)</p>
              <p className="text-xl font-bold text-gold-300">{forecast.forecast.usersGrowth['30d']}</p>
            </Card>
            <Card className="bg-black border border-gray-800 p-3 rounded-xl">
              <p className="text-xs text-gray-400">Revenue Projection (30d)</p>
              <p className="text-xl font-bold text-green-400">
                £{forecast.forecast.revenueGrowth['30d'].toLocaleString()}
              </p>
            </Card>
            <Card className="bg-black border border-gray-800 p-3 rounded-xl">
              <p className="text-xs text-gray-400">ROI Forecast (30d)</p>
              <p className="text-xl font-bold text-gold-300">{forecast.forecast.roiProjection['30d']}%</p>
            </Card>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastLines}>
                <XAxis dataKey="label" stroke="#777" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Users" stroke="#FFD700" strokeWidth={2} />
                <Line type="monotone" dataKey="ROI" stroke="#22C55E" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{forecast.summary}</p>
        </Card>
      )}
    </div>
  )
}

