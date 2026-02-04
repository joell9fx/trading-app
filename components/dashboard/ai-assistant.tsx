'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Bot, Send, Sparkles, Loader2, TrendingUp, BookOpen, HelpCircle, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  user: any
}

const QUICK_QUESTIONS = [
  { icon: TrendingUp, text: 'Analyze current market trends', prompt: 'What are the current market trends I should be aware of?' },
  { icon: BookOpen, text: 'Explain ICT concepts', prompt: 'Can you explain ICT (Inner Circle Trader) concepts?' },
  { icon: TrendingUp, text: 'Validate trade idea', prompt: 'I have a trade idea, can you help validate it?' },
  { icon: HelpCircle, text: 'Smart Money concepts', prompt: 'Explain Smart Money concepts in trading' },
]

export function AIAssistant({ user }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Trading Assistant. I can help you with market analysis, trade idea validation, ICT concepts, Smart Money concepts, and more. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const { toast } = useToast()

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      })
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again in a moment.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Trading Assistant</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Get instant market analysis, trade validation, and answers to your trading questions
        </p>
      </div>

      <Card className="h-[calc(100vh-250px)] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Chat with AI Assistant</CardTitle>
              <CardDescription>Ask me anything about trading, markets, or strategies</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <p className="text-sm font-medium text-gray-300 mb-3">Quick questions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {QUICK_QUESTIONS.map((q, idx) => {
                  const Icon = q.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q.prompt)}
                      className="flex items-center gap-2 p-3 text-left bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-gold-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{q.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-black" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gold-500 text-black'
                      : 'bg-gray-800 border border-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-black">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-black" />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
                    <span className="text-sm text-gray-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about trading..."
                disabled={isLoading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              AI responses are for educational purposes only. Always do your own research.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

