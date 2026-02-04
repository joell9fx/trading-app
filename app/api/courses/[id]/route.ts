import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateCourseRequest } from '@/types/course';
import { z } from 'zod';

// Validation schema for updating courses
const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long').optional(),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  is_published: z.boolean().optional(),
});

// GET /api/courses/[id] - Get a specific course with lessons
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

    // Get course with lessons
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons:lessons(
          id,
          title,
          description,
          content,
          video_url,
          duration_minutes,
          order_index,
          is_published,
          created_at,
          updated_at
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching course:', error);
      return NextResponse.json(
        { error: 'Failed to fetch course' },
        { status: 500 }
      );
    }

    // Check if course is published or if user is authenticated
    if (!course.is_published) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      // You can add additional checks here for course access permissions
    }

    // Transform data to include lesson count and total duration
    const lessons = course.lessons || [];
    const lessonCount = lessons.length;
    const totalDuration = lessons.reduce((sum: number, lesson: any) => sum + (lesson.duration_minutes || 0), 0);
    
    const transformedCourse = {
      ...course,
      lesson_count: lessonCount,
      total_duration: totalDuration,
      lessons: lessons.sort((a: any, b: any) => a.order_index - b.order_index)
    };

    return NextResponse.json(transformedCourse);

  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if course exists
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // If slug is being updated, check if it already exists
    if (validatedData.slug && validatedData.slug !== existingCourse.slug) {
      const { data: slugExists } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', courseId)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { error: 'Course with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update the course
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(validatedData)
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating course:', updateError);
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      );
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'UPDATE',
        table_name: 'courses',
        record_id: courseId,
        old_values: existingCourse,
        new_values: updatedCourse
      }]);

    return NextResponse.json(updatedCourse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in PUT /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if course exists
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course has any enrollments or progress
    const { data: lessonIds } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);
    
    const { data: progressCount } = await supabase
      .from('progress')
      .select('id', { count: 'exact' })
      .in('lesson_id', lessonIds?.map(l => l.id) || []);

    if (progressCount && progressCount.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing student progress. Consider archiving instead.' },
        { status: 400 }
      );
    }

    // Delete the course (this will cascade delete lessons due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (deleteError) {
      console.error('Error deleting course:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      );
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'DELETE',
        table_name: 'courses',
        record_id: courseId,
        old_values: existingCourse
      }]);

    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error in DELETE /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
