import { Suspense } from 'react'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Forgot Password - Trading Academy',
  description: 'Reset your Trading Academy account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}

