'use client'

interface PublicProfileProps {
  profile: {
    user: any
    badges: { badges?: string[] }
    journal: any[]
    showcase: any[]
  }
}

export function PublicProfile({ profile }: PublicProfileProps) {
  const { user, badges, journal, showcase } = profile

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        {user.avatar_url && (
          <img src={user.avatar_url} className="w-20 h-20 rounded-full border-2 border-gold-500 object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gold-400">@{user.username}</h1>
          <p className="text-gray-400 text-sm">{user.bio || 'No bio yet'}</p>
          <p className="text-sm text-gray-500 mt-1">
            Tier: {user.membership_tier || 'Standard'} | XP: {user.xp || 0}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gold-400 mb-2">🏅 Badges</h2>
        <div className="flex gap-3 flex-wrap">
          {(badges?.badges || []).length === 0 && <p className="text-gray-500 text-sm">No badges yet.</p>}
          {(badges?.badges || []).map((b, i) => (
            <span key={i} className="bg-neutral-900 border border-gold-500 px-3 py-1 rounded-lg text-sm">
              {b}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gold-400 mb-2">📓 Latest Journal Entries</h2>
        {(journal || []).length === 0 && <p className="text-gray-500 text-sm">No journal entries.</p>}
        {(journal || []).map((j) => (
          <div key={j.id} className="bg-neutral-900 border border-gray-700 p-3 mb-3 rounded-lg text-sm text-gray-300">
            <p>{(j.summary || '').slice(0, 200)}...</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(j.week_start || j.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gold-400 mb-2">📢 Showcase Highlights</h2>
        {(showcase || []).length === 0 && <p className="text-gray-500 text-sm">No highlights shared.</p>}
        {(showcase || []).map((s) => (
          <div key={s.id} className="bg-neutral-900 border border-gray-700 p-3 mb-3 rounded-lg">
            <h4 className="text-white font-semibold">{s.title}</h4>
            <p className="text-gray-400 text-sm">{s.caption}</p>
            {s.image_url && <img src={s.image_url} className="mt-2 rounded-xl border border-gold-500/40" />}
          </div>
        ))}
      </section>
    </div>
  )
}

export default PublicProfile;

