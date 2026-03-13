import { SignInContent } from '@/components/auth/signin-content'

export const metadata = {
  title: 'Sign In - Trading Academy',
  description: 'Sign in to your Trading Academy account to access courses, community, and mentoring.',
}

/** Force dynamic so searchParams.redirectTo is available; avoids static bailout. */
export const dynamic = 'force-dynamic'

type SearchParams = { redirectTo?: string } | Promise<{ redirectTo?: string }>

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {}
  const initialRedirectTo =
    typeof params?.redirectTo === 'string' ? params.redirectTo : undefined

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignInContent initialRedirectTo={initialRedirectTo} />
      </div>
    </div>
  )
}
