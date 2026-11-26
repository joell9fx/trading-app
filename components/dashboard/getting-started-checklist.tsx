'use client'

import { useEffect, useState } from 'react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { onboardingProgress, type OnboardingStep } from '@/lib/onboarding'

interface GettingStartedChecklistProps {
  userId: string
  steps: OnboardingStep[]
  onNavigate: (section: string) => void
}

const storageKey = (userId: string) => `ta:onboarding-dismissed:${userId}`

/**
 * Getting-started card for new members. Hides itself once every step is done.
 * "Hide" is remembered per browser (localStorage); it is a convenience only.
 */
export function GettingStartedChecklist({ userId, steps, onNavigate }: GettingStartedChecklistProps) {
  const [dismissed, setDismissed] = useState(true) // assume hidden until storage is read, to avoid a flash

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(storageKey(userId)) === '1')
    } catch {
      setDismissed(false)
    }
  }, [userId])

  const { done, total, complete } = onboardingProgress(steps)
  if (dismissed || complete) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      window.localStorage.setItem(storageKey(userId), '1')
    } catch {
      /* storage unavailable: hide for this visit only */
    }
  }

  const pct = Math.round((done / total) * 100)

  return (
    <section aria-labelledby="getting-started-title" className="rounded-xl border border-gold-500/30 bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="getting-started-title" className="text-base font-semibold text-foreground">
            Get started with Trading Academy
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {done} of {total} done. Finish these to get the most out of your membership.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="Hide getting started checklist"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label="Getting started progress"
      >
        <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-4 divide-y divide-white/5">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-start gap-3">
              {step.done ? (
                <CheckCircleSolid className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" aria-hidden="true" />
              ) : (
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
              <div>
                <p className={`text-sm font-medium ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {step.title}
                  <span className="sr-only">{step.done ? ' (done)' : ' (to do)'}</span>
                </p>
                {!step.done && <p className="text-xs text-muted-foreground">{step.description}</p>}
              </div>
            </div>
            {!step.done && (
              <button
                type="button"
                onClick={() => onNavigate(step.section)}
                className="shrink-0 rounded-lg border border-gold-500/40 px-3 py-1.5 text-xs font-semibold text-gold-300 hover:border-gold-400 hover:text-gold-200"
              >
                {step.cta}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default GettingStartedChecklist
