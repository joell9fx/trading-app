'use client'

import { Suspense, useState } from 'react'
import { ShowcaseFeed } from '@/components/dashboard/showcase/showcase-feed'
import { ShowcaseShareModal } from '@/components/dashboard/showcase/showcase-share-modal'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ShowcasePage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Showcase</h1>
          <p className="text-gray-400">Share milestones, badges, and journals with the community.</p>
        </div>
        <Button className="bg-gold-500 text-black font-semibold hover:bg-gold-600" onClick={() => setOpen(true)}>
          📢 Share Achievement
        </Button>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ShowcaseFeed />
      </Suspense>

      <ShowcaseShareModal open={open} onOpenChange={setOpen} />
    </div>
  )
}

