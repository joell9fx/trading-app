import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/courses/stats - Get course statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get total courses count
    const { count: totalCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    if (coursesError) {
      console.error('Error counting courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to get course statistics' },
        { status: 500 }
      );
    }

    // Get published courses count
    const { count: publishedCourses, error: publishedError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (publishedError) {
      console.error('Error counting published courses:', publishedError);
      return NextResponse.json(
        { error: 'Failed to get course statistics' },
        { status: 500 }
      );
    }

    // Get total lessons count
    const { count: totalLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    if (lessonsError) {
      console.error('Error counting lessons:', lessonsError);
      return NextResponse.json(
        { error: 'Failed to get course statistics' },
        { status: 500 }
      );
    }

    // Get total duration
    const { data: durationData, error: durationError } = await supabase
      .from('courses')
      .select('duration_minutes');

    if (durationError) {
      console.error('Error getting duration data:', durationError);
      return NextResponse.json(
        { error: 'Failed to get course statistics' },
        { status: 500 }
      );
    }

    const totalDuration = durationData?.reduce((sum, course) => sum + (course.duration_minutes || 0), 0) || 0;

    // Get courses by difficulty
    const { data: difficultyData, error: difficultyError } = await supabase
      .from('courses')
      .select('difficulty');

    if (difficultyError) {
      console.error('Error getting difficulty data:', difficultyError);
      return NextResponse.json(
        { error: 'Failed to get course statistics' },
        { status: 500 }
      );
    }

    const difficultyStats = difficultyData?.reduce((acc, course) => {
      acc[course.difficulty] = (acc[course.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get recent courses (last 5)
    const { data: recentCourses, error: recentError } = await supabase
      .from('courses')
      .select('id, title, created_at, is_published')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error getting recent courses:', recentError);
      return NextResponse.json(
        { error: 'Failed to get course statistics' },
        { status: 500 }
      );
    }

    const stats = {
      total_courses: totalCourses || 0,
      published_courses: publishedCourses || 0,
      draft_courses: (totalCourses || 0) - (publishedCourses || 0),
      total_lessons: totalLessons || 0,
      total_duration: totalDuration,
      difficulty_distribution: difficultyStats,
      recent_courses: recentCourses || [],
      average_duration_per_course: totalCourses ? Math.round(totalDuration / totalCourses) : 0,
      average_lessons_per_course: totalCourses ? Math.round((totalLessons || 0) / totalCourses) : 0
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Unexpected error in GET /api/courses/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
