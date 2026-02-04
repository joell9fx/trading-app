import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Reset Password - Trading Academy',
  description: 'Reset your Trading Academy account password.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}

