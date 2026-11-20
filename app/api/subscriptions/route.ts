import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { requireAdmin } from '@/app/api/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const CreateSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().min(1),
  status: z.enum(['active', 'trialing', 'cancelled', 'past_due']).default('active'),
});

export const dynamic = 'force-dynamic';

// GET /api/subscriptions - Get user's subscription
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
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
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription: subscription || null,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Admin: create or replace a user's subscription.
// Paid subscriptions for members are created by the Stripe webhook only.
export async function POST(request: NextRequest) {
  try {
    const { error: adminError } = await requireAdmin();
    if (adminError) return adminError;

    const parsed = CreateSubscriptionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'userId (uuid) and planId are required' },
        { status: 400 }
      );
    }
    const { userId, planId, status } = parsed.data;
    const supabase = createAdminClient();
    const user = { id: userId };

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
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription

    // Create new subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
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
      message: 'Subscription created successfully',
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

