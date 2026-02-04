import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Course, 
  CourseWithLessons, 
  CreateCourseRequest, 
  UpdateCourseRequest,
  CreateLessonRequest,
  UpdateLessonRequest,
  CourseFilters
} from '@/types/course';

// API endpoints
const API_BASE = '/api/courses';

// Fetch all courses with optional filters
export const useCourses = (filters?: CourseFilters) => {
  const queryString = new URLSearchParams();
  
  if (filters?.difficulty) queryString.append('difficulty', filters.difficulty);
  if (filters?.is_published !== undefined) queryString.append('is_published', filters.is_published.toString());
  if (filters?.search) queryString.append('search', filters.search);
  if (filters?.limit) queryString.append('limit', filters.limit.toString());
  if (filters?.offset) queryString.append('offset', filters.offset.toString());

  const url = `${API_BASE}?${queryString.toString()}`;

  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async (): Promise<{ courses: CourseWithLessons[]; pagination: any }> => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    },
  });
};

// Fetch a single course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async (): Promise<CourseWithLessons> => {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      return response.json();
    },
    enabled: !!id,
  });
};

// Fetch course statistics
export const useCourseStats = () => {
  return useQuery({
    queryKey: ['courseStats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch course statistics');
      }
      return response.json();
    },
  });
};

// Fetch lessons for a course
export const useCourseLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${courseId}/lessons`);
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      return response.json();
    },
    enabled: !!courseId,
  });
};

// Fetch a single lesson
export const useLesson = (courseId: string, lessonId: string) => {
  return useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${courseId}/lessons/${lessonId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      return response.json();
    },
    enabled: !!(courseId && lessonId),
  });
};

// Create a new course
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseRequest): Promise<Course> => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courseStats'] });
    },
  });
};

// Update a course
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCourseRequest }): Promise<Course> => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update course');
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific course and courses list
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courseStats'] });
    },
  });
};

// Delete a course
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }
    },
    onSuccess: () => {
      // Invalidate and refetch courses list and stats
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courseStats'] });
    },
  });
};

// Create a new lesson
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: CreateLessonRequest }): Promise<any> => {
      const response = await fetch(`${API_BASE}/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lesson');
      }

      return response.json();
    },
    onSuccess: (_, { courseId }) => {
      // Invalidate and refetch course, lessons, and course stats
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courseLessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courseStats'] });
    },
  });
};

// Update a lesson
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      courseId, 
      lessonId, 
      data 
    }: { 
      courseId: string; 
      lessonId: string; 
      data: UpdateLessonRequest 
    }): Promise<any> => {
      const response = await fetch(`${API_BASE}/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lesson');
      }

      return response.json();
    },
    onSuccess: (_, { courseId, lessonId }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courseLessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lesson', courseId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['courseStats'] });
    },
  });
};

// Delete a lesson
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, lessonId }: { courseId: string; lessonId: string }): Promise<void> => {
      const response = await fetch(`${API_BASE}/${courseId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete lesson');
      }
    },
    onSuccess: (_, { courseId }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courseLessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courseStats'] });
    },
  });
};

// Utility function to refetch all course-related data
export const refetchAllCourses = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ['courses'] });
  queryClient.invalidateQueries({ queryKey: ['courseStats'] });
};
