# Course Management API Documentation

This document describes the Course Management API for the Trading Academy platform, providing comprehensive CRUD operations for courses and lessons.

## 🚀 Overview

The Course Management API consists of several endpoints that allow you to:
- Create, read, update, and delete courses
- Manage lessons within courses
- Filter and search courses
- Get course statistics
- Handle course publishing and access control

## 📚 API Endpoints

### 1. Courses Collection

#### `GET /api/courses`
Retrieve a list of courses with optional filtering and pagination.

**Query Parameters:**
- `difficulty` (optional): Filter by difficulty level (`beginner`, `intermediate`, `advanced`)
- `is_published` (optional): Filter by publication status (`true`/`false`)
- `search` (optional): Search in title and description
- `limit` (optional): Number of courses per page (default: 20)
- `offset` (optional): Number of courses to skip (default: 0)

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Introduction to Trading",
      "description": "Learn the basics of trading...",
      "slug": "introduction-to-trading",
      "thumbnail_url": "https://example.com/image.jpg",
      "duration_minutes": 120,
      "difficulty": "beginner",
      "is_published": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "lesson_count": 5,
      "total_duration": 120,
      "lessons": [...]
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 50,
    "hasMore": true
  }
}
```

#### `POST /api/courses`
Create a new course.

**Request Body:**
```json
{
  "title": "Course Title",
  "description": "Course description",
  "slug": "course-slug",
  "thumbnail_url": "https://example.com/image.jpg",
  "duration_minutes": 120,
  "difficulty": "beginner",
  "is_published": false
}
```

**Response:** Created course object (201 status)

### 2. Individual Course

#### `GET /api/courses/{id}`
Retrieve a specific course with all its lessons.

**Response:** Course object with lessons array

#### `PUT /api/courses/{id}`
Update an existing course.

**Request Body:** Partial course data (same fields as POST, all optional)

**Response:** Updated course object

#### `DELETE /api/courses/{id}`
Delete a course (only if no students have progress).

**Response:** Success message

### 3. Course Lessons

#### `GET /api/courses/{courseId}/lessons`
Retrieve all lessons for a specific course.

**Response:**
```json
{
  "lessons": [
    {
      "id": "uuid",
      "course_id": "course-uuid",
      "title": "Lesson Title",
      "description": "Lesson description",
      "content": "Lesson content",
      "video_url": "https://example.com/video.mp4",
      "duration_minutes": 30,
      "order_index": 1,
      "is_published": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/courses/{courseId}/lessons`
Create a new lesson within a course.

**Request Body:**
```json
{
  "title": "Lesson Title",
  "description": "Lesson description",
  "content": "Lesson content",
  "video_url": "https://example.com/video.mp4",
  "duration_minutes": 30,
  "order_index": 1,
  "is_published": false
}
```

### 4. Individual Lesson

#### `GET /api/courses/{courseId}/lessons/{lessonId}`
Retrieve a specific lesson.

#### `PUT /api/courses/{courseId}/lessons/{lessonId}`
Update a lesson.

#### `DELETE /api/courses/{courseId}/lessons/{lessonId}`
Delete a lesson (only if no students have progress).

### 5. Course Statistics

#### `GET /api/courses/stats`
Get comprehensive course statistics.

**Response:**
```json
{
  "total_courses": 50,
  "published_courses": 45,
  "draft_courses": 5,
  "total_lessons": 250,
  "total_duration": 6000,
  "difficulty_distribution": {
    "beginner": 20,
    "intermediate": 20,
    "advanced": 10
  },
  "recent_courses": [...],
  "average_duration_per_course": 120,
  "average_lessons_per_course": 5
}
```

## 🔐 Authentication & Authorization

- **Public endpoints:** `GET /api/courses` (published courses only), `GET /api/courses/stats`
- **Authenticated endpoints:** All other endpoints require user authentication
- **Admin access:** Currently allows any authenticated user to manage courses (implement role-based access control in production)

## 📝 Data Validation

All API endpoints use Zod schemas for validation:

### Course Validation Rules
- **Title:** Required, max 200 characters
- **Description:** Required, max 2000 characters
- **Slug:** Required, max 100 characters, only lowercase letters, numbers, and hyphens
- **Duration:** Required, minimum 1 minute
- **Difficulty:** Must be `beginner`, `intermediate`, or `advanced`

### Lesson Validation Rules
- **Title:** Required, max 200 characters
- **Description:** Optional, max 2000 characters
- **Duration:** Required, minimum 1 minute
- **Order Index:** Required, non-negative integer

## 🎯 React Hooks

The API includes custom React hooks for easy integration:

### `useCourses(filters?)`
Fetch courses with optional filtering and pagination.

### `useCourse(id)`
Fetch a single course by ID.

### `useCourseStats()`
Fetch course statistics.

### `useCreateCourse()`
Create a new course.

### `useUpdateCourse()`
Update an existing course.

### `useDeleteCourse()`
Delete a course.

### `useCourseLessons(courseId)`
Fetch lessons for a specific course.

### `useCreateLesson()`
Create a new lesson.

### `useUpdateLesson()`
Update a lesson.

### `useDeleteLesson()`
Delete a lesson.

## 🛠 Utility Functions

### `generateSlug(title: string)`
Generate a URL-friendly slug from a course title.

### `validateCourseData(data: CreateCourseRequest)`
Validate course data before submission.

### `validateLessonData(data: CreateLessonRequest)`
Validate lesson data before submission.

### `formatDuration(minutes: number)`
Format duration from minutes to human-readable format (e.g., "2h 30m").

### `getDifficultyColor(difficulty: string)`
Get Tailwind CSS classes for difficulty badge styling.

### `calculateProgress(completedLessons: number, totalLessons: number)`
Calculate course completion percentage.

## 📱 Example Usage

### Creating a Course
```tsx
import { useCreateCourse } from '@/hooks/use-courses';

function CreateCoursePage() {
  const createCourse = useCreateCourse();
  
  const handleSubmit = async (courseData) => {
    try {
      await createCourse.mutateAsync(courseData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  return <CourseForm onSubmit={handleSubmit} />;
}
```

### Fetching Courses with Filters
```tsx
import { useCourses } from '@/hooks/use-courses';

function CoursesPage() {
  const { data, isLoading, error } = useCourses({
    difficulty: 'beginner',
    is_published: true,
    limit: 10
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

## 🚨 Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request:** Validation errors or business logic violations
- **401 Unauthorized:** Missing or invalid authentication
- **404 Not Found:** Course or lesson not found
- **500 Internal Server Error:** Server-side errors

Error responses include detailed error messages:
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "message": "Duration must be at least 1 minute",
      "path": ["duration_minutes"]
    }
  ]
}
```

## 🔄 Data Relationships

- **Courses** have many **Lessons**
- **Lessons** belong to one **Course**
- **Progress** tracks user completion of lessons
- **Certificates** are awarded upon course completion
- **Audit logs** track all CRUD operations

## 📊 Performance Considerations

- Pagination is implemented for course listing
- Database indexes are created on frequently queried fields
- Lessons are fetched with courses to reduce API calls
- Course duration is automatically calculated from lesson durations

## 🧪 Testing

Test the API endpoints using tools like:
- **Postman** or **Insomnia** for manual testing
- **Jest** for automated testing
- **Supabase Dashboard** for database inspection

## 🚀 Next Steps

1. **Implement role-based access control** for admin-only operations
2. **Add file upload** for course thumbnails and lesson videos
3. **Implement course enrollment** and student management
4. **Add course categories** and tags for better organization
5. **Create course templates** for quick course creation
6. **Add bulk operations** for managing multiple courses/lessons

## 📞 Support

For questions or issues with the Course Management API, please refer to the main project documentation or create an issue in the repository.
