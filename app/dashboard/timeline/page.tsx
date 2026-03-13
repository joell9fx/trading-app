import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { VisionTimelineClient } from '@/components/dashboard/timeline/vision-timeline-client'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/dashboard/timeline')
  }

  const [{ data: profile }, { data: journals }, { data: lessons }] = await Promise.all([
    supabase.from('profiles').select('id, xp, membership_tier, badges, created_at').eq('id', user.id).single(),
    supabase.from('mentor_journal').select('*').eq('user_id', user.id).order('week_start', { ascending: true }),
    supabase.from('learning_paths').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
  ])

  const xp = profile?.xp || 0
  const tier = profile?.membership_tier || 'Standard'
  const badges = (profile?.badges as string[] | null) || []
  const created_at = profile?.created_at || user.created_at || new Date().toISOString()

  // Build timeline events
  const timeline = [
    {
      date: created_at,
      type: 'start',
      title: 'Joined VisionEdge',
      description: '',
      icon: '🚀',
    },
    ...(badges || []).map((b) => ({
      date: created_at,
      type: 'badge',
      title: `Badge Earned: ${b}`,
      description: '',
      icon: '🏅',
    })),
    ...(lessons || [])
      .filter((l) => l.status === 'completed')
      .map((l) => ({
        date: l.created_at,
        type: 'lesson',
        title: `Lesson Completed: ${l.title}`,
        description: '',
        icon: '🎯',
      })),
    ...(journals || []).map((j) => ({
      date: j.week_start || j.created_at,
      type: 'journal',
      title: 'Weekly Journal Entry',
      description: j.summary,
      icon: '📓',
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Optional AI commentary (best effort)
  let aiSummary = ''
  if (process.env.OPENAI_API_KEY && timeline.length > 0) {
    try {
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI trading coach summarizing a user timeline in 3 motivational sentences.' },
          { role: 'user', content: `Summarize this timeline for the user: ${JSON.stringify(timeline.slice(-10))}` },
        ],
      }
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        aiSummary = data.choices?.[0]?.message?.content || ''
      }
    } catch (e) {
      aiSummary = ''
    }
  }

  return (
    <div className="min-h-screen bg-page text-foreground p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Vision Timeline</h1>
      <p className="text-muted-foreground">Every trade, every lesson — your journey is your edge.</p>

      <Card className="bg-neutral-900 border border-gold-500/40 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gold-400 font-bold">Current Tier: {tier}</h3>
          <p className="text-sm text-muted-foreground">XP: {xp}</p>
        </div>
        <Progress value={Math.min((xp / 1000) * 100, 100)} className="bg-elevated h-3" />
      </Card>

      {aiSummary && (
        <Card className="bg-neutral-900 border border-gold-500/30 p-4">
          <h3 className="text-gold-400 font-semibold mb-2">🧠 AI Perspective</h3>
          <p className="text-foreground/90 whitespace-pre-line text-sm">{aiSummary}</p>
        </Card>
      )}

      <VisionTimelineClient timeline={timeline} />
    </div>
  )
}

