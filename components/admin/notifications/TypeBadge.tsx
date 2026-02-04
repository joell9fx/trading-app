'use client'

import { cn } from '@/lib/utils'

type NotificationType = string | null | undefined

const typeStyles: Record<string, string> = {
  funding_update: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40',
  community: 'bg-green-500/20 text-green-200 border border-green-500/40',
  mentorship: 'bg-blue-500/20 text-blue-200 border border-blue-500/40',
  signal: 'bg-purple-500/20 text-purple-200 border border-purple-500/40',
  system: 'bg-red-500/20 text-red-200 border border-red-500/40',
}

export function TypeBadge({ type }: { type: NotificationType }) {
  const key = (type || 'general').toLowerCase()
  const style = typeStyles[key] || 'bg-gray-500/20 text-gray-200 border border-gray-500/40'
  const label = type ? type.replace('_', ' ') : 'general'

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize', style)}>
      {label}
    </span>
  )
}

