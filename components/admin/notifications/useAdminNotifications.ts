'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type AdminNotification = {
  id: string
  user_id: string | null
  type: string | null
  title: string | null
  message: string | null
  is_read: boolean
  is_resolved?: boolean
  created_at: string
}

type StatusFilter = 'all' | 'unread' | 'resolved'
type TypeFilter = 'all' | 'funding_update' | 'community' | 'mentorship' | 'signal' | 'system' | 'general'
type DateFilter = 'all' | '7d' | '30d'

export function useAdminNotifications() {
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (typeFilter !== 'all') query = query.eq('type', typeFilter)
      if (statusFilter === 'unread') query = query.eq('is_read', false)
      if (statusFilter === 'resolved') query = query.eq('is_resolved', true)

      if (dateFilter !== 'all') {
        const days = dateFilter === '7d' ? 7 : 30
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - days)
        query = query.gte('created_at', fromDate.toISOString())
      }

      const { data, error } = await query
      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching admin notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, statusFilter, typeFilter, dateFilter, toast])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const channel = supabase
      .channel('notifications_admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new as AdminNotification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        (payload) => {
          const updated = payload.new as AdminNotification
          setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications' },
        (payload) => {
          const removed = payload.old as AdminNotification
          setNotifications((prev) => prev.filter((n) => n.id !== removed.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredNotifications = useMemo(() => {
    const term = search.toLowerCase()
    return notifications.filter((n) => {
      const matchesSearch =
        !term ||
        n.title?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term) ||
        n.type?.toLowerCase().includes(term)
      return matchesSearch
    })
  }, [notifications, search])

  const markAllRead = useCallback(async () => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    if (error) throw error
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }, [supabase])

  const clearResolved = useCallback(async () => {
    const { error } = await supabase.from('notifications').delete().eq('is_resolved', true)
    if (error) throw error
    setNotifications((prev) => prev.filter((n) => !n.is_resolved))
  }, [supabase])

  const updateNotification = useCallback(
    async (id: string, updates: Partial<Pick<AdminNotification, 'is_read' | 'is_resolved'>>) => {
      const { data, error } = await supabase.from('notifications').update(updates).eq('id', id).select().single()
      if (error) throw error
      setNotifications((prev) => prev.map((n) => (n.id === id ? (data as AdminNotification) : n)))
      return data as AdminNotification
    },
    [supabase]
  )

  const deleteNotification = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id)
      if (error) throw error
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    },
    [supabase]
  )

  return {
    notifications: filteredNotifications,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    refresh: fetchNotifications,
    markAllRead,
    clearResolved,
    updateNotification,
    deleteNotification,
  }
}

