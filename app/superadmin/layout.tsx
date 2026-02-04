import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_owner, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_owner) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full bg-gold-500/15 border-b border-gold-500/40 px-4 py-3 text-center text-sm font-semibold tracking-wide">
        👑 SUPER ADMIN MODE — You are operating as the VisionEdge Owner. Actions here affect the entire ecosystem.
      </div>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-300">Owner Console</p>
            <h1 className="text-3xl font-bold">Super Admin Layer</h1>
            <p className="text-sm text-gray-400">Full oversight & safety controls</p>
          </div>
          <div className="px-3 py-2 rounded-lg border border-gold-500/40 bg-gold-500/10 text-gold-200 text-xs">
            Signed in as {profile?.email || user.email}
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

