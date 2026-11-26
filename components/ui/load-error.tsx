import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface LoadErrorProps {
  /** What failed to load, e.g. "the leaderboard". */
  what?: string
  onRetry?: () => void
  className?: string
}

/** Inline "couldn't load" message with an optional retry button. */
export function LoadError({ what = 'this section', onRetry, className }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-gray-200 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
        <p>
          We couldn&apos;t load {what} right now. This is usually temporary.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-gold-500/40 px-3 py-1.5 font-semibold text-gold-300 hover:border-gold-400 hover:text-gold-200"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export default LoadError
