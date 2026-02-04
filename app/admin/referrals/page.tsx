import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminReferralsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/admin/referrals')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { data: referralData } = await supabase
    .from('referrals')
    .select('id, referrer_id, referred_id, reward_status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: rewardData } = await supabase
    .from('referral_rewards')
    .select('id, user_id, reward_type, amount, is_redeemed, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="container mx-auto px-4 py-6 text-white space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
        <h1 className="text-3xl font-bold">Referrals</h1>
        <p className="text-gray-400 mt-1">Monitor referrals and rewards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Referrals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900/70">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Referrer</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Referred</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {referralData?.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 text-sm text-gray-200">{r.referrer_id}</td>
                    <td className="px-3 py-2 text-sm text-gray-200">{r.referred_id}</td>
                    <td className="px-3 py-2 text-sm text-gray-300 capitalize">{r.reward_status}</td>
                    <td className="px-3 py-2 text-sm text-gray-400">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!referralData || referralData.length === 0) && (
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-400" colSpan={4}>
                      No referrals yet.
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Redeemed</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rewardData?.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 text-sm text-gray-200">{r.user_id}</td>
                    <td className="px-3 py-2 text-sm text-gray-200">{r.reward_type}</td>
                    <td className="px-3 py-2 text-sm text-gray-200">{r.amount}</td>
                    <td className="px-3 py-2 text-sm text-gray-200">{r.is_redeemed ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2 text-sm text-gray-400">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!rewardData || rewardData.length === 0) && (
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
    </div>
  )
}

