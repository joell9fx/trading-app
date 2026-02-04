import { NextResponse } from 'next/server'
import { requireAdmin } from '../../auth'
// @ts-ignore openai types resolved at runtime
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function POST() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth.ctx!

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey })

  const systemConfig = {
    env: process.env.NODE_ENV,
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'missing',
    openaiKey: !!process.env.OPENAI_API_KEY,
    endpoints: ['/api/*'],
    tables: ['profiles', 'referrals', 'ad_campaigns', 'affiliate_payouts', 'security_audits'],
  }

  const ai = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: `
You are a cybersecurity & GDPR auditor for VisionEdge FX.
Analyze configs and patterns for vulnerabilities, auth leaks, and compliance gaps.
Output JSON array: [{category, issue, severity, recommendation}]`,
      },
      { role: 'user', content: JSON.stringify(systemConfig) },
    ],
    max_tokens: 360,
  })

  const raw = ai.choices[0]?.message?.content || '[]'
  let issues: any[] = []
  try {
    const parsed = JSON.parse(raw)
    issues = Array.isArray(parsed) ? parsed : []
  } catch {
    issues = []
  }

  for (const i of issues) {
    await supabase.from('security_audits').insert({
      category: i.category || 'misc',
      issue: i.issue || '',
      severity: i.severity || 'medium',
      recommendation: i.recommendation || '',
    })
  }

  return NextResponse.json({ found: issues.length, issues })
}

