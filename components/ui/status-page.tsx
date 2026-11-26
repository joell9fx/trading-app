import Link from 'next/link'
import type { ReactNode } from 'react'

interface StatusPageProps {
  eyebrow: string
  title: string
  message: ReactNode
  /** Extra actions shown before the default "Back to home" link. */
  actions?: ReactNode
}

/** Full-page message used by the not-found and error boundaries. */
export function StatusPage({ eyebrow, title, message, actions }: StatusPageProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-black px-4 py-16 text-white">
      <div className="w-full max-w-lg space-y-5 rounded-2xl border border-gold-500/30 bg-neutral-950 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-400">{eyebrow}</p>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        <div className="text-gray-300">{message}</div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {actions}
          <Link
            href="/"
            className="rounded-lg border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-300 hover:border-gold-400 hover:text-gold-200"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
