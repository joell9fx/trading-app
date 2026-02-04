'use client'

import { useCallback, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  TrendingUp, 
  Plus, 
  ArrowUp, 
  ArrowDown,
  ArrowRight,
  Target,
  AlertTriangle,
  DollarSign,
  Sparkles,
  Clock,
  Filter,
  X,
  Heart,
  MessageCircle,
  Send
} from 'lucide-react'
import {
  ChartBarIcon,
  FireIcon,
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

interface Signal {
  id: string
  trading_pair: string
  direction: 'long' | 'short'
  entry_price: number
  stop_loss: number
  take_profit: number
  risk_reward_ratio: number
  status: 'active' | 'closed' | 'cancelled'
  notes: string
  created_at: string
  created_by: string
  likes_count?: number
  comments_count?: number
  user_liked?: boolean
}

interface SignalComment {
  id: string
  signal_id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    name: string
    email: string
  }
}

interface SignalsSectionProps {
  user: UserProfile
}

export function SignalsSection({ user }: SignalsSectionProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed' | 'cancelled'>('all')
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null)
  const [openDetails, setOpenDetails] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, SignalComment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({})
  const [newSignal, setNewSignal] = useState({
    trading_pair: '',
    direction: 'long' as 'long' | 'short',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    notes: ''
  })
  
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const loadSignals = useCallback(async () => {
    try {
      // Load signals with likes and comments count
      const { data: signalsData, error: signalsError } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })

      if (signalsError) throw signalsError

      // Load likes count and user's likes
      const signalIds = signalsData?.map(s => s.id) || []
      
      if (signalIds.length > 0) {
        const { data: likesData } = await supabase
          .from('signal_likes')
          .select('signal_id, user_id')
          .in('signal_id', signalIds)

        const { data: commentsData } = await supabase
          .from('signal_comments')
          .select('signal_id')
          .in('signal_id', signalIds)

        // Count likes and comments per signal
        const likesCount: Record<string, number> = {}
        const commentsCount: Record<string, number> = {}
        const userLikes: Record<string, boolean> = {}

        likesData?.forEach(like => {
          likesCount[like.signal_id] = (likesCount[like.signal_id] || 0) + 1
          if (like.user_id === user.id) {
            userLikes[like.signal_id] = true
          }
        })

        commentsData?.forEach(comment => {
          commentsCount[comment.signal_id] = (commentsCount[comment.signal_id] || 0) + 1
        })

        // Merge data
        const signalsWithCounts = signalsData?.map(signal => ({
          ...signal,
          likes_count: likesCount[signal.id] || 0,
          comments_count: commentsCount[signal.id] || 0,
          user_liked: userLikes[signal.id] || false,
        })) || []

        setSignals(signalsWithCounts)
      } else {
        setSignals([])
      }
    } catch (error) {
      console.error('Error loading signals:', error)
      toast({
        title: "Error",
        description: "Failed to load signals",
        variant: "destructive",
      })
    }
  }, [supabase, toast, user.id])

  useEffect(() => {
    loadSignals()
    
    const channel = supabase
      .channel('signals')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'signals' },
        () => {
          loadSignals()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadSignals, supabase])

  const loadComments = async (signalId: string) => {
    try {
      const { data, error } = await supabase
        .from('signal_comments')
        .select(`
          *,
          user:profiles!signal_comments_user_id_fkey(id, name, email)
        `)
        .eq('signal_id', signalId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(prev => ({ ...prev, [signalId]: data || [] }))
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleLike = async (signalId: string) => {
    try {
      const signal = signals.find(s => s.id === signalId)
      if (!signal) return

      if (signal.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('signal_likes')
          .delete()
          .eq('signal_id', signalId)
          .eq('user_id', user.id)

        if (error) throw error

        setSignals(prev => prev.map(s => 
          s.id === signalId 
            ? { ...s, user_liked: false, likes_count: (s.likes_count || 0) - 1 }
            : s
        ))
      } else {
        // Like
        const { error } = await supabase
          .from('signal_likes')
          .insert([{ signal_id: signalId, user_id: user.id }])

        if (error) throw error

        setSignals(prev => prev.map(s => 
          s.id === signalId 
            ? { ...s, user_liked: true, likes_count: (s.likes_count || 0) + 1 }
            : s
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    }
  }

  const handleComment = async (signalId: string) => {
    const commentText = newComment[signalId]?.trim()
    if (!commentText) return

    setIsSubmittingComment(prev => ({ ...prev, [signalId]: true }))

    try {
      const { error } = await supabase
        .from('signal_comments')
        .insert([{
          signal_id: signalId,
          user_id: user.id,
          content: commentText,
        }])

      if (error) throw error

      setNewComment(prev => ({ ...prev, [signalId]: '' }))
      await loadComments(signalId)
      
      // Update comments count
      setSignals(prev => prev.map(s => 
        s.id === signalId 
          ? { ...s, comments_count: (s.comments_count || 0) + 1 }
          : s
      ))

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [signalId]: false }))
    }
  }

  const toggleComments = (signalId: string) => {
    if (expandedSignal === signalId) {
      setExpandedSignal(null)
    } else {
      setExpandedSignal(signalId)
      if (!comments[signalId]) {
        loadComments(signalId)
      }
    }
  }

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const entryPrice = parseFloat(newSignal.entry_price)
      const stopLoss = parseFloat(newSignal.stop_loss)
      const takeProfit = parseFloat(newSignal.take_profit)
      
      const riskRewardRatio = Math.abs((takeProfit - entryPrice) / (entryPrice - stopLoss))

      const { error } = await supabase
        .from('signals')
        .insert([
          {
            trading_pair: newSignal.trading_pair.toUpperCase(),
            direction: newSignal.direction,
            entry_price: entryPrice,
            stop_loss: stopLoss,
            take_profit: takeProfit,
            risk_reward_ratio: riskRewardRatio,
            status: 'active',
            notes: newSignal.notes,
            created_by: user.id,
          },
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Signal created successfully!",
      })

      setNewSignal({
        trading_pair: '',
        direction: 'long',
        entry_price: '',
        stop_loss: '',
        take_profit: '',
        notes: ''
      })
      setShowCreateForm(false)
      loadSignals()
    } catch (error) {
      console.error('Error creating signal:', error)
      toast({
        title: "Error",
        description: "Failed to create signal",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
      case 'closed':
        return 'bg-gray-800 text-gray-400 border border-gray-700'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredSignals = filterStatus === 'all' 
    ? signals 
    : signals.filter(s => s.status === filterStatus)

  const activeSignalsCount = signals.filter(s => s.status === 'active').length
  const closedSignalsCount = signals.filter(s => s.status === 'closed').length

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-white border border-white/10 bg-[#0e141f] shadow-[0_20px_50px_-35px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15">
              <Sparkles className="h-4 w-4 text-gold-200" />
              <span className="text-gray-200">Live Trading Signals</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold">
              Trading Signals Dashboard
            </h1>
            <p className="text-gray-300 max-w-2xl">
              {user.role === 'ADMIN' 
                ? 'Create and manage trading signals for the community.'
                : 'Track live trading signals and risk across the pairs you follow.'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-gold-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-[#0f1624] border border-white/8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/15 border border-gold-500/25 rounded-xl">
                <FireIcon className="w-6 h-6 text-gold-300" />
              </div>
              <span className="text-xs font-semibold text-gold-200 bg-gold-500/15 border border-gold-500/25 px-2 py-1 rounded-full">
                Live
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Active Signals</p>
            <p className="text-3xl font-bold text-white">{activeSignalsCount}</p>
          </div>
        </Card>

        <Card className="bg-[#0f1624] border border-white/8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/15 border border-gold-500/25 rounded-xl">
                <Target className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Total Signals</p>
            <p className="text-3xl font-bold text-white">{signals.length}</p>
          </div>
        </Card>

        <Card className="bg-[#0f1624] border border-white/8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/15 border border-gold-500/25 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Closed Signals</p>
            <p className="text-3xl font-bold text-white">{closedSignalsCount}</p>
          </div>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Filter by status:</span>
          <div className="flex gap-2">
            {(['all', 'active', 'closed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                aria-pressed={filterStatus === status}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c] ${
                  filterStatus === status
                    ? 'bg-gold-500 text-black border-gold-400 shadow-sm'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {user.role === 'ADMIN' && (
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gold-500 hover:bg-gold-600 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Signal
          </Button>
        )}
      </div>

      {/* Create Signal Form (Admin Only) */}
      {user.role === 'ADMIN' && showCreateForm && (
        <Card className="border border-white/10 bg-white/5 shadow-lg">
          <CardHeader className="bg-transparent border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Create New Signal</CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  Share a trading opportunity with the community
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gold-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateSignal} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trading_pair" className="text-gray-200">Trading Pair</Label>
                  <Input
                    id="trading_pair"
                    value={newSignal.trading_pair}
                    onChange={(e) => setNewSignal({ ...newSignal, trading_pair: e.target.value })}
                    placeholder="e.g., BTC/USD, EUR/USD"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="direction" className="text-gray-200">Direction</Label>
                  <select
                    id="direction"
                    value={newSignal.direction}
                    onChange={(e) => setNewSignal({ ...newSignal, direction: e.target.value as 'long' | 'short' })}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e141f]"
                    required
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="entry_price" className="text-gray-200">Entry Price</Label>
                  <Input
                    id="entry_price"
                    type="number"
                    step="0.000001"
                    value={newSignal.entry_price}
                    onChange={(e) => setNewSignal({ ...newSignal, entry_price: e.target.value })}
                    placeholder="0.000000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="stop_loss" className="text-gray-200">Stop Loss</Label>
                  <Input
                    id="stop_loss"
                    type="number"
                    step="0.000001"
                    value={newSignal.stop_loss}
                    onChange={(e) => setNewSignal({ ...newSignal, stop_loss: e.target.value })}
                    placeholder="0.000000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="take_profit" className="text-gray-200">Take Profit</Label>
                  <Input
                    id="take_profit"
                    type="number"
                    step="0.000001"
                    value={newSignal.take_profit}
                    onChange={(e) => setNewSignal({ ...newSignal, take_profit: e.target.value })}
                    placeholder="0.000000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-gray-200">Notes</Label>
                <Input
                  id="notes"
                  value={newSignal.notes}
                  onChange={(e) => setNewSignal({ ...newSignal, notes: e.target.value })}
                  placeholder="Additional analysis or reasoning..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-white/10">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Create Signal
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Signals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredSignals.length > 0 ? (
          filteredSignals.map((signal) => {
            const isLong = signal.direction === 'long'
            const priceDiff = isLong 
              ? signal.take_profit - signal.entry_price 
              : signal.entry_price - signal.take_profit
            const stopDiff = isLong
              ? signal.entry_price - signal.stop_loss
              : signal.stop_loss - signal.entry_price
            
            return (
              <Card 
                key={signal.id} 
                className={`relative overflow-hidden transition-all duration-200 bg-white/5 border ${
                  signal.status === 'active' 
                    ? 'border-emerald-400/40 shadow-emerald-500/10 shadow-lg' 
                    : signal.status === 'closed'
                    ? 'border-white/10'
                    : 'border-red-500/30'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isLong ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`} />

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-white mb-1">
                        {signal.trading_pair}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{formatDate(signal.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isLong ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gold-500/20 border border-gold-500/30 rounded-lg">
                          <ArrowUp className="h-4 w-4 text-gold-400" />
                          <span className="text-xs font-bold text-gold-400">LONG</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <ArrowDown className="h-4 w-4 text-red-400" />
                          <span className="text-xs font-bold text-red-400">SHORT</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(signal.status)}`}>
                        {signal.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[12px]">
                        R:R {signal.risk_reward_ratio.toFixed(2)}
                      </div>
                      <div className="text-[12px] text-gray-400">
                        Entry ${signal.entry_price.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setOpenDetails(openDetails === signal.id ? null : signal.id)}
                      className="text-xs font-semibold text-gold-300 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]"
                    >
                      {openDetails === signal.id ? 'Hide details' : 'Tap to expand'}
                      <ArrowRight className={`h-4 w-4 transition-transform ${openDetails === signal.id ? 'rotate-90' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {openDetails === signal.id && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-xs font-medium text-gray-400 mb-1">Entry</p>
                          <p className="text-lg font-bold text-white">${signal.entry_price.toLocaleString()}</p>
                        </div>
                        <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
                          <p className="text-xs font-medium text-emerald-200 mb-1">R:R</p>
                          <p className="text-lg font-bold text-emerald-200">{signal.risk_reward_ratio.toFixed(2)}</p>
                        </div>
                        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                          <p className="text-xs font-medium text-red-200 mb-1">Stop</p>
                          <p className="text-lg font-bold text-red-200">${signal.stop_loss.toLocaleString()}</p>
                          <p className="text-xs text-red-200/90 mt-1">-{stopDiff.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                          <p className="text-xs font-medium text-green-200 mb-1">Take Profit</p>
                          <p className="text-lg font-bold text-green-200">${signal.take_profit.toLocaleString()}</p>
                          <p className="text-xs text-green-200/90 mt-1">+{priceDiff.toFixed(2)}</p>
                        </div>
                      </div>

                      {signal.notes && (
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {signal.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-1 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-400">Risk/Reward</span>
                          <span className="font-semibold text-white">
                            {signal.risk_reward_ratio.toFixed(2)}:1
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className={`h-full ${
                              signal.risk_reward_ratio >= 2 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : signal.risk_reward_ratio >= 1 
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                                : 'bg-gradient-to-r from-red-500 to-rose-500'
                            }`}
                            style={{ width: `${Math.min((signal.risk_reward_ratio / 3) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 flex items-center gap-3">
                    <button
                      onClick={() => handleLike(signal.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c] ${
                        signal.user_liked
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${signal.user_liked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{signal.likes_count || 0}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(signal.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{signal.comments_count || 0}</span>
                    </button>
                  </div>

                  {expandedSignal === signal.id && (
                    <div className="pt-3 border-t border-white/10 space-y-4">
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {comments[signal.id]?.length > 0 ? (
                          comments[signal.id].map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-gold-500/20 border border-gold-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-gold-300 text-xs font-medium">
                                  {comment.user?.name?.charAt(0).toUpperCase() || comment.user?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-white">
                                    {comment.user?.name || comment.user?.email?.split('@')[0] || 'User'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={newComment[signal.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [signal.id]: e.target.value }))}
                          placeholder="Add a comment..."
                          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleComment(signal.id)
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleComment(signal.id)}
                          disabled={!newComment[signal.id]?.trim() || isSubmittingComment[signal.id]}
                          size="sm"
                          className="bg-gold-500 hover:bg-gold-600 text-black"
                        >
                          {isSubmittingComment[signal.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="col-span-full border-2 border-dashed border-gray-700 bg-gray-900">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {filterStatus === 'all' ? 'No signals yet' : `No ${filterStatus} signals`}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {user.role === 'ADMIN' 
                  ? filterStatus === 'all'
                    ? 'Create the first trading signal for the community!'
                    : `No ${filterStatus} signals found. Try a different filter.`
                  : 'Check back later for new trading signals.'
                }
              </p>
              {user.role === 'ADMIN' && filterStatus === 'all' && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Signal
                </Button>
              )}
              {filterStatus !== 'all' && (
                <Button 
                  onClick={() => setFilterStatus('all')}
                  variant="outline"
                >
                  Show All Signals
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SignalsSection;
