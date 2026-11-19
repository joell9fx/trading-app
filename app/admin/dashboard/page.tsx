import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AdminDashboardClient } from '@/components/admin/analytics/admin-dashboard-client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { isAdminRole } from '@/utils/auth'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/admin/dashboard')
  }

  const { data: profile } = await supabase.from('profiles').select('role, is_owner').eq('id', user.id).single()
  if (!profile || !isAdminRole(profile.role, (profile as any).is_owner)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <AdminDashboardClient />
      </Suspense>
    </div>
  )
}

