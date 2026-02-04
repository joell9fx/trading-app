'use client'

import { PropFirmSubmission } from './useFundingSubmissions'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface FundingTableProps {
  submissions: PropFirmSubmission[]
  loading: boolean
  onReview: (submission: PropFirmSubmission) => void
}

export function FundingTable({ submissions, loading, onReview }: FundingTableProps) {
  if (loading) {
    return (
      <Card className="bg-gray-900 border border-gray-800">
        <CardContent className="flex items-center gap-3 py-8 text-gray-200">
          <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
          <span>Loading submissions...</span>
        </CardContent>
      </Card>
    )
  }

  if (submissions.length === 0) {
    return (
      <Card className="bg-gray-900 border border-gray-800">
        <CardContent className="py-8 text-center text-gray-300">
          No submissions found.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border border-gray-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Account ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Submitted</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-950/40">
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-900/80 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-white">{submission.full_name}</td>
                  <td className="px-4 py-4 text-sm text-gray-200">{submission.account_id}</td>
                  <td className="px-4 py-4 text-sm text-gray-200">{submission.platform}</td>
                  <td className="px-4 py-4 text-sm text-gray-200">{submission.email}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={submission.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {new Date(submission.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      size="sm"
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                      onClick={() => onReview(submission)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

