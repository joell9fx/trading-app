'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getSafeRedirectPath } from '@/lib/utils'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      toast({
        title: "OAuth sign in failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        })
        
        // Redirect to dashboard or intended page (same-origin relative path only)
        const redirectTo = getSafeRedirectPath(searchParams.get('redirectTo'))
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 py-8 px-6 shadow-xl rounded-lg sm:px-10">
      <div className="mb-8 text-center">
        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg flex items-center justify-center mb-4">
          <span className="text-black font-bold text-lg">TA</span>
        </div>
        <h2 className="text-3xl font-bold text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Sign in to your Trading Academy account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-md p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-300">
            Email address
          </Label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-300">
            Password
          </Label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-gold-400 hover:text-gold-300"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            <div className="flex items-center">
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            className="w-full"
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn('apple')}
            className="w-full"
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-300">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-gold-400 hover:text-gold-300"
          >
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

