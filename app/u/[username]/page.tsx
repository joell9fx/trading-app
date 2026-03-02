import { PublicProfile } from '../../../components/public/public-profile'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/users/profile/${params.username}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    redirect('/404')
  }
  const profile = await res.json()

  return <PublicProfile profile={profile} />
}

