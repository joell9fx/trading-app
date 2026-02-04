'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: string
  lesson_content: string
  challenge_goal: string
  resource_link: string
  status: string
  progress: number
}

export function LearningPathList() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/user/learning-paths')
    const json = await res.json()
    if (res.ok) {
      setPaths(json.paths || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const markComplete = async (id: string) => {
    const res = await fetch('/api/coach/learning-path/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: json.error || 'Failed to complete lesson', variant: 'destructive' })
      return
    }
    toast({ title: 'Completed', description: 'Lesson completed. XP awarded.' })
    load()
  }

  return (
    <Card className="bg-black border border-gold-500/40 p-6 rounded-2xl">
      <h2 className="text-2xl text-gold-400 font-bold mb-4">📚 My Learning Path</h2>
      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && paths.length === 0 && <p className="text-gray-400">No learning paths yet.</p>}
      {!loading &&
        paths.map((p) => (
          <div key={p.id} className="mb-4 p-4 rounded-xl bg-neutral-900 border border-gray-700">
            <h3 className="text-white font-semibold">{p.title}</h3>
            <p className="text-gray-400 text-sm mb-2">{p.description}</p>

            <div className="text-gray-300 text-sm whitespace-pre-line mb-3">{p.lesson_content}</div>
            {p.challenge_goal && <p className="text-gold text-sm">🎯 Challenge: {p.challenge_goal}</p>}
            {p.resource_link && (
              <a href={p.resource_link} target="_blank" className="text-blue-400 underline text-sm mt-1 inline-block">
                Learn More →
              </a>
            )}

            <Progress value={p.progress} className="mt-3 h-2 bg-gray-700" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Difficulty: {p.difficulty || 'n/a'}</span>
              {p.status !== 'completed' ? (
                <Button onClick={() => markComplete(p.id)} className="bg-gold-500 text-black text-xs hover:bg-gold-600">
                  Mark as Complete
                </Button>
              ) : (
                <span className="text-green-400 text-xs font-semibold">Completed</span>
              )}
            </div>
          </div>
        ))}
    </Card>
  )
}

