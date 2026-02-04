import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MentorChat } from '@/components/dashboard/mentor-chat'

export const dynamic = 'force-dynamic'

export default async function MentorPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/dashboard/mentor')
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <MentorChat userId={user.id} />
      </div>
    </div>
  )
}

