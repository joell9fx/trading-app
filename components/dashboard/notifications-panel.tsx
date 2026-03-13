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
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-2 text-muted-foreground">
            Stay up to date with funding updates and other alerts in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-border text-foreground/90 hover:border-primary/60 hover:text-primary"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground/90 hover:border-primary/60 hover:text-primary"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-panel border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground text-lg">Latest updates</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="bg-accent-muted text-primary border border-primary/40"
          >
            {unreadCount} unread
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-6 text-foreground/80">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-muted-foreground">
              No notifications yet. You’ll see updates here as they arrive.
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`px-4 py-4 transition-colors ${
                    notif.is_read ? 'bg-surface' : 'bg-accent-muted'
                  } hover:bg-panel cursor-pointer`}
                  onClick={() => {
                    Promise.resolve(onMarkAsRead(notif.id)).catch(() => {})
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{notif.title || 'Notification'}</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-line">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" />
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

