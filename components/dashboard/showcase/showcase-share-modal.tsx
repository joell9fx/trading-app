'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ShareModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  preset?: { type: string; title: string }
  onShared?: () => void
}

export function ShowcaseShareModal({ open, onOpenChange, preset, onShared }: ShareModalProps) {
  const [type, setType] = useState(preset?.type || 'milestone')
  const [title, setTitle] = useState(preset?.title || '')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/showcase/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, caption }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to share')
      toast({ title: 'Shared!', description: 'Your highlight was posted to the community.' })
      onShared?.()
      onOpenChange(false)
      setCaption('')
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to share', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-gold-500/40 text-white max-w-lg">
        <h3 className="text-lg text-gold-400 font-semibold mb-2">Share Your Achievement</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-md bg-gray-900 border border-gray-700 text-white px-3"
            >
              <option value="badge">Badge</option>
              <option value="journal">Journal</option>
              <option value="lesson">Lesson</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-md bg-gray-900 border border-gray-700 text-white px-3"
              placeholder="e.g., Earned Elite Tier"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white"
              rows={3}
              placeholder="Add a short note..."
            />
          </div>
          <Button
            className="bg-gold-500 text-black font-semibold hover:bg-gold-600"
            onClick={handleShare}
            disabled={loading}
          >
            {loading ? 'Sharing...' : 'Post to Community'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

