'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Save, 
  Camera, 
  Mail,
  Calendar,
  Shield,
  Sparkles,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Clock,
  Edit2,
  Crown
} from 'lucide-react'
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  email: string
  name?: string
  role?: string
  bio?: string
  timezone?: string
  avatar_url?: string
  created_at?: string
}

interface ProfileSectionProps {
  user: UserProfile
}

export function ProfileSection({ user }: ProfileSectionProps) {
  // Safety check for user object
  if (!user || !user.id || !user.email) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Invalid User Data</h3>
          <p className="text-gray-400">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  const [profile, setProfile] = useState({
    name: user.name || user.email?.split('@')[0] || '',
    bio: user.bio || '',
    timezone: user.timezone || '',
  })
  const normalizedRole = (user.role || 'member').toLowerCase()
  const roleLabel = normalizedRole === 'owner' ? 'Owner' : normalizedRole === 'admin' ? 'Admin' : 'Member'
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    lessonsCompleted: 0,
    communityPosts: 0,
    mentorshipSessions: 0,
  })
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const loadProfileStats = useCallback(async () => {
    try {
      // Fetch user stats
      // This is a placeholder - you can implement actual stats fetching
      setStats({
        coursesCompleted: 3,
        lessonsCompleted: 12,
        communityPosts: 5,
        mentorshipSessions: 2,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans:plan_id (
            id,
            name,
            description,
            price_monthly,
            price_yearly,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error)
      } else if (data) {
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }, [supabase, user.id])

  useEffect(() => {
    loadProfileStats()
    loadSubscription()
  }, [loadProfileStats, loadSubscription, user.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          bio: profile.bio,
          timezone: profile.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.charAt(0).toUpperCase() || 'U'
  }

  const userName = user.name || user.email?.split('@')[0] || 'User'
  const initials = getInitials(user.name || '', user.email)

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gold-600 via-gold-500 to-gold-600 rounded-2xl p-8 text-black shadow-xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-gray-800" />
                <span className="text-gray-800 text-sm font-medium">Your Profile</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                {userName}'s Profile
              </h1>
              <p className="text-gray-800 text-lg max-w-2xl">
                Manage your account information, preferences, and view your activity
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/10 border border-black/20 px-3 py-1 text-sm font-semibold text-black">
                <Shield className="h-4 w-4" />
                Role: {roleLabel}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-12 h-12 text-black" />
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
                <BookOpen className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Courses Completed</p>
            <p className="text-3xl font-bold text-white">{stats.coursesCompleted}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Lessons Completed</p>
            <p className="text-3xl font-bold text-white">{stats.lessonsCompleted}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <MessageSquare className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Community Posts</p>
            <p className="text-3xl font-bold text-white">{stats.communityPosts}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <UserGroupIcon className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Mentorship Sessions</p>
            <p className="text-3xl font-bold text-white">{stats.mentorshipSessions}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border border-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Profile Information</CardTitle>
                  <CardDescription className="mt-1 text-gray-400">
                    Update your personal information and bio
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your full name"
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="mt-2 h-11 bg-gray-800 border-gray-700 text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-base font-semibold text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself, your trading experience, and goals..."
                    rows={5}
                    disabled={!isEditing}
                    className="mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Share your trading journey and what you're looking to achieve
                  </p>
                </div>

                <div>
                  <Label htmlFor="timezone" className="text-base font-semibold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timezone
                  </Label>
                  <select
                    id="timezone"
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    disabled={!isEditing}
                    className="flex h-11 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:bg-gray-900 disabled:cursor-not-allowed disabled:text-gray-500 mt-2"
                  >
                    <option value="">Select timezone</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-800">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setProfile({
                          name: user.name || user.email?.split('@')[0] || '',
                          bio: user.bio || '',
                          timezone: user.timezone || '',
                        })
                      }}
                      className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Profile Avatar & Account Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gray-900 border border-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Profile Picture</CardTitle>
              <CardDescription className="text-gray-400">
                Your profile picture appears across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="relative mx-auto">
                  <div className="h-32 w-32 bg-gradient-to-br from-gold-500 via-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-black font-bold text-4xl">
                      {initials}
                    </span>
                  </div>
                  {user.avatar_url && (
                    <Image 
                      src={user.avatar_url} 
                      alt={userName}
                      fill
                      unoptimized
                      className="rounded-full object-cover absolute inset-0"
                      sizes="128px"
                    />
                  )}
                </div>
                <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <p className="text-xs text-gray-500">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Account Role
                </p>
                <p className="font-bold text-white capitalize">
                  {user.role || 'Member'}
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Member Since
                </p>
                <p className="font-bold text-white">
                  {user.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Account Status
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <p className="font-bold text-white">Active</p>
                </div>
              </div>
              
              {subscription && (
                <div className="p-3 bg-gradient-to-r from-gold-500/20 to-gold-600/20 rounded-lg border border-gold-500/30 mt-3">
                  <p className="text-xs font-medium text-gold-400 mb-1 flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5" />
                    Membership Plan
                  </p>
                  <p className="font-bold text-gold-300 capitalize">
                    {(subscription.plans as any)?.name || 'Free'}
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-gold-400 mt-1">
                      Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfileSection;

