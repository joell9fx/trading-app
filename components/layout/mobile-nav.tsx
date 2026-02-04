'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, MessageCircle, TrendingUp, BookOpen, MoreHorizontal } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [supabase])

  // Only show on mobile and when authenticated
  if (!isAuthenticated || pathname === '/signin' || pathname === '/signup') {
    return null
  }

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageCircle, label: 'Community', path: '/community-hub' },
    { icon: TrendingUp, label: 'Signals', path: '/dashboard?section=signals' },
    { icon: BookOpen, label: 'Courses', path: '/dashboard?section=courses' },
    { icon: MoreHorizontal, label: 'More', path: '/dashboard?section=profile' },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path.split('?')[0]
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-gold-400'
                  : 'text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

