'use client'

import { useCallback, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Send } from 'lucide-react'

interface FundingAccountSectionProps {
  user: any
}

interface PropFirmSubmission {
  id: string
  user_id: string
  full_name: string
  account_id: string
  platform: string
  email: string
  status?: 'Pending' | 'Approved' | 'Rejected'
  admin_notes?: string | null
  created_at: string
}

const FIRM_NAME = 'VisionEdge Funding'
const PLATFORM_OPTIONS = ['MT4', 'MT5', 'cTrader', 'TradingView', 'Other']

export function FundingAccountSection({ user }: FundingAccountSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingSubmission, setLoadingSubmission] = useState(false)
  const [latestSubmission, setLatestSubmission] = useState<PropFirmSubmission | null>(null)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    account_id: '',
    platform: 'MT5',
    email: user?.email || ''
  })

  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const loadLatestSubmission = useCallback(async () => {
    setLoadingSubmission(true)
    try {
      const { data, error } = await supabase
        .from('prop_firm_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error
      setLatestSubmission(data?.[0] || null)
    } catch (error) {
      console.error('Error loading prop firm submission:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your submission status',
        variant: 'destructive'
      })
    } finally {
      setLoadingSubmission(false)
    }
  }, [supabase, toast, user.id])

  useEffect(() => {
    loadLatestSubmission()
  }, [loadLatestSubmission])

  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`prop_firm_submissions_user_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prop_firm_submissions', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as PropFirmSubmission
          setLatestSubmission((prev) => {
            if (!prev) return updated
            const updatedDate = new Date(updated.created_at).getTime()
            const prevDate = new Date(prev.created_at).getTime()
            return updatedDate >= prevDate ? updated : prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.full_name.trim() || !formData.account_id.trim() || !formData.platform.trim() || !formData.email.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields before submitting.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/prop-firm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to submit evaluation details')
      }

      const submission = result?.data?.[0] as PropFirmSubmission | undefined
      if (submission) {
        setLatestSubmission(submission)
      } else {
        await loadLatestSubmission()
      }

      toast({
        title: 'Submission sent',
        description: '✅ Submission sent to VisionEdge Funding. You’ll be notified once reviewed.'
      })

      setShowForm(false)
      setFormData((prev) => ({
        ...prev,
        account_id: '',
        platform: 'MT5'
      }))
    } catch (error: any) {
      console.error('Error submitting prop firm details:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Unable to submit your evaluation details right now.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Funding Account Support</h1>
        <p className="mt-2 text-gray-400">
          Track your evaluation progress and funded account status
        </p>
      </div>

      <Card className="bg-gray-900 border border-gray-800">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-white">{FIRM_NAME}</CardTitle>
            <CardDescription className="text-gray-400">
              Submit your evaluation details to be reviewed by our funding partner.
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gold-500 hover:bg-gold-600 text-black shadow-[0_0_15px_rgba(255,215,0,0.25)]"
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Off Now
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSubmission ? (
            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4 text-gray-300">
              Loading your submission status...
            </div>
          ) : latestSubmission ? (
            <div className="rounded-lg border border-gold-500/30 bg-gold-500/5 p-4">
              <div className="flex items-center gap-3 text-gold-300">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">Submitted to {FIRM_NAME}</p>
                  <p className="text-xs text-gray-300">Awaiting review</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-gray-200 md:grid-cols-2">
                <div>
                  <p className="text-gray-400">Full Name</p>
                  <p className="font-medium">{latestSubmission.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Account / Evaluation ID</p>
                  <p className="font-medium">{latestSubmission.account_id}</p>
                </div>
                <div>
                  <p className="text-gray-400">Platform</p>
                  <p className="font-medium">{latestSubmission.platform}</p>
                </div>
                <div>
                  <p className="text-gray-400">Contact</p>
                  <p className="font-medium">{latestSubmission.email}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="font-semibold">
                    {latestSubmission.status || 'Pending'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-400">Submitted</p>
                  <p className="font-medium">{new Date(latestSubmission.created_at).toLocaleString()}</p>
                </div>
                {latestSubmission.admin_notes && (
                  <div className="md:col-span-2">
                    <p className="text-gray-400">Admin Notes</p>
                    <p className="font-medium text-gray-100">{latestSubmission.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4 text-gray-300">
              Share your evaluation details to send them to {FIRM_NAME}. We’ll notify you once the review is complete.
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-gray-900 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Send Your Evaluation Details</CardTitle>
            <CardDescription className="text-gray-400">
              Provide the details requested by {FIRM_NAME} so we can forward them for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-gray-200">Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Jane Doe"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Account ID / Evaluation ID</Label>
                  <Input
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    placeholder="VEF-123456"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Trading Platform</Label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    required
                  >
                    {PLATFORM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Email or Discord</Label>
                  <Input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com or DiscordHandle#0000"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold-500 hover:bg-gold-600 text-black disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Submit for Evaluation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

