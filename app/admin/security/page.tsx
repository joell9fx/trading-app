import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SecurityCenter } from '@/components/admin/security/security-center'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { assertAdmin } from '@/utils/auth'

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/admin/security')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_admin, is_owner, banned')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/dashboard')
  }

  try {
    assertAdmin(profile)
  } catch {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <SecurityCenter />
      </Suspense>
    </div>
  )
}

