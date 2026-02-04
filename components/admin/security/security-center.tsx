'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'

interface AuditRow {
  id: string
  category: string
  issue: string
  severity: string
  recommendation: string
  status: string
  created_at: string
}

export function SecurityCenter() {
  const { toast } = useToast()
  const [audits, setAudits] = useState<AuditRow[]>([])
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [aRes, rRes] = await Promise.all([fetch('/api/admin/security/logs'), fetch('/api/admin/security/report')])
      if (aRes.ok) {
        const j = await aRes.json()
        setAudits(j.audits || [])
      }
      if (rRes.ok) {
        const j = await rRes.json()
        setReport(j.summary || '')
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load security data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const runNow = async () => {
    setRunning(true)
    const res = await fetch('/api/admin/security/run', { method: 'POST' })
    if (!res.ok) {
      toast({ title: 'Run failed', description: 'Audit could not start', variant: 'destructive' })
    } else {
      toast({ title: 'Audit triggered' })
      await load()
    }
    setRunning(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-300">
        <LoadingSpinner /> <span>Loading security center...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black border border-gold-500/50 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gold-400 font-bold">🛡️ Compliance & Security Guardian</h1>
            <p className="text-sm text-gray-400">
              Daily AI checks for vulnerabilities, data risks, and GDPR alignment.
            </p>
          </div>
          <Button onClick={runNow} disabled={running} className="bg-gold-500 text-black hover:bg-gold-600">
            {running ? 'Running...' : 'Run Audit'}
          </Button>
        </div>
      </Card>

      <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
        <h3 className="text-white font-semibold mb-2">Weekly Security Report</h3>
        <p className="text-sm text-gray-200 whitespace-pre-wrap">{report || 'No report yet.'}</p>
      </Card>

      <div className="space-y-3">
        {audits.map((a) => (
          <Card
            key={a.id}
            className={`p-4 rounded-lg border ${
              a.severity === 'critical'
                ? 'border-red-500/70'
                : a.severity === 'high'
                  ? 'border-orange-500/70'
                  : 'border-gray-700'
            } bg-neutral-950`}
          >
            <div className="flex items-center justify-between">
              <p className="text-gold-300 font-semibold">{(a.category || 'misc').toUpperCase()}</p>
              <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-200 mt-1">{a.issue}</p>
            <p className="text-xs text-gray-400 italic">Severity: {a.severity}</p>
            <p className="text-sm text-green-400 mt-2">{a.recommendation}</p>
          </Card>
        ))}
        {audits.length === 0 && <p className="text-sm text-gray-500">No audits yet.</p>}
      </div>
    </div>
  )
}

