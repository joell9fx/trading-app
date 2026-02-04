import { NextResponse } from 'next/server'
import { requireAdmin } from '../auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  // parallel fetches
  const [
    usersRes,
    referralsRes,
    payoutsRes,
    campaignsRes,
    journalsRes,
    showcasesRes,
    marketingRes,
    optimizationsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('xp, membership_tier', { count: 'exact' }),
    supabase.from('referrals').select('status', { count: 'exact' }),
    supabase.from('affiliate_payouts').select('amount, status', { count: 'exact' }),
    supabase.from('ad_campaigns').select('spend, revenue, roi, platform', { count: 'exact' }),
    supabase.from('mentor_journal').select('id', { count: 'exact', head: true }),
    supabase.from('user_showcase_posts').select('id', { count: 'exact', head: true }),
    supabase.from('marketing_assets').select('id', { count: 'exact', head: true }),
    supabase.from('optimization_logs').select('old_roi, new_roi', { count: 'exact' }),
  ])

  const userCount = usersRes.count || 0
  const totalXp = (usersRes.data || []).reduce((s, u: any) => s + Number(u.xp || 0), 0)
  const avgXp = userCount > 0 ? totalXp / userCount : 0
  const tierDist = (usersRes.data || []).reduce<Record<string, number>>((acc, u: any) => {
    const tier = u.membership_tier || 'Unknown'
    acc[tier] = (acc[tier] || 0) + 1
    return acc
  }, {})

  const referralCount = referralsRes.count || 0
  const referralConversions = (referralsRes.data || []).filter((r: any) => r.status === 'converted').length

  const payoutPending = (payoutsRes.data || []).filter((p: any) => p.status === 'pending')
  const payoutPaid = (payoutsRes.data || []).filter((p: any) => p.status === 'paid')
  const payoutTotals = {
    pending: payoutPending.reduce((s, p: any) => s + Number(p.amount || 0), 0),
    paid: payoutPaid.reduce((s, p: any) => s + Number(p.amount || 0), 0),
  }

  const totalRevenue = (campaignsRes.data || []).reduce((s, c: any) => s + Number(c.revenue || 0), 0)
  const totalSpend = (campaignsRes.data || []).reduce((s, c: any) => s + Number(c.spend || 0), 0)
  const avgRoi =
    totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0

  const roiByPlatform = (campaignsRes.data || []).reduce<Record<string, { spend: number; revenue: number }>>(
    (acc, c: any) => {
      const key = c.platform || 'Unknown'
      acc[key] = acc[key] || { spend: 0, revenue: 0 }
      acc[key].spend += Number(c.spend || 0)
      acc[key].revenue += Number(c.revenue || 0)
      return acc
    },
    {}
  )

  const optimizationCount = optimizationsRes.count || 0
  const avgImprovement =
    (optimizationsRes.data || []).reduce((s, o: any) => s + (Number(o.new_roi || 0) - Number(o.old_roi || 0)), 0) /
    Math.max((optimizationsRes.data || []).length, 1)

  return NextResponse.json({
    users: {
      total: userCount,
      avgXp,
      tierDist,
    },
    referrals: {
      total: referralCount,
      conversions: referralConversions,
    },
    payouts: {
      pendingAmount: payoutTotals.pending,
      paidAmount: payoutTotals.paid,
      pendingCount: payoutPending.length,
      paidCount: payoutPaid.length,
    },
    campaigns: {
      total: campaignsRes.count || 0,
      totalSpend,
      totalRevenue,
      avgRoi,
      roiByPlatform,
    },
    journals: journalsRes.count || 0,
    showcases: showcasesRes.count || 0,
    marketingAssets: marketingRes.count || 0,
    optimizations: {
      total: optimizationCount,
      avgImprovement,
    },
  })
}

