'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Search,
  GraduationCap,
  TrendingUp,
  Filter,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  ShoppingCart,
  CheckCircle
} from 'lucide-react'
import { useCourses, useCourseStats } from '@/hooks/use-courses'
import { CourseWithLessons } from '@/types/course'
import {
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MEMBER'
  bio?: string
  timezone?: string
  avatar_url?: string
  created_at: string
}

interface CoursesSectionProps {
  user: UserProfile
}

interface CourseEnrollment {
  course_id: string
  enrolled: boolean
  progress: number
  completion_percentage: number
}

export function CoursesSection({ user }: CoursesSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment>>({})
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)
  
  const supabase = createSupabaseClient()
  
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    is_published: true,
    ...(difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
    ...(searchQuery && { search: searchQuery }),
  })
  
  const { data: statsData, isLoading: statsLoading } = useCourseStats()

  const courses = useMemo(() => coursesData?.courses || [], [coursesData])
  const stats = statsData || {
    total_courses: 0,
    published_courses: 0,
    total_lessons: 0,
    total_duration: 0,
  }

  // Load enrollments for all courses
  const loadEnrollments = useCallback(async () => {
    try {
      const courseIds = courses.map((c: CourseWithLessons) => c.id)
      
      // Fetch all enrollments for user
      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select('course_id, status')
        .eq('user_id', user.id)
        .in('course_id', courseIds)
        .eq('status', 'active')

      // Fetch progress for each enrolled course
      const enrollmentsMap: Record<string, CourseEnrollment> = {}
      
      for (const course of courses) {
        const enrollment = enrollmentData?.find(e => e.course_id === course.id)
        const isEnrolled = !!enrollment

        if (isEnrolled) {
          // Calculate progress
          const { data: progressData } = await fetch(`/api/courses/${course.id}/progress`).then(r => r.json())
          enrollmentsMap[course.id] = {
            course_id: course.id,
            enrolled: true,
            progress: progressData?.completionPercentage || 0,
            completion_percentage: progressData?.completionPercentage || 0,
          }
        } else {
          enrollmentsMap[course.id] = {
            course_id: course.id,
            enrolled: false,
            progress: 0,
            completion_percentage: 0,
          }
        }
      }

      setEnrollments(enrollmentsMap)
    } catch (error) {
      console.error('Error loading enrollments:', error)
    }
  }, [courses, supabase, user.id])

  useEffect(() => {
    if (courses.length > 0) {
      loadEnrollments()
    }
  }, [courses.length, loadEnrollments])

  const handleEnroll = async (courseId: string, courseTitle: string, isFree: boolean) => {
    setEnrollingCourseId(courseId)

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: isFree ? 'free' : 'manual' }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes('Already enrolled')) {
          toast({
            title: "Already Enrolled",
            description: "You are already enrolled in this course.",
          })
          loadEnrollments()
          return
        }
        throw new Error(data.error || 'Failed to enroll')
      }

      toast({
        title: "Success!",
        description: `Successfully enrolled in ${courseTitle}`,
      })

      loadEnrollments()
    } catch (error: any) {
      console.error('Error enrolling:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      })
    } finally {
      setEnrollingCourseId(null)
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700'
    }
  }

  const getDifficultyGradient = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'from-emerald-900/70 to-emerald-800/40'
      case 'intermediate':
        return 'from-amber-900/70 to-amber-800/40'
      case 'advanced':
        return 'from-rose-900/70 to-rose-800/40'
      default:
        return 'from-gray-900 to-gray-900'
    }
  }

  const filteredCourses = courses.filter((course: CourseWithLessons) => {
    if (difficultyFilter !== 'all' && course.difficulty !== difficultyFilter) {
      return false
    }
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gold-600 via-gold-500 to-gold-600 rounded-2xl p-8 text-black shadow-xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-gray-800" />
                <span className="text-gray-800 text-sm font-medium">Learning Hub</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Trading Courses
              </h1>
              <p className="text-gray-800 text-lg max-w-2xl">
                Master the art of trading with our comprehensive course library
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-12 h-12 text-black" />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <BookOpen className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Total Courses</p>
            <p className="text-3xl font-bold text-white">{stats.published_courses || courses.length}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <AcademicCapIcon className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Total Lessons</p>
            <p className="text-3xl font-bold text-white">{stats.total_lessons || courses.reduce((acc: number, c: CourseWithLessons) => acc + (c.lesson_count || 0), 0)}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <Clock className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Total Duration</p>
            <p className="text-3xl font-bold text-white">
              {formatDuration(stats.total_duration || courses.reduce((acc: number, c: CourseWithLessons) => acc + (c.total_duration || 0), 0))}
            </p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Available Now</p>
            <p className="text-3xl font-bold text-white">{filteredCourses.length}</p>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setDifficultyFilter(difficulty)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  difficultyFilter === difficulty
                    ? 'bg-gold-500 text-black shadow-md'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {coursesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-gray-900 border border-gray-800">
              <div className="h-48 bg-gray-800 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-800 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: CourseWithLessons) => {
            const enrollment = enrollments[course.id]
            const isEnrolled = enrollment?.enrolled || false
            const progress = enrollment?.completion_percentage || 0
            const isFree = (course as any).is_free || (course as any).price === 0 || !(course as any).price
            const price = (course as any).price || 0

            return (
            <Card 
              key={course.id} 
              className={`group hover:shadow-xl transition-all duration-300 border ${isEnrolled ? 'border-green-400/60' : 'border-gray-800'} bg-gradient-to-br ${getDifficultyGradient(course.difficulty)}`}
            >
              {/* Course Image/Thumbnail */}
              {course.thumbnail_url ? (
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg overflow-hidden relative">
                  <Image 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {isEnrolled && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Enrolled
                    </div>
                  )}
                  {!isEnrolled && !isFree && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      ${price}
                    </div>
                  )}
                  {isFree && !isEnrolled && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Free
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-t-lg flex items-center justify-center relative">
                  <GraduationCap className="w-16 h-16 text-white/50" />
                  {isEnrolled && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Enrolled
                    </div>
                  )}
                  {!isEnrolled && !isFree && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      ${price}
                    </div>
                  )}
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl font-bold text-white line-clamp-2">
                    {course.title}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2 min-h-[2.5rem] text-gray-400">
                  {course.description || 'No description available'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Meta */}
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-100">{formatDuration(course.total_duration || course.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-100">{course.lesson_count || 0} lessons</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>

                {/* Progress Bar (if enrolled) */}
                {isEnrolled && (
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Your Progress</span>
                      <span className="font-semibold text-white">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((enrollment?.completion_percentage || 0) / 100 * (course.lesson_count || 0))} of {course.lesson_count || 0} lessons completed
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {isEnrolled ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 group/btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/courses/${course.id}`)
                    }}
                  >
                    {progress === 100 ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Course Completed
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        Continue Learning
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-gold-500 hover:bg-gold-600 text-black group/btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEnroll(course.id, course.title, isFree)
                    }}
                    disabled={enrollingCourseId === course.id}
                  >
                    {enrollingCourseId === course.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Enrolling...
                      </>
                    ) : isFree ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Enroll Free
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Course (${price})
                      </>
                    )}
                  </Button>
                )}

                {!isEnrolled && (
                  <p className="text-xs text-center text-gray-500">
                    {isFree ? 'Free to enroll' : 'Purchase required to access course content'}
                  </p>
                )}
              </CardContent>
            </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-700 bg-gray-900">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || difficultyFilter !== 'all' ? 'No courses found' : 'No courses available'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery || difficultyFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back soon for new courses!'}
            </p>
            {(searchQuery || difficultyFilter !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchQuery('')
                  setDifficultyFilter('all')
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CoursesSection;

