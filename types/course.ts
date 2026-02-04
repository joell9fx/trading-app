export interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
  lesson_count: number;
  total_duration: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  slug: string;
  thumbnail_url?: string;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_published?: boolean;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  slug?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_published?: boolean;
}

export interface CreateLessonRequest {
  course_id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  is_published?: boolean;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  content?: string;
  video_url?: string;
  duration_minutes?: number;
  order_index?: number;
  is_published?: boolean;
}

export interface CourseFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_published?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CourseStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  total_lessons: number;
  total_duration: number;
}
