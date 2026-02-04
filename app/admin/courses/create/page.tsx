'use client';

import { CourseForm } from '@/components/courses/course-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateCoursePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/courses');
  };

  const handleCancel = () => {
    router.push('/admin/courses');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/courses">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-gray-600 mt-2">
          Add a new course to your trading academy. Fill out the form below to get started.
        </p>
      </div>

      {/* Course Form */}
      <div className="max-w-4xl">
        <CourseForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
