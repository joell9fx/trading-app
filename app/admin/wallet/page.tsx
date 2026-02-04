import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminWalletPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/admin/wallet')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { data: balances } = await supabase.from('user_wallet_balance').select('*').limit(200)
  const { data: rewards } = await supabase
    .from('referral_rewards')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="container mx-auto px-4 py-6 text-white space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
        <h1 className="text-3xl font-bold">Wallet Overview</h1>
        <p className="text-gray-400 mt-1">View balances and recent wallet activity.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Balances</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">User</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Available Credits</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {balances?.map((b: any) => (
                <tr key={b.user_id}>
                  <td className="px-3 py-2 text-sm text-gray-200">{b.user_id}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{b.available_credits}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{b.total_earned}</td>
                </tr>
              ))}
              {(!balances || balances.length === 0) && (
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-400" colSpan={3}>
                    No balances yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Rewards</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">User</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Transaction</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rewards?.map((r: any) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 text-sm text-gray-200">{r.user_id}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{r.reward_type}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{r.amount}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">{r.transaction_type || 'earn'}</td>
                  <td className="px-3 py-2 text-sm text-gray-400">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!rewards || rewards.length === 0) && (
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-400" colSpan={5}>
                    No rewards yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

