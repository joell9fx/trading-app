import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../auth';
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'

export const dynamic = 'force-dynamic';

// POST /api/admin/users/[userId]/subscription - Assign subscription to user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const supabase = createAdminClient(); // service role: cross-user write, caller already verified

    const body = await parseBody(
      request,
      z.object({
        planId: z.string().trim().min(1).max(128),
        status: z.enum(['active', 'trialing', 'past_due', 'canceled', 'incomplete']).default('active'),
      }),
    );
    if (body.error) return body.error;
    const { planId, status } = body.data;
    const { userId } = params;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Cancel existing active subscriptions
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', cancel_at_period_end: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create new subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          status: status,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        },
      ])
      .select(`
        *,
        plans:plan_id (
          id,
          name,
          description,
          price_monthly,
          price_yearly,
          features
        )
      `)
      .single();

    if (subError) {
      console.error('Error creating subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription,
      message: 'Subscription assigned successfully',
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/users/[userId]/subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

