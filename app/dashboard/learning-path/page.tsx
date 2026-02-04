import { Suspense } from 'react'
import { LearningPathList } from '@/components/dashboard/learning-path-list'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LearningPathPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Adaptive Learning Path</h1>
      <p className="text-gray-400">AI-generated lessons and challenges tailored to your trading patterns.</p>
      <Suspense fallback={<LoadingSpinner />}>
        <LearningPathList />
      </Suspense>
    </div>
  )
}

