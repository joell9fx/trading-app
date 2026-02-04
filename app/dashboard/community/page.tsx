import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function DashboardCommunityPage() {
  redirect('/community-hub')
}


