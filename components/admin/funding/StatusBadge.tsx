'use client'

import { cn } from '@/lib/utils'

type Status = 'Pending' | 'Approved' | 'Rejected' | string | undefined | null

export function StatusBadge({ status }: { status: Status }) {
  const normalized = status || 'Pending'

  const styles = (() => {
    switch (normalized) {
      case 'Approved':
        return 'bg-green-500/20 text-green-300 border border-green-500/40'
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border border-red-500/40'
      default:
        return 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40'
    }
  })()

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        styles
      )}
    >
      {normalized}
    </span>
  )
}

