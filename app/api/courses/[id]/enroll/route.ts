import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST /api/courses/[id]/enroll - Enroll in a course (purchase)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: courseId } = params;
    const body = await request.json();
    const { paymentMethod = 'free' } = body;

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course is free
    if (course.is_free || course.price === 0) {
      // Free enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from('course_enrollments')
        .insert([
          {
            user_id: user.id,
            course_id: courseId,
            purchase_price: 0,
            payment_method: 'free',
            status: 'active',
          },
        ])
        .select()
        .single();

      if (enrollError) {
        // Check if already enrolled
        if (enrollError.code === '23505') { // Unique violation
          return NextResponse.json(
            { error: 'Already enrolled in this course', enrollment: null },
            { status: 400 }
          );
        }
        throw enrollError;
      }

      return NextResponse.json({
        enrollment,
        message: 'Successfully enrolled in course',
      });
    }

    // Paid course - check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course', enrollment: existingEnrollment },
        { status: 400 }
      );
    }

    // For now, allow direct enrollment (you can integrate Stripe later)
    // In production, you'd verify payment before creating enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('course_enrollments')
      .insert([
        {
          user_id: user.id,
          course_id: courseId,
          purchase_price: course.price || 0,
          payment_method: paymentMethod,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError);
      return NextResponse.json(
        { error: 'Failed to enroll in course' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enrollment,
      message: 'Successfully enrolled in course',
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/courses/[id]/enroll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/courses/[id]/enroll - Check enrollment status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: courseId } = params;

    // Check enrollment
    const { data: enrollment, error } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check enrollment' },
        { status: 500 }
      );
    }

    // Calculate progress if enrolled
    let progress = null;
    if (enrollment) {
      const { data: progressData } = await supabase.rpc('calculate_course_progress', {
        p_user_id: user.id,
        p_course_id: courseId,
      });
      progress = progressData;
    }

    return NextResponse.json({
      enrolled: !!enrollment,
      enrollment: enrollment || null,
      progress: progress || 0,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[id]/enroll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


