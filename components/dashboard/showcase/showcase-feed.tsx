'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface ShowcasePost {
  id: string
  user_id: string
  type: string
  title: string
  caption: string
  image_url?: string | null
  likes: number
  comments_count: number
  created_at: string
  profiles?: { id: string; name?: string | null; full_name?: string | null; avatar_url?: string | null }
}

export function ShowcaseFeed() {
  const [posts, setPosts] = useState<ShowcasePost[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/showcase/list')
    const json = await res.json()
    if (res.ok) {
      setPosts(json.posts || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const likePost = async (postId: string) => {
    const res = await fetch('/api/showcase/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId }),
    })
    if (!res.ok) {
      const json = await res.json()
      toast({ title: 'Error', description: json.error || 'Failed to like', variant: 'destructive' })
      return
    }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)))
  }

  const addComment = async (postId: string, text: string) => {
    if (!text.trim()) return
    const res = await fetch('/api/showcase/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, comment: text }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: json.error || 'Failed to comment', variant: 'destructive' })
      return
    }
    toast({ title: 'Comment added' })
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p)))
  }

  return (
    <div className="space-y-4">
      {loading && <p className="text-gray-400">Loading feed...</p>}
      {!loading && posts.length === 0 && <p className="text-gray-400">No showcase posts yet.</p>}
      {posts.map((post) => (
        <Card key={post.id} className="bg-neutral-900 border border-gold-500/30 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8" src={post.profiles?.avatar_url || undefined} />
            <div>
              <p className="text-gold-400 text-sm font-semibold">
                {post.profiles?.name || post.profiles?.full_name || 'Trader'}
              </p>
              <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {post.image_url && (
            <div className="rounded-xl overflow-hidden border border-gold-500/20">
              <img src={post.image_url} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          <h3 className="text-white font-semibold">{post.title}</h3>
          <p className="text-gray-300 text-sm">{post.caption}</p>

          <div className="flex items-center gap-4 text-sm text-gray-300">
            <button onClick={() => likePost(post.id)} className="hover:text-gold-400 transition-colors">
              ❤️ {post.likes}
            </button>
            <button className="hover:text-gold-400 transition-colors">
              💬 {post.comments_count}
            </button>
          </div>

          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
              placeholder="Add a comment..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addComment(post.id, (e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <Button
              variant="outline"
              className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[placeholder="Add a comment..."]')
                if (input?.value) {
                  addComment(post.id, input.value)
                  input.value = ''
                }
              }}
            >
              Post
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

