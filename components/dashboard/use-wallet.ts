'use client'

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface WalletBalance {
  available_credits: number
  total_earned: number
}

export interface WalletReward {
  id: string
  reward_type: string
  amount: number
  is_redeemed: boolean
  created_at: string
  transaction_type?: string
  description?: string
}

export function useWallet() {
  const [balance, setBalance] = useState<WalletBalance>({ available_credits: 0, total_earned: 0 })
  const [rewards, setRewards] = useState<WalletReward[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/wallet/get')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load wallet')
      setBalance(json.balance || { available_credits: 0, total_earned: 0 })
      setRewards(json.rewards || [])
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Could not load wallet', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  const redeem = async (service_key: string, cost: number) => {
    const res = await fetch('/api/wallet/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_key, cost }),
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error || 'Redeem failed')
    }
    await fetchWallet()
  }

  return { balance, rewards, loading, redeem, refresh: fetchWallet }
}

