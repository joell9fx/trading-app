import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNotifications } from '@/components/admin/notifications/AdminNotifications'

export default async function AdminNotificationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/admin/notifications')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <AdminNotifications adminName={profile?.full_name || profile?.name || user.email || 'Admin'} />
}

