'use client';

import { useState } from 'react';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';
import { CreateCourseRequest, UpdateCourseRequest, Course } from '@/types/course';
import { generateSlug, validateCourseData } from '@/lib/course-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

interface CourseFormProps {
  course?: Course;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const [formData, setFormData] = useState<CreateCourseRequest>({
    title: course?.title || '',
    description: course?.description || '',
    slug: course?.slug || '',
    thumbnail_url: course?.thumbnail_url || '',
    duration_minutes: course?.duration_minutes || 0,
    difficulty: course?.difficulty || 'beginner',
    is_published: course?.is_published || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const isEditing = !!course;
  const isLoading = createCourse.isPending || updateCourse.isPending;

  const handleInputChange = (field: keyof CreateCourseRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && !isEditing) {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const validation = validateCourseData(formData);
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        // Map validation errors to form fields
        if (error.includes('Title')) newErrors.title = error;
        else if (error.includes('Description')) newErrors.description = error;
        else if (error.includes('Slug')) newErrors.slug = error;
        else if (error.includes('Duration')) newErrors.duration_minutes = error;
        else if (error.includes('Difficulty')) newErrors.difficulty = error;
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && course) {
        await updateCourse.mutateAsync({
          id: course.id,
          data: formData as UpdateCourseRequest
        });
        toast({
          title: 'Success',
          description: 'Course updated successfully!',
        });
      } else {
        await createCourse.mutateAsync(formData);
        toast({
          title: 'Success',
          description: 'Course created successfully!',
        });
      }
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter course title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter course description"
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="course-slug"
            className={errors.slug ? 'border-red-500' : ''}
          />
          {errors.slug && (
            <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            URL-friendly identifier for the course
          </p>
        </div>

        {/* Duration */}
        <div>
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.duration_minutes}
            onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 0)}
            className={errors.duration_minutes ? 'border-red-500' : ''}
          />
          {errors.duration_minutes && (
            <p className="text-sm text-red-500 mt-1">{errors.duration_minutes}</p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <Label htmlFor="difficulty">Difficulty *</Label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Thumbnail URL */}
        <div>
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            type="url"
            value={formData.thumbnail_url}
            onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Published Status */}
        <div className="flex items-center space-x-2">
          <input
            id="published"
            type="checkbox"
            checked={formData.is_published}
            onChange={(e) => handleInputChange('is_published', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="published">Publish course</Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Course' : 'Create Course'
          )}
        </Button>
      </div>
    </form>
  );
}
