'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { 
  MessageCircle, 
  Send, 
  Users,
  User,
  Sparkles,
  Wifi,
  WifiOff,
  Smile,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  Hash,
  Plus,
  Search,
  X,
  Settings
} from 'lucide-react'
import {
  UserGroupIcon,
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MEMBER'
  bio?: string
  timezone?: string
  avatar_url?: string
  created_at: string
}

interface ChatMessage {
  id: string
  content: string
  created_at: string
  user_id: string
  channel?: string
  profiles?: {
    name?: string
    email?: string
    avatar_url?: string
  }
}

interface OnlineUser {
  user_id: string
  online_at: string
  profile?: {
    name?: string
    email?: string
    avatar_url?: string
  }
}

interface ChatChannel {
  id: string
  name: string
  description?: string
  is_private?: boolean
  created_at?: string
  last_message_at?: string
  unread_count?: number
}

interface RealTimeChatProps {
  user: UserProfile
}

export function RealTimeChat({ user }: RealTimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [activeChannel, setActiveChannel] = useState<string>('global')
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [channelSearch, setChannelSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesChannelRef = useRef<any>(null)
  const presenceChannelRef = useRef<any>(null)
  
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const initializeDefaultChannels = useCallback(async () => {
    try {
      // Check if default channels exist by checking for messages
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('channel')
        .in('channel', ['global', 'analysis'])
        .limit(1)

      const existingChannels = new Set(existingMessages?.map(m => m.channel) || [])

      // Create global channel if it doesn't exist
      if (!existingChannels.has('global')) {
        await supabase
          .from('messages')
          .insert([
            {
              content: 'Welcome to Global Chat! This is the main discussion channel for all members.',
              user_id: user.id,
              channel: 'global',
            },
          ])
      }

      // Create analysis channel if it doesn't exist
      if (!existingChannels.has('analysis')) {
        await supabase
          .from('messages')
          .insert([
            {
              content: 'Welcome to Analysis Chat! Share your market analysis, trading insights, and technical analysis here.',
              user_id: user.id,
              channel: 'analysis',
            },
          ])
      }
    } catch (error) {
      console.error('Error initializing default channels:', error)
    }
  }, [supabase, user.id])

  const loadChannels = useCallback(async () => {
    try {
      // Initialize default channels first
      await initializeDefaultChannels()

      // Get unique channels from messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('channel, created_at')
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      // Get unique channels and their last message time
      const channelMap = new Map<string, { last_message_at: string }>()
      messagesData?.forEach((msg: any) => {
        if (!channelMap.has(msg.channel) || 
            new Date(msg.created_at) > new Date(channelMap.get(msg.channel)!.last_message_at)) {
          channelMap.set(msg.channel, { last_message_at: msg.created_at })
        }
      })

      // Create channel objects with descriptions
      const channelDescriptions: Record<string, string> = {
        'global': 'General discussion for all members',
        'analysis': 'Share market analysis and trading insights',
      }

      const channelsList: ChatChannel[] = Array.from(channelMap.entries()).map(([name, data]) => ({
        id: name,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        description: channelDescriptions[name] || undefined,
        last_message_at: data.last_message_at,
        unread_count: 0
      }))

      // Sort by priority: global first, then analysis, then by last message time
      const priorityOrder: Record<string, number> = {
        'global': 1,
        'analysis': 2,
      }

      channelsList.sort((a, b) => {
        const priorityA = priorityOrder[a.id] || 999
        const priorityB = priorityOrder[b.id] || 999
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        
        const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
        const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
        return timeB - timeA
      })

      setChannels(channelsList)
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }, [initializeDefaultChannels, supabase])

  const loadMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', activeChannel)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      
      // Fetch profiles for all messages
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, email, avatar_url')
            .eq('id', msg.user_id)
            .single()
          
          return { 
            ...msg, 
            profiles: profileData || null 
          }
        })
      )
      
      setMessages(messagesWithProfiles)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      })
    }
  }, [activeChannel, supabase, toast])

  const setupRealtime = useCallback(async () => {
    // Clean up existing channel if any
    if (messagesChannelRef.current) {
      await supabase.removeChannel(messagesChannelRef.current)
    }

    // Subscribe to new messages for the active channel
    const messagesChannel = supabase
      .channel(`messages-channel-${activeChannel}`, {
        config: {
          broadcast: { self: true }
        }
      })
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel=eq.${activeChannel}`
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage
          // Only add if it's for the active channel
          if (newMessage.channel === activeChannel) {
            // Fetch profile for new message
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, email, avatar_url')
              .eq('id', newMessage.user_id)
              .single()
            
            setMessages(prev => [...prev, {
              ...newMessage,
              profiles: profileData || undefined
            }])
            
            // Update channels list
            loadChannels()
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })
    
    messagesChannelRef.current = messagesChannel
  }, [activeChannel, loadChannels, supabase])

  const setupPresence = useCallback(async () => {
    // Subscribe to presence for online users
    const presenceChannel = supabase
      .channel('presence-channel', {
        config: {
          presence: {
            key: user.id
          }
        }
      })
      .on('presence', { event: 'sync' }, async () => {
        const state = presenceChannel.presenceState()
        const userIds = Object.keys(state)
        
        // Fetch profiles for online users
        const onlineUsersWithProfiles = await Promise.all(
          userIds.map(async (userId) => {
            const presence = state[userId]?.[0] as any
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, email, avatar_url')
              .eq('id', userId)
              .single()
            
            return {
              user_id: userId,
              online_at: presence?.online_at || new Date().toISOString(),
              profile: profileData || undefined
            }
          })
        )
        
        setOnlineUsers(onlineUsersWithProfiles)
      })
      .on('presence', { event: 'join' }, async ({ key }) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email, avatar_url')
          .eq('id', key)
          .single()
        
        setOnlineUsers(prev => {
          // Avoid duplicates
          if (prev.find(u => u.user_id === key)) return prev
          return [...prev, {
            user_id: key,
            online_at: new Date().toISOString(),
            profile: profileData || undefined
          }]
        })
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => prev.filter(u => u.user_id !== key))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ 
            user_id: user.id, 
            online_at: new Date().toISOString() 
          })
        }
      })
    
    presenceChannelRef.current = presenceChannel
  }, [supabase, user.id])

  useEffect(() => {
    loadChannels()
  }, [loadChannels])

  useEffect(() => {
    loadMessages()
    setupRealtime()
    
    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current)
      }
    }
  }, [activeChannel, loadMessages, setupRealtime, supabase])

  useEffect(() => {
    setupPresence()
    
    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current)
      }
    }
  }, [setupPresence, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSending(true)

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage.trim(),
            user_id: user.id,
            channel: activeChannel,
          },
        ])

      if (error) throw error

      setNewMessage('')
      loadChannels() // Refresh channels to update last message time
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    setIsCreatingChannel(true)

    try {
      // Create a test message to establish the channel
      const channelSlug = newChannelName.trim().toLowerCase().replace(/\s+/g, '-')
      
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: `Welcome to #${newChannelName.trim()}!`,
            user_id: user.id,
            channel: channelSlug,
          },
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: `Channel #${newChannelName.trim()} created!`,
      })

      setNewChannelName('')
      setNewChannelDescription('')
      setShowCreateChannel(false)
      setActiveChannel(channelSlug)
      loadChannels()
    } catch (error) {
      console.error('Error creating channel:', error)
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      })
    } finally {
      setIsCreatingChannel(false)
    }
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(channelSearch.toLowerCase())
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.charAt(0).toUpperCase() || 'U'
  }

  const getUserName = (message: ChatMessage) => {
    return message.profiles?.name || message.profiles?.email?.split('@')[0] || 'Unknown User'
  }

  const isSameUser = (currentMsg: ChatMessage, previousMsg: ChatMessage | null) => {
    return previousMsg && currentMsg.user_id === previousMsg.user_id
  }

  const isNewDay = (currentMsg: ChatMessage, previousMsg: ChatMessage | null) => {
    if (!previousMsg) return true
    const currentDate = new Date(currentMsg.created_at).toDateString()
    const previousDate = new Date(previousMsg.created_at).toDateString()
    return currentDate !== previousDate
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gold-600 via-gold-500 to-gold-600 rounded-2xl p-8 text-black shadow-xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-gray-800" />
                <span className="text-gray-800 text-sm font-medium">Live Chat</span>
                {isConnected ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/30 rounded-full">
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/30 rounded-full">
                    <WifiOff className="h-3 w-3" />
                    <span className="text-xs">Connecting...</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Real-time Chat
              </h1>
              <p className="text-gray-800 text-lg max-w-2xl">
                Connect with other traders, share insights, and discuss market trends in real-time
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-12 h-12 text-black" />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Channels Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border border-gray-800 bg-gray-900 h-[650px] flex flex-col">
            <CardHeader className="bg-gray-900 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <Hash className="h-5 w-5 text-gold-400" />
                  Channels
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCreateChannel(!showCreateChannel)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gold-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search channels..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="pl-8 h-9 text-sm bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {showCreateChannel && (
                <div className="p-4 border-b border-gray-800 bg-gray-900">
                  <form onSubmit={createChannel} className="space-y-3">
                    <div>
                      <Input
                        placeholder="Channel name (e.g., Trading Tips)"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="h-9 text-sm bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isCreatingChannel || !newChannelName.trim()}
                        className="flex-1 bg-gold-500 hover:bg-gold-600 text-black"
                      >
                        {isCreatingChannel ? 'Creating...' : 'Create'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCreateChannel(false)
                          setNewChannelName('')
                        }}
                        className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              <div className="space-y-1 p-2">
                {filteredChannels.length > 0 ? (
                  filteredChannels.map((channel) => {
                    const isActive = channel.id === activeChannel
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                          isActive
                            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-black shadow-md'
                            : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <Hash className={`h-4 w-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${isActive ? 'text-black' : 'text-gray-300'}`}>
                            {channel.name}
                          </p>
                          {channel.last_message_at && (
                            <p className={`text-xs truncate ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                              {formatTime(channel.last_message_at)}
                            </p>
                          )}
                        </div>
                        {channel.unread_count && channel.unread_count > 0 && !isActive && (
                          <span className="bg-gold-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {channel.unread_count}
                          </span>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Hash className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No channels found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-3">
          <Card className="h-[650px] flex flex-col shadow-lg border-2 border-gray-800 bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                    <Hash className="h-5 w-5 text-gold-400" />
                    {channels.find(c => c.id === activeChannel)?.name || 'Chat'}
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-400">
                    {channels.find(c => c.id === activeChannel)?.description || 'Share insights and connect with the community'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{onlineUsers.length} online</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                {messages.length > 0 ? (
                  messages.map((message, index) => {
                    const previousMessage = index > 0 ? messages[index - 1] : null
                    const showAvatar = !isSameUser(message, previousMessage)
                    const showDateSeparator = isNewDay(message, previousMessage)
                    const isOwnMessage = message.user_id === user.id
                    const userName = getUserName(message)
                    const initials = getInitials(message.profiles?.name, message.profiles?.email)

                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-4">
                            <div className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700 text-xs text-gray-400 font-medium">
                              {formatDate(message.created_at)}
                            </div>
                          </div>
                        )}
                        <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                          {showAvatar ? (
                            <div className="flex-shrink-0">
                              {message.profiles?.avatar_url ? (
                                <div className="relative h-10 w-10">
                                  <Image 
                                    src={message.profiles.avatar_url} 
                                    alt={userName}
                                    fill
                                    unoptimized
                                    className="rounded-full object-cover border-2 border-gray-800 shadow"
                                    sizes="40px"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center border-2 border-gray-800 shadow">
                                  <span className="text-black font-semibold text-sm">
                                    {initials}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-10"></div>
                          )}
                          <div className={`flex-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col max-w-[70%]`}>
                            {showAvatar && (
                              <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className="text-xs font-semibold text-gray-300">
                                  {isOwnMessage ? 'You' : userName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                            )}
                            <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-black rounded-br-sm'
                                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm'
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                            {isOwnMessage && (
                              <div className="flex items-center gap-1 mt-1">
                                <CheckCheck className="h-3 w-3 text-gold-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-300 font-medium mb-2">No messages yet</p>
                    <p className="text-sm text-gray-500">Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <form onSubmit={sendMessage} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isSending || !isConnected}
                      className="pr-12 h-12 rounded-xl border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-gold-500 focus:ring-gold-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage(e as any)
                        }
                      }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Add emoji"
                      >
                        <Smile className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Attach file"
                      >
                        <Paperclip className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim() || !isConnected}
                    className="h-12 px-6 bg-gold-500 hover:bg-gold-600 text-black rounded-xl"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    Not connected. Please wait...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Online Users */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border border-gray-800 bg-gray-900">
            <CardHeader className="bg-gray-900 border-b border-gray-800">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                <UserGroupIcon className="h-5 w-5 text-gold-400" />
                Online Users
              </CardTitle>
              <CardDescription className="text-gray-400">
                {onlineUsers.length} {onlineUsers.length === 1 ? 'member' : 'members'} active
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {onlineUsers.length > 0 ? (
                  onlineUsers.map((onlineUser) => {
                    const isCurrentUser = onlineUser.user_id === user.id
                    const userName = onlineUser.profile?.name || onlineUser.profile?.email?.split('@')[0] || 'User'
                    const initials = getInitials(onlineUser.profile?.name, onlineUser.profile?.email)
                    
                    return (
                      <div 
                        key={onlineUser.user_id} 
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors border ${
                          isCurrentUser ? 'bg-gold-500/10 border-gold-500/30' : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="relative">
                          {onlineUser.profile?.avatar_url ? (
                            <div className="relative h-10 w-10">
                              <Image 
                                src={onlineUser.profile.avatar_url} 
                                alt={userName}
                                fill
                                unoptimized
                                className="rounded-full object-cover border-2 border-gray-800 shadow"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-gradient-to-br from-gold-500 via-gold-400 to-gold-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow">
                              <span className="text-black font-semibold text-sm">
                                {initials}
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {isCurrentUser ? 'You' : userName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isCurrentUser ? 'Online' : 'Active now'}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500">
                      No users online
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RealTimeChat;

