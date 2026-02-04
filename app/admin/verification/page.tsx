'use client'

import { useEffect, useState } from 'react'

type VerificationStatus = 'pending' | 'approved' | 'rejected'

type Verification = {
  id: string
  user_id: string
  status: VerificationStatus
  reviewer_id: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    email?: string
    full_name?: string
    has_ai_tools_access?: boolean
  }
  reviewer?: {
    id: string
    email?: string
    full_name?: string
  }
}

const STATUS_OPTIONS: VerificationStatus[] = ['pending', 'approved', 'rejected']

export default function AdminVerificationPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newUserId, setNewUserId] = useState('')

  const loadVerifications = async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/verification', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load verifications')
      const data = await res.json()
      setVerifications(data.verifications || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVerifications()
  }, [])

  const updateStatus = async (payload: { id?: string; user_id: string; status: VerificationStatus }) => {
    try {
      setSavingId(payload.id || payload.user_id)
      setError(null)
      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update verification')
      }

      await loadVerifications()
    } catch (err: any) {
      setError(err?.message || 'Failed to update verification')
    } finally {
      setSavingId(null)
    }
  }

  const handleAddUser = async () => {
    if (!newUserId) return
    await updateStatus({ user_id: newUserId, status: 'pending' })
    setNewUserId('')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gold-400 mb-2">User Verification Console</h1>
        <p className="text-gray-300">
          Admin-only verification console. Manage KYC/KYB flows, approvals, and reviewer audit trails.
        </p>
      </div>

      <div className="rounded-xl border border-gold-500/40 bg-gray-900 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
          <input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="User ID to verify"
            className="flex-1 rounded-lg bg-black/40 border border-gold-500/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/60"
          />
          <button
            onClick={handleAddUser}
            className="px-4 py-2 rounded-lg bg-gold-500 text-black font-semibold hover:bg-gold-400 transition disabled:opacity-60"
            disabled={!newUserId || savingId !== null}
          >
            Add to queue
          </button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <div className="rounded-xl border border-gold-500/40 bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gold-300">Pending verifications</h2>
          {loading && <span className="text-xs text-gray-400">Loading...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">AI Tools</th>
                <th className="py-2 pr-3">Reviewer</th>
                <th className="py-2 pr-3">Updated</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifications.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    No verification records yet.
                  </td>
                </tr>
              )}
              {verifications.map((v) => {
                const currentStatus = v.status
                return (
                  <tr key={v.id} className="border-t border-white/5">
                    <td className="py-2 pr-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">{v.user?.full_name || 'Unknown user'}</span>
                        <span className="text-xs text-gray-400">{v.user?.email || v.user_id}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          currentStatus === 'approved'
                            ? 'bg-green-500/20 text-green-300'
                            : currentStatus === 'rejected'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-yellow-500/20 text-yellow-200'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-sm">
                      {v.user?.has_ai_tools_access ? (
                        <span className="text-green-300">Enabled</span>
                      ) : (
                        <span className="text-gray-400">Disabled</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-sm text-gray-300">
                      {v.reviewer?.full_name || '—'}
                    </td>
                    <td className="py-2 pr-3 text-xs text-gray-400">
                      {new Date(v.updated_at || v.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-0 text-right space-x-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus({ id: v.id, user_id: v.user_id, status })}
                          disabled={savingId === v.id || savingId === v.user_id}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border transition ${
                            status === currentStatus
                              ? 'bg-gold-500 text-black border-gold-500'
                              : 'border-gold-500/40 text-gold-200 hover:bg-gold-500/10'
                          } disabled:opacity-50`}
                        >
                          {status}
                        </button>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

