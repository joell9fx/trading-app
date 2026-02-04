'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected'

export interface PropFirmSubmission {
  id: string
  user_id: string
  full_name: string
  account_id: string
  platform: string
  email: string
  status?: SubmissionStatus
  admin_notes?: string | null
  created_at: string
  updated_at?: string
}

export function useFundingSubmissions() {
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const [submissions, setSubmissions] = useState<PropFirmSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | SubmissionStatus>('All')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('prop_firm_submissions')
        .select('*')
        .order('created_at', { ascending: sortDirection === 'asc' })

      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching prop firm submissions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, statusFilter, sortDirection, toast])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  useEffect(() => {
    const channel = supabase
      .channel('prop_firm_submissions_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prop_firm_submissions' },
        (payload) => {
          setSubmissions((prev) => {
            if (payload.eventType === 'INSERT') {
              const newRow = payload.new as PropFirmSubmission
              const existing = prev.find((p) => p.id === newRow.id)
              return existing ? prev : [newRow, ...prev]
            }
            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as PropFirmSubmission
              return prev.map((p) => (p.id === updated.id ? updated : p))
            }
            if (payload.eventType === 'DELETE') {
              const removed = payload.old as PropFirmSubmission
              return prev.filter((p) => p.id !== removed.id)
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredSubmissions = useMemo(() => {
    const term = search.toLowerCase()
    return submissions.filter((s) => {
      const matchesSearch =
        !term ||
        s.full_name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.account_id?.toLowerCase().includes(term)

      const matchesStatus = statusFilter === 'All' || s.status === statusFilter || (!s.status && statusFilter === 'Pending')

      return matchesSearch && matchesStatus
    })
  }, [search, submissions, statusFilter])

  const updateSubmission = useCallback(
    async (id: string, updates: Partial<Pick<PropFirmSubmission, 'status' | 'admin_notes'>>) => {
      const response = await fetch('/api/prop-firm/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id, ...updates }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to update submission')
      }

      const updated = result?.submission as PropFirmSubmission
      if (updated?.id) {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)))
      }

      return updated
    },
    []
  )

  return {
    submissions: filteredSubmissions,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortDirection,
    setSortDirection,
    refresh: fetchSubmissions,
    updateSubmission,
  }
}

