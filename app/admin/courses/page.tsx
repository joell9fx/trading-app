'use client';

import { useState } from 'react';
import { useCourses, useCourseStats, useDeleteCourse } from '@/hooks/use-courses';
import { CourseWithLessons } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrafts, setShowDrafts] = useState(false);
  
  const { data: coursesData, isLoading, error } = useCourses({
    search: searchTerm || undefined,
    is_published: showDrafts ? undefined : true,
    limit: 50
  });
  
  const { data: stats } = useCourseStats();
  const deleteCourse = useDeleteCourse();

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await deleteCourse.mutateAsync(courseId);
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  const filteredCourses = coursesData?.courses || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Courses</h1>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage your trading academy courses and lessons</p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_courses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published_courses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_lessons}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.total_duration / 60)}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showDrafts"
            checked={showDrafts}
            onChange={(e) => setShowDrafts(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="showDrafts" className="text-sm text-gray-600">
            Show Drafts
          </label>
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {course.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {course.is_published ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Course Meta */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.difficulty}
                </span>
                <span>{course.lesson_count} lessons</span>
                <span>{Math.round(course.total_duration / 60)}h</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Link href={`/admin/courses/${course.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCourse(course.id)}
                  disabled={deleteCourse.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first course.'}
          </p>
          {!searchTerm && (
            <Link href="/admin/courses/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
