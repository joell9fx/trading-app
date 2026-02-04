'use client'

import { useCallback, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  Settings, 
  Shield, 
  UserCheck,
  UserX,
  AlertTriangle,
  BarChart3,
  Crown,
  Sparkles
} from 'lucide-react'
import { UserRole } from '@/lib/permissions'

interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  bio?: string
  timezone?: string
  avatar_url?: string
  created_at: string
}

interface AdminPanelProps {
  user: UserProfile
}

interface Member {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  last_sign_in_at?: string
  subscription?: {
    plan_id: string
    plan_name: string
    status: string
    current_period_end: string
  }
}

interface Plan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
}

export function AdminPanel({ user }: AdminPanelProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('MEMBER')
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const loadPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error loading plans:', error)
    }
  }, [supabase])

  const loadMembers = useCallback(async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch subscriptions for each member
      const membersWithSubscriptions = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select(`
              plan_id,
              status,
              current_period_end,
              plans:plan_id (name)
            `)
            .eq('user_id', profile.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...profile,
            subscription: subscriptionData ? {
              plan_id: subscriptionData.plan_id,
              plan_name: (subscriptionData.plans as any)?.name || 'Free',
              status: subscriptionData.status,
              current_period_end: subscriptionData.current_period_end,
            } : undefined,
          }
        })
      )

      setMembers(membersWithSubscriptions)
    } catch (error) {
      console.error('Error loading members:', error)
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    loadMembers()
    loadPlans()
  }, [loadMembers, loadPlans])

  const updateMemberRole = async (memberId: string, role: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${memberId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      toast({
        title: "Success",
        description: `Member role updated to ${role}`,
      })

      loadMembers()
      setShowRoleModal(false)
      setSelectedMember(null)
    } catch (error: any) {
      console.error('Error updating member role:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const assignSubscription = async (memberId: string, planId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${memberId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, status: 'active' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign subscription')
      }

      toast({
        title: "Success",
        description: `Subscription assigned successfully`,
      })

      loadMembers()
      setShowSubscriptionModal(false)
      setSelectedMember(null)
      setSelectedPlan('')
    } catch (error: any) {
      console.error('Error assigning subscription:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to assign subscription",
        variant: "destructive",
      })
    }
  }

  const getStats = () => {
    const totalMembers = members.length
    const adminCount = members.filter(m => m.role === 'ADMIN').length
    const moderatorCount = members.filter(m => m.role === 'MODERATOR').length
    const traderCount = members.filter(m => m.role === 'TRADER').length
    const memberCount = members.filter(m => m.role === 'MEMBER').length
    const viewerCount = members.filter(m => m.role === 'VIEWER').length
    const subscribedCount = members.filter(m => m.subscription?.status === 'active').length
    const activeToday = members.filter(m => {
      if (!m.last_sign_in_at) return false
      const lastSignIn = new Date(m.last_sign_in_at)
      const today = new Date()
      return lastSignIn.toDateString() === today.toDateString()
    }).length

    return { 
      totalMembers, 
      adminCount, 
      moderatorCount,
      traderCount,
      memberCount, 
      viewerCount,
      subscribedCount,
      activeToday 
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/20 text-red-300 border border-red-500/30'
      case 'MODERATOR':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      case 'TRADER':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'MEMBER':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'VIEWER':
        return 'bg-gray-800 text-gray-300 border border-gray-700'
      default:
        return 'bg-gray-800 text-gray-300 border border-gray-700'
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gold-600 via-gold-500 to-gold-600 rounded-2xl p-8 text-black shadow-xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-gray-800" />
                <span className="text-gray-800 text-sm font-medium">Administration</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Admin Panel
              </h1>
              <p className="text-gray-800 text-lg max-w-2xl">
                Manage users, roles, subscriptions, and system settings
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-12 h-12 text-black" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <Users className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Total Members</p>
            <p className="text-3xl font-bold text-white">{stats.totalMembers}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <Shield className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Admins</p>
            <p className="text-3xl font-bold text-white">{stats.adminCount}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <Crown className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Subscribed</p>
            <p className="text-3xl font-bold text-white">{stats.subscribedCount}</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/20 border border-gold-500/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-gold-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Active Today</p>
            <p className="text-3xl font-bold text-white">{stats.activeToday}</p>
          </div>
        </Card>
      </div>

      {/* Member Management */}
      <Card className="bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Member Management</CardTitle>
          <CardDescription className="text-gray-400">
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading members...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-900">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                      <span className="text-black font-semibold text-sm">
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      <p className="text-sm text-gray-400">{member.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      {member.subscription && (
                        <span className="px-2 py-0.5 bg-gold-500/20 border border-gold-500/30 text-gold-300 rounded-full text-xs font-medium flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          {member.subscription.plan_name}
                        </span>
                      )}
                    </div>
                    {member.id !== user.id && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400"
                          onClick={() => {
                            setSelectedMember(member)
                            setNewRole(member.role)
                            setShowRoleModal(true)
                          }}
                        >
                          Change Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gold-500/40 text-gold-300 hover:border-gold-500 hover:text-gold-200"
                          onClick={() => {
                            setSelectedMember(member)
                            setShowSubscriptionModal(true)
                          }}
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Subscription
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Change Member Role</CardTitle>
              <CardDescription className="text-gray-400">
                Update role for {selectedMember.name} ({selectedMember.email})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role" className="text-gray-200">New Role</Label>
                <select
                  id="role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
                >
                  <option value="VIEWER">Viewer (Read-only)</option>
                  <option value="MEMBER">Member (Standard access)</option>
                  <option value="TRADER">Trader (Enhanced features)</option>
                  <option value="MODERATOR">Moderator (Community management)</option>
                  <option value="ADMIN">Admin (Full access)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Current role: <span className="font-semibold">{selectedMember.role}</span>
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => updateMemberRole(selectedMember.id, newRole)}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-black"
                >
                  Update Role
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRoleModal(false)
                    setSelectedMember(null)
                  }}
                  className="flex-1 border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Crown className="h-5 w-5 text-gold-400" />
                Assign Subscription
              </CardTitle>
              <CardDescription className="text-gray-400">
                Assign a membership plan to {selectedMember.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedMember.subscription && (
                <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
                  <p className="text-sm font-medium text-gold-200">
                    Current Plan: {selectedMember.subscription.plan_name}
                  </p>
                  <p className="text-xs text-gold-300 mt-1">
                    Expires: {new Date(selectedMember.subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="plan" className="text-gray-200">Select Plan</Label>
                <select
                  id="plan"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
                >
                  <option value="">Select a plan...</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price_monthly}/month
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => selectedPlan && assignSubscription(selectedMember.id, selectedPlan)}
                  disabled={!selectedPlan}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-black disabled:opacity-50 disabled:text-black"
                >
                  Assign Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSubscriptionModal(false)
                    setSelectedMember(null)
                    setSelectedPlan('')
                  }}
                  className="flex-1 border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Settings */}
      <Card className="bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">System Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-900">
              <div>
                <h3 className="font-semibold text-white">Maintenance Mode</h3>
                <p className="text-sm text-gray-500">Temporarily disable the platform</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-900">
              <div>
                <h3 className="font-semibold text-white">Email Notifications</h3>
                <p className="text-sm text-gray-500">Manage system email settings</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-900">
              <div>
                <h3 className="font-semibold text-white">Backup & Restore</h3>
                <p className="text-sm text-gray-500">Manage system backups</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:border-gold-500/50 hover:text-gold-400">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPanel;

