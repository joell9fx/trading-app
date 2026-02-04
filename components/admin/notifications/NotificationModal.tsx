'use client'

import { useEffect, useState } from 'react'
import { AdminNotification } from './useAdminNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TypeBadge } from './TypeBadge'
import { X } from 'lucide-react'
import Link from 'next/link'

interface NotificationModalProps {
  notification: AdminNotification | null
  onClose: () => void
  onMarkRead: (id: string) => Promise<void>
  onResolve: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isProcessing: boolean
}

export function NotificationModal({
  notification,
  onClose,
  onMarkRead,
  onResolve,
  onDelete,
  isProcessing,
}: NotificationModalProps) {
  const [localNotif, setLocalNotif] = useState(notification)

  useEffect(() => {
    setLocalNotif(notification)
  }, [notification])

  if (!localNotif) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-3xl">
        <Card className="bg-gray-950 border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-white flex items-center gap-2">
                <TypeBadge type={localNotif.type} />
                <span>{localNotif.title || 'Notification'}</span>
              </CardTitle>
              <p className="text-xs text-gray-400">
                {new Date(localNotif.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {localNotif.message || 'No message provided.'}
              </p>
            </div>

            {localNotif.user_id && (
              <div className="text-sm text-gray-300">
                User:{' '}
                <Link
                  href={`/admin/users/${localNotif.user_id}`}
                  className="text-gold-400 hover:text-gold-300 underline"
                >
                  {localNotif.user_id}
                </Link>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
                onClick={() => onMarkRead(localNotif.id)}
                disabled={localNotif.is_read || isProcessing}
              >
                {localNotif.is_read ? 'Read' : isProcessing ? 'Updating...' : 'Mark as Read'}
              </Button>
              <Button
                variant="outline"
                className="border-green-500/50 text-green-300 hover:bg-green-500/10"
                onClick={() => onResolve(localNotif.id)}
                disabled={localNotif.is_resolved || isProcessing}
              >
                {localNotif.is_resolved ? 'Resolved' : isProcessing ? 'Updating...' : 'Mark as Resolved'}
              </Button>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                onClick={() => onDelete(localNotif.id)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

