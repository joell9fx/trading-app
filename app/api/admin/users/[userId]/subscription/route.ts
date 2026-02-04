import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../auth';

export const dynamic = 'force-dynamic';

// POST /api/admin/users/[userId]/subscription - Assign subscription to user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { supabase } = auth.ctx!;

    const body = await request.json();
    const { planId, status = 'active' } = body;
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

