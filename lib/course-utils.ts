import { CreateCourseRequest, CreateLessonRequest } from '@/types/course';

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate course data before creation
 */
export function validateCourseData(data: CreateCourseRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (data.description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!data.duration_minutes || data.duration_minutes < 1) {
    errors.push('Duration must be at least 1 minute');
  }

  if (!['beginner', 'intermediate', 'advanced'].includes(data.difficulty)) {
    errors.push('Difficulty must be beginner, intermediate, or advanced');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate lesson data before creation
 */
export function validateLessonData(data: CreateLessonRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (data.description && data.description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  if (!data.duration_minutes || data.duration_minutes < 1) {
    errors.push('Duration must be at least 1 minute');
  }

  if (data.order_index < 0) {
    errors.push('Order index must be non-negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format duration from minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Calculate course progress percentage
 */
export function calculateProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

/**
 * Sort lessons by order index
 */
export function sortLessonsByOrder(lessons: any[]): any[] {
  return [...lessons].sort((a, b) => a.order_index - b.order_index);
}

/**
 * Check if a course is accessible to a user
 */
export function isCourseAccessible(course: any, user: any, userSubscription: any): boolean {
  // If course is published, it's accessible
  if (course.is_published) {
    return true;
  }

  // If user is not authenticated, course is not accessible
  if (!user) {
    return false;
  }

  // If user has an active subscription, they can access unpublished courses
  if (userSubscription && userSubscription.status === 'active') {
    return true;
  }

  // Add more access control logic here as needed
  return false;
}

/**
 * Generate a unique slug by appending a number if it already exists
 */
export async function generateUniqueSlug(
  baseSlug: string, 
  existingSlugs: string[]
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Sanitize HTML content for safe display
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
