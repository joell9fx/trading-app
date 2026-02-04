'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Learn', href: '/courses' },
    { name: 'Signals', href: '/signals' },
    { name: 'Funded', href: '/funding-account' },
    { name: 'Auto', href: '/auto-trader' },
    { name: 'Mentoring', href: '/mentoring' },
    { name: 'Community Hub', href: '/community-hub' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: '🧪 Test', href: '/test' },
  ]

  return (
    <nav className="bg-black/90 backdrop-blur-xl border-b border-yellow-500/20 sticky top-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-9 w-9 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-yellow-500/40">
                <span className="text-black font-bold text-sm">TA</span>
              </div>
              <span className="text-xl font-bold text-white transition-all duration-300 group-hover:text-yellow-500">
                Trading Academy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative text-gray-300 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-900/50 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Auth buttons */}
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-yellow-500 hover:bg-gray-900/50 transition-all duration-300">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-105 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 p-0"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black border-t border-yellow-500/20">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-yellow-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-800">
              <div className="mt-3 space-y-1">
                <Link href="/signin">
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full justify-start">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
