'use client'

import { useState } from 'react'
import { useFundingSubmissions, PropFirmSubmission, SubmissionStatus } from './useFundingSubmissions'
import { FundingTable } from './FundingTable'
import { ReviewModal } from './ReviewModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowUpDown, Filter, RefreshCcw, Search } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface FundingDashboardProps {
  admin: { id: string; name?: string | null; email?: string | null }
}

const STATUS_OPTIONS: Array<'All' | SubmissionStatus> = ['All', 'Pending', 'Approved', 'Rejected']

export function FundingDashboard({ admin }: FundingDashboardProps) {
  const {
    submissions,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortDirection,
    setSortDirection,
    refresh,
    updateSubmission,
  } = useFundingSubmissions()

  const [selected, setSelected] = useState<PropFirmSubmission | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleReview = (submission: PropFirmSubmission) => {
    setSelected(submission)
  }

  const handleUpdateStatus = async (status: SubmissionStatus, admin_notes?: string) => {
    if (!selected) return
    setIsSaving(true)
    try {
      await updateSubmission(selected.id, { status, admin_notes })
      toast({
        title: `Submission ${status}`,
        description:
          status === 'Approved'
            ? '✅ Submission approved and user notified'
            : 'Submission rejected and user notified',
      })
      setSelected((prev) => (prev ? { ...prev, status, admin_notes } : prev))
    } catch (error: any) {
      console.error('Error updating submission status:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update submission',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNote = async (admin_notes: string) => {
    if (!selected) return
    setIsSaving(true)
    try {
      await updateSubmission(selected.id, { admin_notes })
      toast({
        title: 'Note saved',
        description: 'Admin note added successfully.',
      })
      setSelected((prev) => (prev ? { ...prev, admin_notes } : prev))
    } catch (error: any) {
      console.error('Error saving admin note:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save note',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">Funding Submissions</h1>
              <p className="text-gray-400 mt-1">
                Review, approve, or reject VisionEdge Funding submissions in real time.
              </p>
            </div>
            {admin?.name && (
              <div className="rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-sm text-gray-200">
                Signed in as <span className="font-semibold">{admin.name}</span>
              </div>
            )}
          </div>
        </div>

        <Card className="mb-4 bg-gray-900 border border-gray-800">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-white text-lg">Filters</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or account ID"
                  className="pl-9 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex h-10 rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort: {sortDirection === 'asc' ? 'Oldest' : 'Newest'}
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
                onClick={refresh}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="Pending" />
              <StatusBadge status="Approved" />
              <StatusBadge status="Rejected" />
            </div>
            <p className="text-xs text-gray-400">
              Live updates powered by Supabase Realtime. Actions are logged instantly for all admins.
            </p>
          </CardContent>
        </Card>

        <FundingTable submissions={submissions} loading={loading} onReview={handleReview} />
      </div>

      <ReviewModal
        submission={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleUpdateStatus}
        onSaveNote={handleSaveNote}
        isSaving={isSaving}
      />
    </div>
  )
}

