import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateLessonRequest } from '@/types/course';
import { z } from 'zod';

// Validation schema for creating lessons
const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  content: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  order_index: z.number().min(0, 'Order index must be non-negative'),
  is_published: z.boolean().optional().default(false),
});

// GET /api/courses/[id]/lessons - Get all lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

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

    // Get lessons for the course
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lessons: lessons || [] });

  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[courseId]/lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/lessons - Create a new lesson
export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createLessonSchema.parse(body);

    // Check if order_index already exists for this course
    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('order_index', validatedData.order_index)
      .single();

    if (existingLesson) {
      return NextResponse.json(
        { error: 'Lesson with this order index already exists in this course' },
        { status: 400 }
      );
    }

    // Create the lesson
    const lessonData = {
      ...validatedData,
      course_id: courseId
    };

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      return NextResponse.json(
        { error: 'Failed to create lesson' },
        { status: 500 }
      );
    }

    // Update course duration
    const newDuration = course.duration_minutes + validatedData.duration_minutes;
    await supabase
      .from('courses')
      .update({ duration_minutes: newDuration })
      .eq('id', courseId);

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'CREATE',
        table_name: 'lessons',
        record_id: lesson.id,
        new_values: lesson
      }]);

    return NextResponse.json(lesson, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/courses/[courseId]/lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
