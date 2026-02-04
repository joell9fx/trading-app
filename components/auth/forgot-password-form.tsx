'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setIsSuccess(true)
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      })
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-gray-900 border border-gray-800 py-8 px-6 shadow-xl rounded-lg sm:px-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => router.push('/signin')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg sm:px-10">
      <div className="mb-8 text-center">
        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
          <span className="text-white font-bold text-lg">TA</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Forgot password?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </div>
          ) : (
            <div className="flex items-center">
              Send reset link
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="inline h-4 w-4 mr-1" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

