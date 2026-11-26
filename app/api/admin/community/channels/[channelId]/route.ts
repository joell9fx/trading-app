import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../utils';
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'
import { serverError } from '@/lib/api/errors'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const body = await parseBody(
    request,
    z.object({
      name: z.string().trim().min(2).max(80).optional(),
      description: z.string().trim().max(500).nullable().optional(),
      category: z.string().trim().min(1).max(40).optional(),
      is_private: z.boolean().optional(),
      archived: z.boolean().optional(),
    }),
  );
  if (body.error) return body.error;
  const { name, description, category, is_private, archived } = body.data;

  const updates: Record<string, any> = {};
  if (typeof name === 'string') updates.name = name;
  if (description !== undefined) updates.description = description;
  if (category) updates.category = category;
  if (typeof is_private === 'boolean') updates.is_private = is_private;
  if (typeof archived === 'boolean') updates.archived_at = archived ? new Date().toISOString() : null;

  const { data: channel, error: updateError } = await supabase
    .from('community_channels')
    .update(updates)
    .eq('id', params.channelId)
    .select()
    .single();

  if (updateError) {
    return serverError(updateError, 'admin/community/channels/[channelId]', 500, 'Failed to update channel');
  }

  return NextResponse.json({ channel });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const { error: archiveError } = await supabase
    .from('community_channels')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', params.channelId);

  if (archiveError) {
    return serverError(archiveError, 'admin/community/channels/[channelId]', 500, 'Failed to archive channel');
  }

  return NextResponse.json({ status: 'archived' });
}

