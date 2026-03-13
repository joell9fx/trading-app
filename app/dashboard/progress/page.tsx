import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getUserProfile() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'username, xp, has_signals_access, has_courses_access, has_funding_access, has_mentorship_access, has_ai_tools_access'
    )
    .eq('id', user.id)
    .single()

  return { profile }
}

export default async function ProfileProgressPage() {
  const { profile } = await getUserProfile()

  const features = [
    { name: 'Community Hub', unlocked: true },
    { name: 'Trading Courses', unlocked: !!profile?.has_courses_access },
    { name: 'Funded Account Support', unlocked: !!profile?.has_funding_access },
    { name: 'Mentorship', unlocked: !!profile?.has_mentorship_access },
    { name: 'Trading Signals', unlocked: !!profile?.has_signals_access },
    { name: 'AI Tools', unlocked: !!profile?.has_ai_tools_access },
  ]

  const unlockedCount = features.filter((f) => f.unlocked).length
  const totalCount = features.length
  const progress = Math.round((unlockedCount / totalCount) * 100)
  const xp = profile?.xp ?? 0
  const username = profile?.username || 'Trader'

  return (
    <div className="bg-black text-white p-8 border border-gold rounded-2xl max-w-5xl mx-auto space-y-8 shadow-[0_0_25px_rgba(255,215,0,0.08)]">
      <div>
        <h1 className="text-3xl text-gold font-bold mb-2">🎯 Your Progress, {username}</h1>
        <p className="text-muted-foreground">Track your journey and unlock new features as you grow.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {unlockedCount} of {totalCount} features unlocked
          </span>
          <span className="text-gold font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-gold/30">
          <div
            className="bg-gold h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((f) => (
          <div
            key={f.name}
            className={`p-4 border rounded-xl flex items-center justify-between transition-transform hover:scale-[1.01] ${
              f.unlocked ? 'border-primary/60 bg-accent-muted' : 'border-border bg-panel'
            }`}
          >
            <p className="text-lg font-semibold">{f.name}</p>
            {f.unlocked ? (
              <span className="text-green-400 text-sm font-semibold">✅ Unlocked</span>
            ) : (
              <Link href="/dashboard/upgrade" className="text-gold text-sm font-semibold hover:underline">
                🔒 Unlock
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-gold rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl text-gold font-semibold">Your XP & Achievements</h2>
            <p className="text-muted-foreground text-sm">Total XP: {xp}</p>
          </div>
          <Link href="/dashboard/upgrade" className="text-sm text-gold hover:underline">
            Unlock more to earn XP →
          </Link>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-gold text-black px-3 py-1 rounded text-sm font-semibold">💎 Active Member</span>
          <span className="bg-gold text-black px-3 py-1 rounded text-sm font-semibold">🎓 Student Trader</span>
          {profile?.has_signals_access && (
            <span className="bg-gold text-black px-3 py-1 rounded text-sm font-semibold">📈 Signals Member</span>
          )}
        </div>
      </div>

      <div className="text-center text-muted-foreground italic">
        “Growth is built one trade, one lesson, and one unlock at a time.”
      </div>
    </div>
  )
}

