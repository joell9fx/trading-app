'use client'

import { useWallet } from './use-wallet'
import { useUserServices } from './use-user-services'
import { ALL_SERVICES } from '@/lib/services-list'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCheckout } from './use-checkout'
import { useToast } from '@/hooks/use-toast'

export function WalletView() {
  const { balance, rewards, loading, redeem, refresh } = useWallet()
  const { services } = useUserServices()
  const { handleCheckout } = useCheckout()
  const { toast } = useToast()

  const unlockedMap = services
  const lockedServices = ALL_SERVICES.filter((s) => !unlockedMap[s.key])

  const redeemCredits = async (serviceKey: string, cost: number) => {
    try {
      await redeem(serviceKey, cost)
      toast({ title: 'Unlocked', description: `You unlocked ${serviceKey} with credits.` })
    } catch (error: any) {
      toast({ title: 'Redeem failed', description: error?.message || 'Unable to redeem', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-black border border-gold-500/50 p-6 text-center rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.08)]">
          <h2 className="text-2xl text-gold-400 font-bold">Rewards Wallet</h2>
          <p className="text-gray-400 mt-1">Earn credits through referrals and use them to unlock features.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-white text-3xl font-bold">{balance.available_credits ?? 0} 💰</div>
            <span className="text-gray-500">credits available</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {balance.total_earned ?? 0} credits earned total
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300" onClick={refresh} disabled={loading}>
              Refresh
            </Button>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-white text-lg font-semibold mb-3">Rewards</h3>
          <div className="space-y-3 max-h-72 overflow-auto pr-2">
            {rewards.length === 0 && <p className="text-sm text-gray-400">No rewards yet.</p>}
            {rewards.map((r) => (
              <div key={r.id} className="border border-gray-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">
                    {r.reward_type === 'discount' ? `Discount ${r.amount}%` : `Credit ${r.amount}`}
                  </p>
                  <p className="text-xs text-gray-500">{r.description || new Date(r.created_at).toLocaleString()}</p>
                </div>
                <Badge className={r.is_redeemed ? 'bg-green-500/20 text-green-200' : 'bg-gray-800 text-gray-200'}>
                  {r.transaction_type === 'spend' ? 'Spent' : r.is_redeemed ? 'Redeemed' : 'Earned'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-white text-lg font-semibold mb-3">Redeem for Unlocks</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lockedServices.map((service) => {
            const enough = (balance.available_credits || 0) >= (service.credit_cost || 0)
            return (
              <Card key={service.key} className="bg-neutral-900 border border-gray-700 p-4 text-center rounded-xl">
                <h3 className="text-white font-semibold">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{service.description}</p>
                <div className="flex flex-col gap-2">
                  <Button
                    disabled={!enough}
                    onClick={() => redeemCredits(service.key, service.credit_cost || 0)}
                    className="bg-gold-500 text-black font-semibold w-full hover:bg-gold-600 disabled:opacity-60"
                  >
                    Redeem {service.credit_cost || 0} Credits
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
                    onClick={() => handleCheckout(service.key)}
                  >
                    Unlock with Payment
                  </Button>
                  {!enough && (
                    <p className="text-xs text-gray-500">Not enough credits yet</p>
                  )}
                </div>
              </Card>
            )
          })}
          {lockedServices.length === 0 && (
            <Card className="bg-neutral-900 border border-gray-800 p-6 text-center rounded-xl text-gray-300">
              All services are unlocked! 🎉
            </Card>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-white text-lg font-semibold mb-3">Reward History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-950/40">
              {rewards.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200 capitalize">
                    {r.transaction_type === 'spend' ? 'Spent' : 'Earned'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{r.description || '-'}</td>
                  <td className={`px-4 py-3 text-sm ${Number(r.amount) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Number(r.amount) > 0 ? '+' : ''}{r.amount}
                  </td>
                </tr>
              ))}
              {rewards.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-400" colSpan={4}>
                    No reward history yet.
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

