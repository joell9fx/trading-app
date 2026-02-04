'use client'

import { useEffect, useState } from 'react'
import { PropFirmSubmission, SubmissionStatus } from './useFundingSubmissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from './StatusBadge'
import { X } from 'lucide-react'

interface ReviewModalProps {
  submission: PropFirmSubmission | null
  onClose: () => void
  onUpdateStatus: (status: SubmissionStatus, admin_notes?: string) => Promise<void>
  onSaveNote: (admin_notes: string) => Promise<void>
  isSaving: boolean
}

export function ReviewModal({ submission, onClose, onUpdateStatus, onSaveNote, isSaving }: ReviewModalProps) {
  const [notes, setNotes] = useState(submission?.admin_notes || '')

  useEffect(() => {
    setNotes(submission?.admin_notes || '')
  }, [submission])

  if (!submission) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-3xl">
        <Card className="bg-gray-950 border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Review Submission</CardTitle>
              <p className="text-sm text-gray-400">Review and take action on this submission.</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoItem label="Full Name" value={submission.full_name} />
              <InfoItem label="Email" value={submission.email} />
              <InfoItem label="Platform" value={submission.platform} />
              <InfoItem label="Account / Evaluation ID" value={submission.account_id} />
              <InfoItem label="Submitted" value={new Date(submission.created_at).toLocaleString()} />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-400">Status</p>
                <StatusBadge status={submission.status} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Admin Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add feedback, decisions, or next steps..."
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
                  onClick={() => onSaveNote(notes)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Add Note'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-400">
                Actions are reflected in real time for all admins and the user dashboard.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                  onClick={() => onUpdateStatus('Rejected', notes)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Processing...' : 'Reject'}
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-black"
                  onClick={() => onUpdateStatus('Approved', notes)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-white">{value || '—'}</p>
    </div>
  )
}

