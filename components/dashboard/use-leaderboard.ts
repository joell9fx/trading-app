'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface LeaderboardUser {
  id: string
  email?: string | null
  name?: string | null
  xp: number
  rank_position?: number | null
  membership_tier?: string | null
  badges?: string[] | null
}

export function useLeaderboard(limit = 50) {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaderboard?limit=${limit}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load leaderboard')
        // API may return either { entries } or { leaderboard }
        setUsers(json.entries || json.leaderboard || [])
      } catch (error: any) {
        toast({ title: 'Error', description: error?.message || 'Could not load leaderboard', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [limit, toast])

  return { users, loading }
}

