'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type UserRow = {
  id: string
  email: string
  full_name?: string | null
  role?: string | null
  is_admin?: boolean | null
  is_owner?: boolean | null
  banned?: boolean | null
  created_at?: string | null
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/superadmin/users')
    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Failed to load users')
    } else {
      setUsers(json.users || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const updateField = async (userId: string, field: 'is_admin' | 'is_owner' | 'banned', value: boolean) => {
    setUpdating(userId + field)
    setError(null)
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, field, value }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Update failed')
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u)))
    } catch (err: any) {
      setError(err?.message || 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">User Management</h2>
          <p className="text-sm text-gray-400">Toggle admin/owner flags or ban accounts.</p>
        </div>
        <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="overflow-auto border border-gray-800 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="bg-black/40">
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{u.full_name || u.email}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                  <div className="text-[10px] text-gray-600">{u.id}</div>
                </td>
                <td className="px-4 py-3 text-gray-200">{u.role || 'member'}</td>
                <td className="px-4 py-3 space-x-2">
                  {u.is_owner && <Badge className="bg-gold-500/20 text-gold-200 border-gold-500/40">Owner</Badge>}
                  {u.is_admin && <Badge className="bg-blue-500/20 text-blue-100 border-blue-500/30">Admin</Badge>}
                  {u.banned && <Badge className="bg-red-500/20 text-red-200 border-red-500/30">Banned</Badge>}
                </td>
                <td className="px-4 py-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-200 hover:border-gold-500/60"
                      disabled={updating !== null || u.is_owner === true}
                      onClick={() => updateField(u.id, 'is_admin', !u.is_admin)}
                    >
                      {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gold-500/60 text-gold-200 hover:border-gold-400"
                      disabled={updating !== null || u.is_owner === true}
                      onClick={() => updateField(u.id, 'is_owner', !u.is_owner)}
                    >
                      {u.is_owner ? 'Owner (locked)' : 'Promote Owner'}
                    </Button>
                    <Button
                      size="sm"
                      variant={u.banned ? 'secondary' : 'destructive'}
                      className={u.banned ? '' : 'bg-red-600 text-white hover:bg-red-700'}
                      disabled={updating !== null || u.is_owner === true}
                      onClick={() => updateField(u.id, 'banned', !u.banned)}
                    >
                      {u.banned ? 'Unban' : 'Ban'}
                    </Button>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Created {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

