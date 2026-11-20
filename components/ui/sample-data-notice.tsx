import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface SampleDataNoticeProps {
  /** What the sample data stands in for, e.g. "challenge progress". */
  what?: string
  className?: string
}

/**
 * Labels a section that is showing illustrative data instead of live data,
 * so members never mistake demo numbers for real results.
 */
export function SampleDataNotice({ what = 'this section', className }: SampleDataNoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning sm:text-sm',
        className,
      )}
    >
      <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-semibold">Sample data.</span> The figures in {what} are illustrative and not live
        results yet.
      </p>
    </div>
  )
}

export default SampleDataNotice
