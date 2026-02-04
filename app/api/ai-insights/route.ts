import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../admin/community/utils';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini'; // cost-effective fast model

type MessagesPerDay = { day: string; message_count: number };
type UsersPerDay = { day: string; active_users: number };

function pctChange(current: number, baseline: number) {
  if (baseline === 0) return current > 0 ? 100 : 0;
  return ((current - baseline) / baseline) * 100;
}

function computeAnomalies(messages: MessagesPerDay[], users: UsersPerDay[]) {
  const anomalies: string[] = [];
  if (messages.length >= 7) {
    const recent = messages.slice(-7);
    const last = recent[recent.length - 1].message_count;
    const base =
      recent.slice(0, recent.length - 1).reduce((sum, d) => sum + d.message_count, 0) /
      Math.max(1, recent.length - 1);
    const delta = pctChange(last, base);
    if (Math.abs(delta) > 30) {
      anomalies.push(`Messages changed ${delta.toFixed(1)}% vs prior days`);
    }
  }
  if (users.length >= 7) {
    const recent = users.slice(-7);
    const last = recent[recent.length - 1].active_users;
    const base =
      recent.slice(0, recent.length - 1).reduce((sum, d) => sum + d.active_users, 0) /
      Math.max(1, recent.length - 1);
    const delta = pctChange(last, base);
    if (Math.abs(delta) > 30) {
      anomalies.push(`Active users changed ${delta.toFixed(1)}% vs prior days`);
    }
  }
  return anomalies;
}

export async function GET(req: NextRequest) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase, adminId } = ctx;

  const now = new Date();
  const windowStart30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const windowStart7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    messagesPerDayRes,
    activeUsersPerDayRes,
    moderationActionsRes,
    topChannelsRes,
    reportsPendingRes,
    reportsResolvedRes,
    newUsersRes,
    activeAuthorsRes,
  ] = await Promise.all([
    supabase
      .from('daily_message_count')
      .select('day, message_count')
      .gte('day', windowStart30)
      .order('day', { ascending: true }),
    supabase
      .from('active_users_per_day')
      .select('day, active_users')
      .gte('day', windowStart30)
      .order('day', { ascending: true }),
    supabase
      .from('moderation_actions')
      .select('action_type, created_at')
      .gte('created_at', windowStart30),
    supabase.from('top_channels_by_message_count').select('channel_name, message_count').limit(5),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).neq('status', 'pending'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', windowStart30),
    supabase
      .from('messages')
      .select('author_id')
      .gte('created_at', windowStart30)
      .is('deleted_at', null),
  ]);

  const messagesPerDay = (messagesPerDayRes.data as MessagesPerDay[] | null) || [];
  const activeUsersPerDay = (activeUsersPerDayRes.data as UsersPerDay[] | null) || [];
  const moderationActionsRaw = (moderationActionsRes.data as { action_type: string; created_at: string }[] | null) || [];
  const moderationActions = moderationActionsRaw.reduce<Record<string, number>>((acc, row) => {
    acc[row.action_type] = (acc[row.action_type] || 0) + 1;
    return acc;
  }, {});
  const topChannels = (topChannelsRes.data as { channel_name: string; message_count: number }[] | null) || [];

  const activeAuthors = new Set((activeAuthorsRes.data as { author_id: string }[] | null)?.map((r) => r.author_id) || []);
  const newUsersCount = newUsersRes.count || 0;
  const returningUsers = Math.max(0, activeAuthors.size - newUsersCount);

  const messagesLast7 = messagesPerDay.slice(-7).map((m) => m.message_count);

  const anomalies = computeAnomalies(messagesPerDay, activeUsersPerDay);

  const payload = {
    generated_at: now.toISOString(),
    messages_last_7_days: messagesLast7,
    moderation_actions: moderationActions,
    top_channels: topChannels.map((c) => c.channel_name),
    reports_pending: reportsPendingRes.count || 0,
    reports_resolved: reportsResolvedRes.count || 0,
    active_users_per_day: activeUsersPerDay.map((d) => d.active_users),
    messages_per_day: messagesPerDay.map((d) => d.message_count),
    new_users_30d: newUsersCount,
    returning_users_30d: returningUsers,
    anomalies,
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      summary: 'AI insights unavailable (missing OPENAI_API_KEY).',
      insights: [
        'Configure OPENAI_API_KEY to enable automated insights.',
        'Messages last 7 days: ' + messagesLast7.join(', '),
        `Top channels: ${payload.top_channels.join(', ') || 'none'}`,
      ],
      recommendation: 'Set OPENAI_API_KEY and refresh insights.',
      anomalies,
      payload,
    });
  }

  const prompt = `
You are an analytics AI for a community moderation dashboard. Using the provided JSON metrics, produce a concise response:
- summary: two short sentences highlighting trend and health
- insights: 3 bullet-style insights (concise phrases)
- recommendation: one actionable recommendation
- anomalies: list anomaly strings; if none, empty array

Focus on moderation, chat volume, and user engagement. Flag any >30% swings as anomalies. Keep output JSON only.

Metrics:
${JSON.stringify(payload, null, 2)}
`;

  const aiResponse = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a precise analytics summarizer. Output JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
    }),
  });

  if (!aiResponse.ok) {
    const err = await aiResponse.json().catch(() => ({}));
    console.error('AI insights error', err);
    return NextResponse.json(
      {
        summary: 'AI insights unavailable.',
        insights: ['AI service error', 'Check OpenAI credentials', 'Retry later'],
        recommendation: 'Investigate AI service health.',
        anomalies,
        payload,
      },
      { status: 500 }
    );
  }

  const data = await aiResponse.json();
  const content = data?.choices?.[0]?.message?.content;
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    parsed = {
      summary: 'AI returned unstructured data.',
      insights: [content || 'No content'],
      recommendation: 'Retry insights.',
      anomalies,
    };
  }

  return NextResponse.json({
    ...parsed,
    anomalies: parsed?.anomalies ?? anomalies,
    payload,
    generated_at: payload.generated_at,
  });
}

