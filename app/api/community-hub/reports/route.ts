import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { serverError } from '@/lib/api/errors'

const reportSchema = z.object({
  message_id: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 } as const;
  }

  return { supabase, user } as const;
}

// POST /api/community-hub/reports
export async function POST(request: NextRequest) {
  const ctx = await getUser();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }
  const { supabase, user } = ctx;

  const body = await request.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { message_id, reason } = parsed.data;

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      message_id,
      reporter_id: user.id,
      reason: reason || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return serverError(error, 'community-hub/reports', 500, 'Failed to file report');
  }

  return NextResponse.json({ report }, { status: 201 });
}

