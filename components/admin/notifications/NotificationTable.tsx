'use client'

import { AdminNotification } from './useAdminNotifications'
import { TypeBadge } from './TypeBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface NotificationTableProps {
  notifications: AdminNotification[]
  loading: boolean
  onView: (notification: AdminNotification) => void
}

export function NotificationTable({ notifications, loading, onView }: NotificationTableProps) {
  if (loading) {
    return (
      <Card className="bg-gray-900 border border-gray-800">
        <CardContent className="flex items-center gap-3 py-8 text-gray-200">
          <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
          <span>Loading notifications...</span>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className="bg-gray-900 border border-gray-800">
        <CardContent className="py-8 text-center text-gray-300">
          No notifications found.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border border-gray-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-950/40">
              {notifications.map((notif) => (
                <tr
                  key={notif.id}
                  className={`hover:bg-gray-900/80 transition-colors ${
                    notif.is_read ? '' : 'bg-gold-500/5'
                  }`}
                >
                  <td className="px-4 py-3 text-sm">
                    <TypeBadge type={notif.type} />
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{notif.title || 'Untitled'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 line-clamp-2 max-w-lg">
                    {notif.message || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200">
                    {notif.is_resolved ? 'Resolved' : notif.is_read ? 'Read' : 'Unread'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(notif.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                      onClick={() => onView(notif)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

