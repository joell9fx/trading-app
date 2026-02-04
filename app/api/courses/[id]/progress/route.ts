import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/courses/[id]/progress - Get course progress
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

    // Check if user is enrolled
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Get all lessons for the course
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    const totalLessons = lessons?.length || 0;

    if (totalLessons === 0) {
      return NextResponse.json({
        progress: 0,
        completedLessons: 0,
        totalLessons: 0,
        completionPercentage: 0,
      });
    }

    // Get completed lessons
    const lessonIds = lessons?.map(l => l.id) || [];
    const { data: completedProgress } = await supabase
      .from('progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds)
      .eq('completed', true);

    const completedLessons = completedProgress?.length || 0;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    return NextResponse.json({
      progress: completionPercentage,
      completedLessons,
      totalLessons,
      completionPercentage,
      enrollment,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[id]/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/progress - Update lesson progress
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
    const { lessonId, completed } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    // Verify user is enrolled
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Verify lesson belongs to course
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id, course_id')
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single();

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found or does not belong to this course' },
        { status: 404 }
      );
    }

    // Update or create progress
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .upsert([
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed: completed !== undefined ? completed : true,
          completed_at: completed ? new Date().toISOString() : null,
        },
      ], {
        onConflict: 'user_id,lesson_id',
      })
      .select()
      .single();

    if (progressError) {
      console.error('Error updating progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    // Calculate new completion percentage
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true);

    const totalLessons = lessons?.length || 0;
    const { data: completedProgress } = await supabase
      .from('progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .in('lesson_id', lessons?.map(l => l.id) || [])
      .eq('completed', true);

    const completedLessons = completedProgress?.length || 0;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    return NextResponse.json({
      progress,
      completionPercentage,
      completedLessons,
      totalLessons,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/courses/[id]/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


