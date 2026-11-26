'use client'

import { useEffect } from 'react'
import { StatusPage } from '@/components/ui/status-page'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPage
      eyebrow="Something went wrong"
      title="This page couldn't load"
      message={
        <>
          <p>We may be having a temporary problem reaching our servers. Please try again in a moment.</p>
          {error.digest && <p className="mt-3 text-xs text-gray-500">Reference: {error.digest}</p>}
        </>
      }
      actions={
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-black hover:bg-gold-400"
        >
          Try again
        </button>
      }
    />
  )
}
