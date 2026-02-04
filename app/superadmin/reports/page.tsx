'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type SummaryResponse = {
  summary?: string
  metrics?: any
  error?: string
}

export default function SuperAdminReports() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SummaryResponse | null>(null)

  const runSummary = async () => {
    setLoading(true)
    const res = await fetch('/api/superadmin/summary', { method: 'POST' })
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="border border-gold-500/40 rounded-xl p-5 bg-neutral-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gold-300">AI Performance Summary</h2>
            <p className="text-sm text-gray-400">Aggregated metrics across operator, forecast, and security systems.</p>
          </div>
          <Button className="bg-gold-500 text-black hover:bg-gold-600" onClick={runSummary} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {data && (
        <div className="border border-gray-800 rounded-xl p-5 bg-black/60 space-y-3">
          {data.error && <p className="text-red-400 text-sm">{data.error}</p>}
          {data.summary && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Summary</h3>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{data.summary}</p>
            </div>
          )}
          {data.metrics && (
            <div className="space-y-1 text-xs text-gray-400">
              <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 overflow-auto">
                {JSON.stringify(data.metrics, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

