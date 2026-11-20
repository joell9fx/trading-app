import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNotifications } from '@/components/admin/notifications/AdminNotifications'
import { isAdminRole } from '@/utils/auth'

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
    .select('role, is_owner, name, full_name, email')
    .eq('id', user.id)
    .single()

  if (!isAdminRole(profile?.role, (profile as any)?.is_owner)) {
    redirect('/dashboard')
  }

  return <AdminNotifications adminName={profile?.full_name || profile?.name || user.email || 'Admin'} />
}

