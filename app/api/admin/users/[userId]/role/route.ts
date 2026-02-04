import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../auth';

export const dynamic = 'force-dynamic';

// PUT /api/admin/users/[userId]/role - Update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { supabase, user } = auth.ctx!;

    const body = await request.json();
    const { role } = body;
    const { userId } = params;

    const validRoles = ['member', 'admin', 'owner'];
    if (!role || !validRoles.includes(role.toString().toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Prevent users from changing their own role to non-admin
    const normalizedRole = role.toString().toLowerCase();
    if (userId === user.id && normalizedRole !== 'admin' && normalizedRole !== 'owner') {
      return NextResponse.json(
        { error: 'Cannot change your own role from admin/owner' },
        { status: 400 }
      );
    }

    // Update user role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: normalizedRole })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: updatedProfile,
      message: 'Role updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error in PUT /api/admin/users/[userId]/role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

