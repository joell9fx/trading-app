import { Suspense } from 'react'
import { SignUpForm } from '@/components/auth/signup-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Sign Up - Trading Academy',
  description: 'Create your Trading Academy account to start your trading journey.',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<LoadingSpinner />}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  )
}

