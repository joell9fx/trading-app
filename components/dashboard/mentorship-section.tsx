'use client'

import { useCallback, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  DollarSign,
  Sparkles,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  ArrowRight,
  Users,
  TrendingUp
} from 'lucide-react'
import {
  UserGroupIcon,
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

interface Mentor {
  id: string
  user_id: string
  bio: string | null
  expertise: string[] | null
  hourly_rate: number | null
  is_available: boolean
  created_at: string
  profile?: {
    email: string
    name: string
  }
}

interface Booking {
  id: string
  mentor_id: string
  user_id: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  mentor?: Mentor
}

interface MentorshipSectionProps {
  user: UserProfile
}

export function MentorshipSection({ user }: MentorshipSectionProps) {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  
  const supabase = createSupabaseClient()

  const loadMentors = useCallback(async () => {
    try {
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (mentorsError) throw mentorsError

      // Fetch profiles for each mentor
      if (mentorsData) {
        const mentorsWithProfiles = await Promise.all(
          mentorsData.map(async (mentor) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email, name')
              .eq('id', mentor.user_id)
              .single()

            return {
              ...mentor,
              profile: profileData || null
            }
          })
        )
        setMentors(mentorsWithProfiles)
      } else {
        setMentors([])
      }
    } catch (error) {
      console.error('Error loading mentors:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const loadBookings = useCallback(async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })

      if (bookingsError) throw bookingsError

      // Fetch mentors for each booking
      if (bookingsData) {
        const bookingsWithMentors = await Promise.all(
          bookingsData.map(async (booking) => {
            const { data: mentorData } = await supabase
              .from('mentors')
              .select('*')
              .eq('id', booking.mentor_id)
              .single()

            let mentorWithProfile = null
            if (mentorData) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('email, name')
                .eq('id', mentorData.user_id)
                .single()

              mentorWithProfile = {
                ...mentorData,
                profile: profileData || null
              }
            }

            return {
              ...booking,
              mentor: mentorWithProfile
            }
          })
        )
        setBookings(bookingsWithMentors)
      } else {
        setBookings([])
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }, [supabase, user.id])

  useEffect(() => {
    loadMentors()
    loadBookings()
  }, [loadBookings, loadMentors])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const upcomingBookings = bookings.filter(b => 
    new Date(b.start_time) > new Date() && b.status !== 'cancelled'
  )
  const pastBookings = bookings.filter(b => 
    new Date(b.start_time) < new Date() || b.status === 'completed'
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gold-600 via-gold-500 to-gold-600 rounded-2xl p-8 text-black shadow-xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-gray-800" />
                <span className="text-gray-800 text-sm font-medium">Personal Guidance</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Mentorship Program
              </h1>
              <p className="text-gray-800 text-lg max-w-2xl">
                Connect with expert traders for personalized guidance and accelerate your trading journey
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-black/15 rounded-full flex items-center justify-center backdrop-blur-sm">
                <UserCheck className="w-12 h-12 text-black" />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <Users className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Available Mentors</p>
            <p className="text-3xl font-bold text-white">{mentors.length}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <Calendar className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Upcoming Sessions</p>
            <p className="text-3xl font-bold text-white">{upcomingBookings.length}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Completed Sessions</p>
            <p className="text-3xl font-bold text-white">{pastBookings.filter(b => b.status === 'completed').length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Mentors */}
        <Card className="bg-gray-900 border border-gray-800 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white">Available Mentors</CardTitle>
                <CardDescription className="mt-1 text-gray-400">
                  Book sessions with experienced traders
                </CardDescription>
              </div>
              <UserGroupIcon className="h-8 w-8 text-gold-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse border border-gray-800 rounded-lg p-4 bg-gray-900">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gray-800 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mentors.length > 0 ? (
              mentors.map((mentor) => {
                const mentorName = mentor.profile?.name || mentor.profile?.email?.split('@')[0] || 'Mentor'
                const initials = getInitials(mentorName)
                
                return (
                  <Card 
                    key={mentor.id} 
                    className="border border-gray-800 bg-gray-900 hover:border-gold-500/40 transition-all cursor-pointer group"
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-gold-500 via-gold-400 to-gold-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                          <span className="text-black font-bold text-lg">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-white group-hover:text-gold-300 transition-colors">
                            {mentorName}
                          </h3>
                          {mentor.expertise && mentor.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {mentor.expertise.slice(0, 3).map((exp, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-0.5 bg-gold-500/10 text-gold-300 text-xs font-medium rounded-full border border-gold-500/20"
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          )}
                          {mentor.bio && (
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{mentor.bio}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            {mentor.hourly_rate && (
                              <div className="flex items-center gap-1 text-gray-200 font-semibold">
                                <DollarSign className="h-4 w-4 text-gold-300" />
                                <span>${mentor.hourly_rate}/hour</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-400">
                              <Star className="h-4 w-4 text-gold-400 fill-gold-400" />
                              <span>4.9</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-gold-500 hover:bg-gold-600 text-black"
                          onClick={() => {
                            setSelectedMentor(mentor)
                            setShowBookModal(true)
                          }}
                        >
                          Book Session
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-300 font-medium mb-2">No mentors available</p>
                <p className="text-sm text-gray-500">Check back later for new mentors</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Sessions */}
        <Card className="bg-gray-900 border border-gray-800 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white">Your Sessions</CardTitle>
                <CardDescription className="mt-1 text-gray-400">
                  Upcoming and past mentorship sessions
                </CardDescription>
              </div>
              <Calendar className="h-8 w-8 text-gold-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.length > 0 ? (
              <>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gold-400" />
                  Upcoming ({upcomingBookings.length})
                </h4>
                {upcomingBookings.map((booking) => {
                  const mentorName = booking.mentor?.profile?.name || 'Mentor'
                  const initials = getInitials(mentorName)
                  
                  return (
                    <Card key={booking.id} className="border border-gray-800 bg-gray-900">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-gold-500 via-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                              <span className="text-black font-semibold text-sm">{initials}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{mentorName}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatDate(booking.start_time)} at {formatTime(booking.start_time)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Video className="h-4 w-4 text-gray-500" />
                            <span>Video Call</span>
                          </div>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-400 mt-3 pt-3 border-t border-gray-800">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-300 font-medium mb-2">No upcoming sessions</p>
                <p className="text-sm text-gray-500 mb-4">Book your first mentorship session!</p>
                {mentors.length > 0 && (
                  <Button 
                    onClick={() => {
                      setSelectedMentor(mentors[0])
                      setShowBookModal(true)
                    }}
                    className="bg-gold-500 hover:bg-gold-600 text-black"
                  >
                    Browse Mentors
                  </Button>
                )}
              </div>
            )}

            {pastBookings.length > 0 && (
              <>
                <h4 className="font-semibold text-white mb-3 mt-6 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold-400" />
                  Past Sessions ({pastBookings.length})
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pastBookings.slice(0, 3).map((booking) => {
                    const mentorName = booking.mentor?.profile?.name || 'Mentor'
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-gold-500 via-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                            <span className="text-black font-semibold text-xs">
                              {getInitials(mentorName)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{mentorName}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.start_time)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Modal Placeholder */}
      {showBookModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gray-900 border border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Book Session with {selectedMentor.profile?.name || 'Mentor'}</CardTitle>
              <CardDescription className="text-gray-400">
                Select a date and time for your mentorship session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Booking functionality coming soon! This will allow you to schedule sessions with mentors.
                </p>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-black"
                    onClick={() => setShowBookModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MentorshipSection;

