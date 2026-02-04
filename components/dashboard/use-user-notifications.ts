'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface UserNotification {
  id: string
  user_id: string
  type: string | null
  title: string | null
  message: string | null
  is_read: boolean
  created_at: string
}

export function useUserNotifications(userId?: string) {
  const supabase = createSupabaseClient()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, userId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications_user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as UserNotification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const markAsRead = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    },
    [supabase, userId]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }, [supabase, userId])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications])

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}

