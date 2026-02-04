'use client'

import { useState } from 'react'
import { useAdminNotifications } from './useAdminNotifications'
import { FilterBar } from './FilterBar'
import { NotificationTable } from './NotificationTable'
import { NotificationModal } from './NotificationModal'
import { Card } from '@/components/ui/card'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function AdminNotifications({ adminName }: { adminName: string }) {
  const {
    notifications,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    refresh,
    markAllRead,
    clearResolved,
    updateNotification,
    deleteNotification,
  } = useAdminNotifications()

  const [selected, setSelected] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleMarkRead = async (id: string) => {
    setIsProcessing(true)
    try {
      await updateNotification(id, { is_read: true })
      toast({ title: 'Marked as read' })
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResolve = async (id: string) => {
    setIsProcessing(true)
    try {
      await updateNotification(id, { is_resolved: true, is_read: true })
      toast({ title: 'Notification resolved' })
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsProcessing(true)
    try {
      await deleteNotification(id)
      toast({ title: 'Notification deleted' })
      setSelected(null)
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to delete', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const safeMarkAllRead = async () => {
    try {
      await markAllRead()
      toast({ title: 'All notifications marked as read' })
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to mark all as read', variant: 'destructive' })
    }
  }

  const safeClearResolved = async () => {
    try {
      await clearResolved()
      toast({ title: 'Resolved notifications cleared' })
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to clear resolved', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
            <h1 className="text-3xl font-bold text-white">System Notifications ⚡️</h1>
            <p className="text-gray-400 mt-1">Monitor all system and user activity events in real time.</p>
          </div>
          <div className="rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-sm text-gray-200">
            Signed in as <span className="font-semibold">{adminName}</span>
          </div>
        </div>

        <Card className="bg-gray-900 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Filters & Bulk Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
              onMarkAllRead={safeMarkAllRead}
              onClearResolved={safeClearResolved}
              onRefresh={refresh}
            />
          </CardContent>
        </Card>

        <NotificationTable notifications={notifications} loading={loading} onView={setSelected} />

        <NotificationModal
          notification={selected}
          onClose={() => setSelected(null)}
          onMarkRead={handleMarkRead}
          onResolve={handleResolve}
          onDelete={handleDelete}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  )
}

