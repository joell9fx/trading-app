'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type TimelineEvent = {
  date: string
  type: string
  title: string
  description?: string
  icon?: string
}

const typeClass = (type: string) => {
  if (type === 'badge') return 'border-green-400'
  if (type === 'lesson') return 'border-blue-400'
  if (type === 'journal') return 'border-border'
  if (type === 'start') return 'border-primary'
  return 'border-primary'
}

export function VisionTimelineClient({ timeline }: { timeline: TimelineEvent[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return timeline.filter((t) => filter === 'all' || t.type === filter)
  }, [timeline, filter])

  useEffect(() => {
    fetch('/api/timeline/view', { method: 'POST' }).catch(() => {})
  }, [])

  return (
    <Card className="bg-surface border border-primary/40 p-6 rounded-2xl">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-2xl text-primary font-bold">🛤️ Your VisionEdge Journey</h2>
        <div className="ml-auto flex gap-2 text-xs">
          {['all', 'journal', 'lesson', 'badge', 'start'].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              className={filter === f ? '' : 'border-border text-foreground/90'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative border-l border-primary/40 ml-4">
        {filtered.map((event, i) => (
          <motion.div
            key={`${event.type}-${event.date}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="mb-10 ml-6"
          >
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]">
              {event.icon || '•'}
            </span>
            <div className={`border-l-4 pl-3 ${typeClass(event.type)} border-opacity-60`}>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-muted-foreground text-sm">{new Date(event.date).toLocaleDateString()}</p>
              {event.description && (
                <p className="mt-1 text-foreground/80 text-sm whitespace-pre-line line-clamp-3">{event.description}</p>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted-foreground text-sm ml-6">No events match this filter yet.</div>
        )}
      </div>
    </Card>
  )
}

