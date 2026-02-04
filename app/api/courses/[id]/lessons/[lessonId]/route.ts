import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateLessonRequest } from '@/types/course';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for updating lessons
const updateLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  content: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  order_index: z.number().min(0, 'Order index must be non-negative').optional(),
  is_published: z.boolean().optional(),
});

// GET /api/courses/[id]/lessons/[lessonId] - Get a specific lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const supabase = createClient();
    const { id: courseId, lessonId } = params;

    // Check if course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('is_published')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // If course is not published, check if user is authenticated
    if (!course.is_published) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    // Get the lesson
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching lesson:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson);

  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[courseId]/lessons/[lessonId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]/lessons/[lessonId] - Update a lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const supabase = createClient();
    const { id: courseId, lessonId } = params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if lesson exists
    const { data: existingLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single();

    if (fetchError || !existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateLessonSchema.parse(body);

    // If order_index is being updated, check if it already exists for this course
    if (validatedData.order_index !== undefined && validatedData.order_index !== existingLesson.order_index) {
      const { data: orderExists } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId)
        .eq('order_index', validatedData.order_index)
        .neq('id', lessonId)
        .single();

      if (orderExists) {
        return NextResponse.json(
          { error: 'Lesson with this order index already exists in this course' },
          { status: 400 }
        );
      }
    }

    // Update the lesson
    const { data: updatedLesson, error: updateError } = await supabase
      .from('lessons')
      .update(validatedData)
      .eq('id', lessonId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating lesson:', updateError);
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      );
    }

    // If duration changed, update course duration
    if (validatedData.duration_minutes !== undefined) {
      const durationDiff = validatedData.duration_minutes - existingLesson.duration_minutes;
      
      if (durationDiff !== 0) {
        const { data: course } = await supabase
          .from('courses')
          .select('duration_minutes')
          .eq('id', courseId)
          .single();

        if (course) {
          const newDuration = Math.max(0, course.duration_minutes + durationDiff);
          await supabase
            .from('courses')
            .update({ duration_minutes: newDuration })
            .eq('id', courseId);
        }
      }
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'UPDATE',
        table_name: 'lessons',
        record_id: lessonId,
        old_values: existingLesson,
        new_values: updatedLesson
      }]);

    return NextResponse.json(updatedLesson);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in PUT /api/courses/[courseId]/lessons/[lessonId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/lessons/[lessonId] - Delete a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const supabase = createClient();
    const { courseId, lessonId } = params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if lesson exists
    const { data: existingLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single();

    if (fetchError || !existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if lesson has any progress
    const { data: progressCount } = await supabase
      .from('progress')
      .select('id', { count: 'exact' })
      .eq('lesson_id', lessonId);

    if (progressCount && progressCount.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete lesson with existing student progress. Consider archiving instead.' },
        { status: 400 }
      );
    }

    // Delete the lesson
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (deleteError) {
      console.error('Error deleting lesson:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete lesson' },
        { status: 500 }
      );
    }

    // Update course duration
    const { data: course } = await supabase
      .from('courses')
      .select('duration_minutes')
      .eq('id', courseId)
      .single();

    if (course) {
      const newDuration = Math.max(0, course.duration_minutes - existingLesson.duration_minutes);
      await supabase
        .from('courses')
        .update({ duration_minutes: newDuration })
        .eq('id', courseId);
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'DELETE',
        table_name: 'lessons',
        record_id: lessonId,
        old_values: existingLesson
      }]);

    return NextResponse.json(
      { message: 'Lesson deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error in DELETE /api/courses/[courseId]/lessons/[lessonId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
