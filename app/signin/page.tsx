import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/signin-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Sign In - Trading Academy',
  description: 'Sign in to your Trading Academy account to access courses, community, and mentoring.',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<LoadingSpinner />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}

