export interface OnboardingInput {
  bio?: unknown
  avatarUrl?: unknown
  completedLessons: number
  activeCourses: number
  communityPosts: number
  journalEntries: number
  signalsUnlocked: boolean
}

export interface OnboardingStep {
  id: 'profile' | 'course' | 'community' | 'journal' | 'signals'
  title: string
  description: string
  /** Dashboard section the step links to. */
  section: string
  cta: string
  done: boolean
}

const filled = (v: unknown) => typeof v === 'string' && v.trim().length > 0

/**
 * Getting-started steps for a new member, each marked done from real activity
 * (profile fields and the overview counts), not from clicks.
 */
export function buildOnboardingSteps(input: OnboardingInput): OnboardingStep[] {
  return [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add a short bio or photo so other traders know who you are.',
      section: 'profile',
      cta: 'Edit profile',
      done: filled(input.bio) || filled(input.avatarUrl),
    },
    {
      id: 'course',
      title: 'Start your first course',
      description: 'Pick a course and finish a lesson to build your foundations.',
      section: 'courses',
      cta: 'Browse courses',
      done: input.completedLessons > 0 || input.activeCourses > 0,
    },
    {
      id: 'community',
      title: 'Say hello in the community',
      description: 'Introduce yourself and see what other members are trading.',
      section: 'community-hub',
      cta: 'Open community',
      done: input.communityPosts > 0,
    },
    {
      id: 'journal',
      title: 'Log a trade in your journal',
      description: 'Journaling your trades powers your analytics and AI coaching.',
      section: 'journal',
      cta: 'Open journal',
      done: input.journalEntries > 0,
    },
    {
      id: 'signals',
      title: 'Explore trade signals',
      description: 'See live setups with entries, stops and targets.',
      section: 'signals',
      cta: 'View signals',
      done: input.signalsUnlocked,
    },
  ]
}

export function onboardingProgress(steps: OnboardingStep[]) {
  const done = steps.filter((s) => s.done).length
  return { done, total: steps.length, complete: done === steps.length }
}
