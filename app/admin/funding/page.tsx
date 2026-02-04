import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FundingDashboard } from '@/components/admin/funding/FundingDashboard'

export default async function AdminFundingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/admin/funding')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <FundingDashboard
      admin={{
        id: user.id,
        name: profile?.full_name || profile?.name || user.email,
        email: profile?.email || user.email,
      }}
    />
  )
}

