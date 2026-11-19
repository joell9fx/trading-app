import PublicProfile from '@/components/public/public-profile'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const res = await fetch(`${base}/api/users/profile/${encodeURIComponent(params.username)}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    notFound()
  }
  const profile = await res.json()

  return <PublicProfile profile={profile} />
}
