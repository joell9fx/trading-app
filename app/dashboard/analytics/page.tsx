import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsView } from '@/components/dashboard/analytics/analytics-view'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/dashboard/analytics')
  }

  const { data: trades } = await supabase
    .from('user_trades')
    .select('id, created_at, pair, result, risk_reward, profit')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(500)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Performance Analytics</h1>
      <p className="text-gray-400">Visualize your trading performance and get AI-driven insights.</p>
      <AnalyticsView trades={trades || []} />
    </div>
  )
}

