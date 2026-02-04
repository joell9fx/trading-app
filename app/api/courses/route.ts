import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateCourseRequest, CourseFilters } from '@/types/course';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for creating courses
const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  is_published: z.boolean().optional().default(false),
});

// GET /api/courses - List courses with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const isPublished = searchParams.get('is_published');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('courses')
      .select(`
        *,
        lessons:lessons(id, title, duration_minutes, order_index, is_published)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    if (isPublished !== null) {
      query = query.eq('is_published', isPublished === 'true');
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: courses, error, count } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    // Transform data to include lesson count and total duration
    const transformedCourses = courses?.map(course => {
      const lessons = course.lessons || [];
      const lessonCount = lessons.length;
      const totalDuration = lessons.reduce((sum: number, lesson: any) => sum + (lesson.duration_minutes || 0), 0);
      
      return {
        ...course,
        lesson_count: lessonCount,
        total_duration: totalDuration,
        lessons: lessons.sort((a: any, b: any) => a.order_index - b.order_index)
      };
    }) || [];

    return NextResponse.json({
      courses: transformedCourses,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (you can implement your own admin check logic)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // For now, we'll allow any authenticated user to create courses
    // In production, you should implement proper role-based access control

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Check if slug already exists
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 400 }
      );
    }

    // Create the course
    const { data: course, error } = await supabase
      .from('courses')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      );
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'CREATE',
        table_name: 'courses',
        record_id: course.id,
        new_values: course
      }]);

    return NextResponse.json(course, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
