import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin Logs' }

interface AdminLogRow {
  id: string
  admin_id: string | null
  action: string | null
  module: string | null
  context: Record<string, unknown> | null
  timestamp: string | null
}

// Owner-only: the superadmin layout already redirects anyone without is_owner.
export default async function SuperAdminLogsPage() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('admin_logs')
    .select('id, admin_id, action, module, context, timestamp')
    .order('timestamp', { ascending: false })
    .limit(200)

  const logs = (data || []) as AdminLogRow[]

  const adminIds = Array.from(new Set(logs.map((l) => l.admin_id).filter(Boolean))) as string[]
  const { data: admins } = adminIds.length
    ? await supabase.from('profiles').select('id, name, full_name, email').in('id', adminIds)
    : { data: [] as { id: string; name: string | null; full_name: string | null; email: string | null }[] }
  const adminName = new Map((admins || []).map((a) => [a.id, a.full_name || a.name || a.email || a.id]))

  return (
    <div className="space-y-4">
      <div className="border border-gold-500/40 rounded-xl p-5 bg-neutral-950">
        <h2 className="text-xl font-semibold text-gold-300">Admin Logs</h2>
        <p className="text-sm text-gray-400">Latest 200 privileged actions (role changes, flags, announcements).</p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">
          Could not load logs: {error.message}
        </p>
      )}

      <div className="border border-gray-800 rounded-xl overflow-x-auto bg-neutral-950">
        <table className="min-w-full divide-y divide-gray-800 text-sm">
          <thead>
            <tr>
              {['When', 'Admin', 'Action', 'Module', 'Details'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                </td>
                <td className="px-3 py-2 text-gray-200">{log.admin_id ? adminName.get(log.admin_id) || log.admin_id : 'system'}</td>
                <td className="px-3 py-2 font-mono text-gold-200">{log.action || '—'}</td>
                <td className="px-3 py-2 text-gray-300">{log.module || '—'}</td>
                <td className="px-3 py-2">
                  {log.context ? (
                    <pre className="max-w-md whitespace-pre-wrap break-words text-xs text-gray-400">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                  No admin actions logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
