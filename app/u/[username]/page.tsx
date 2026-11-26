import PublicProfile from '@/components/public/public-profile'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPublicProfile } from '@/lib/public-profile'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  // Query directly instead of fetching our own API: a relative fetch URL fails
  // on the server, and an absolute one depends on NEXT_PUBLIC_SITE_URL.
  const profile = await getPublicProfile(createClient(), safeDecode(params.username))
  if (!profile) {
    notFound()
  }

  return <PublicProfile profile={profile} />
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
