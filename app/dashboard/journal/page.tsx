import { Suspense } from 'react'
import { JournalList } from '@/components/dashboard/journal/journal-list'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Growth Journal</h1>
      <p className="text-gray-400">Weekly AI-written summaries of your performance, mindset, and focus.</p>
      <Suspense fallback={<LoadingSpinner />}>
        <JournalList />
      </Suspense>
    </div>
  )
}

