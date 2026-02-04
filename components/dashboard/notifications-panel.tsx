'use client'

import { UserNotification } from './use-user-notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Loader2 } from 'lucide-react'

interface NotificationsPanelProps {
  notifications: UserNotification[]
  loading: boolean
  unreadCount: number
  onMarkAsRead: (id: string) => Promise<void> | void
  onMarkAllAsRead: () => Promise<void> | void
  onRefresh: () => Promise<void> | void
}

export function NotificationsPanel({
  notifications,
  loading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
}: NotificationsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-2 text-gray-400">
            Stay up to date with funding updates and other alerts in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-gray-900 border border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold-400" />
            <CardTitle className="text-white text-lg">Latest updates</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="bg-gold-500/20 text-gold-200 border border-gold-500/40"
          >
            {unreadCount} unread
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-6 text-gray-300">
              <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-400">
              No notifications yet. You’ll see updates here as they arrive.
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`px-4 py-4 transition-colors ${
                    notif.is_read ? 'bg-gray-950' : 'bg-gold-500/5'
                  } hover:bg-gray-900/70 cursor-pointer`}
                  onClick={() => {
                    Promise.resolve(onMarkAsRead(notif.id)).catch(() => {})
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{notif.title || 'Notification'}</p>
                      <p className="text-sm text-gray-300 whitespace-pre-line">{notif.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-400" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

