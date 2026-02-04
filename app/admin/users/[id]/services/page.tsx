import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserServicesManager } from '@/components/admin/users/UserServicesManager'

export default async function AdminUserServicesPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/signin?redirectTo=/admin/users/${params.id}/services`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('email, full_name, name')
    .eq('id', params.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-6 space-y-4 text-white">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
        <h1 className="text-3xl font-bold">Manage User Services</h1>
        <p className="text-gray-400 mt-1">
          Toggle unlocked services for this user.
        </p>
      </div>
      <UserServicesManager userId={params.id} userEmail={targetProfile?.email} />
    </div>
  )
}

