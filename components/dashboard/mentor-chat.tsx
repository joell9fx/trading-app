'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ChatMessage {
  role: 'user' | 'assistant'
  message: string
  created_at?: string
}

export function MentorChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/mentor/history?user_id=${userId}`)
      const json = await res.json()
      if (res.ok) {
        setMessages(json || [])
      }
    }
    load()
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const newMsg: ChatMessage = { role: 'user', message: input }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: newMsg.message }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send message')
      setMessages((prev) => [...prev, { role: 'assistant', message: json.reply }])
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to send', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-black border border-gold-500/50 rounded-2xl p-4 h-[70vh] flex flex-col">
      <h2 className="text-2xl text-gold-400 font-bold mb-3">🧠 Your AI Mentor</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[75%] ${
              m.role === 'user' ? 'ml-auto bg-gold-500 text-black' : 'mr-auto bg-neutral-900 text-gray-200 border border-gold-500/20'
            }`}
          >
            {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-neutral-800 border border-gray-700 rounded-xl p-2 text-white"
          placeholder="Ask your mentor anything..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
        <Button
          onClick={sendMessage}
          className="bg-gold-500 text-black px-4 py-2 rounded-xl font-semibold hover:bg-gold-600"
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Send'}
        </Button>
      </div>
    </Card>
  )
}

