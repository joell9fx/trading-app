import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminRole } from '@/utils/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Users' }

const PAGE_SIZE = 50

interface UserRow {
  id: string
  name: string | null
  full_name: string | null
  email: string | null
  username: string | null
  role: string | null
  membership_tier: string | null
  banned: boolean | null
  created_at: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/admin/users')
  }

  const { data: me } = await supabase.from('profiles').select('role, is_owner').eq('id', user.id).single()
  if (!isAdminRole(me?.role, me?.is_owner)) {
    redirect('/dashboard')
  }

  const q = (searchParams.q || '').trim().slice(0, 100)
  const page = Math.max(1, Number.parseInt(searchParams.page || '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('profiles')
    .select('id, name, full_name, email, username, role, membership_tier, banned, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (q) {
    // Escape PostgREST filter syntax characters before building the or() filter
    const safe = q.replace(/[,()%*\\]/g, ' ')
    query = query.or(`email.ilike.%${safe}%,name.ilike.%${safe}%,full_name.ilike.%${safe}%,username.ilike.%${safe}%`)
  }

  const { data, count, error } = await query
  const users = (data || []) as UserRow[]
  const total = count ?? users.length
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/admin/users?${s}` : '/admin/users'
  }

  return (
    <div className="container mx-auto px-4 py-6 text-white space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-400 mt-1">
            {total.toLocaleString()} {total === 1 ? 'account' : 'accounts'}
            {q ? ` matching "${q}"` : ''}
          </p>
        </div>
        <form action="/admin/users" className="flex gap-2 w-full md:w-auto">
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <input
            id="user-search"
            name="q"
            defaultValue={q}
            placeholder="Search name, email or username"
            className="w-full md:w-72 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-black hover:bg-gold-400"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">
          Could not load users: {error.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900/70">
            <tr>
              {['User', 'Email', 'Role', 'Tier', 'Status', 'Joined', ''].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2 text-sm text-gray-100">
                  {u.full_name || u.name || '—'}
                  {u.username && <span className="block text-xs text-gray-500">@{u.username}</span>}
                </td>
                <td className="px-3 py-2 text-sm text-gray-300">{u.email || '—'}</td>
                <td className="px-3 py-2 text-sm capitalize text-gray-300">{u.role || 'member'}</td>
                <td className="px-3 py-2 text-sm text-gray-300">{u.membership_tier || 'Standard'}</td>
                <td className="px-3 py-2 text-sm">
                  {u.banned ? (
                    <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-200">Banned</span>
                  ) : (
                    <span className="rounded bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-200">Active</span>
                  )}
                </td>
                <td className="px-3 py-2 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-sm text-right">
                  <Link href={`/admin/users/${u.id}/services`} className="text-gold-400 hover:underline">
                    Services
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && !error && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-400" colSpan={7}>
                  {q ? 'No users match that search.' : 'No users yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="text-gold-400 hover:underline">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-gray-400">
            Page {page} of {lastPage}
          </span>
          {page < lastPage ? (
            <Link href={pageHref(page + 1)} className="text-gold-400 hover:underline">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
