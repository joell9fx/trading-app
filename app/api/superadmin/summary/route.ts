import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '../auth'
// @ts-ignore openai types resolved at runtime
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest) {
  const auth = await requireOwner()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const [
    totalUsersRes,
    adminRes,
    ownerRes,
    bannedRes,
    announcementsRes,
    flagsRes,
    logsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .or('role.eq.ADMIN,is_admin.eq.true,is_owner.eq.true'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_owner', true),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('banned', true),
    supabase.from('announcements').select('id', { count: 'exact', head: true }),
    supabase.from('system_flags').select('key, value'),
    supabase
      .from('admin_logs')
      .select('action, module, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5),
  ])

  const metrics = {
    users: {
      total: totalUsersRes.count || 0,
      admins: adminRes.count || 0,
      owners: ownerRes.count || 0,
      banned: bannedRes.count || 0,
    },
    announcements: announcementsRes.count || 0,
    flags: flagsRes.data || [],
    recentLogs: logsRes.data || [],
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      summary: 'OPENAI_API_KEY not configured. Metrics returned without AI summary.',
      metrics,
    })
  }

  const openai = new OpenAI({ apiKey })
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      { role: 'system', content: 'You are the VisionEdge Chief Operations AI. Summarize key performance metrics, risks, and opportunities across all systems.' },
      { role: 'user', content: JSON.stringify(metrics) },
    ],
  })

  const summary = aiResponse.choices?.[0]?.message?.content || 'No summary generated.'

  return NextResponse.json({ summary, metrics })
}

