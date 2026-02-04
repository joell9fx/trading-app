'use client'

import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ReferralRow {
  id: string
  referral_code: string
  status: string
  created_at: string
}

export function ReferralCenter() {
  const { toast } = useToast()
  const [referralCode, setReferralCode] = useState<string>('')
  const [referralLink, setReferralLink] = useState<string>('')
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/referrals')
      if (res.ok) {
        const json = await res.json()
        setReferralCode(json.referral_code)
        const domain = process.env.NEXT_PUBLIC_SITE_URL || ''
        setReferralLink(`${domain}/signup?ref=${json.referral_code}`)
        setReferrals(json.referrals || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const signupCount = referrals.length
  const convertedCount = referrals.filter((r) => r.status === 'converted').length

  const nextMilestone = useMemo(() => {
    if (convertedCount >= 10) return '🚀 Influencer unlocked'
    if (convertedCount >= 5) return '🔥 Growth Agent unlocked — push to 10'
    if (convertedCount >= 2) return 'Keep going — 5 converted for badge'
    return 'Invite friends to start earning rewards'
  }, [convertedCount])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast({ title: 'Copied', description: 'Referral link copied to clipboard.' })
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to copy link', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="text-gray-300">Loading referrals...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-black border border-gold-500/50 p-6 text-center rounded-2xl">
          <h2 className="text-xl text-gold-400 font-bold mb-2">Invite Friends, Earn Rewards</h2>
          <p className="text-gray-400 mb-4">
            Share your link and earn unlocks, discounts, or upgrades.
          </p>
          <div className="bg-gray-900 p-3 rounded-lg text-white font-mono select-all break-all">
            {referralLink}
          </div>
          <Button onClick={copyLink} className="mt-3 bg-gold-500 text-black font-semibold hover:bg-gold-600">
            Copy Link
          </Button>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-white text-lg font-semibold mb-2">Referral Stats</h3>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Total signups</span>
              <span className="font-semibold">{signupCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Converted</span>
              <span className="font-semibold">{convertedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>XP earned</span>
              <span className="font-semibold">{convertedCount * 25}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">{nextMilestone}</p>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-white text-lg font-semibold mb-2">Milestones</h3>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-center justify-between">
              <span>1+ referrals</span>
              <Badge className={signupCount >= 1 ? 'bg-green-600/20 text-green-200' : 'bg-gray-800 text-gray-300'}>
                {signupCount >= 1 ? 'Unlocked' : 'Locked'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>5 converted</span>
              <Badge className={convertedCount >= 5 ? 'bg-green-600/20 text-green-200' : 'bg-gray-800 text-gray-300'}>
                {convertedCount >= 5 ? 'Unlocked' : 'Locked'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>10 converted</span>
              <Badge className={convertedCount >= 10 ? 'bg-green-600/20 text-green-200' : 'bg-gray-800 text-gray-300'}>
                {convertedCount >= 10 ? 'Unlocked' : 'Locked'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <h3 className="text-white text-lg font-semibold mb-3">Your Referrals</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-950/40">
              {referrals.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm text-white">{r.referral_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-200 capitalize">{r.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {referrals.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-400" colSpan={3}>
                    No referrals yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

