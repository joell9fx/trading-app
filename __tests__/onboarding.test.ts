/**
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals'
import { buildOnboardingSteps, onboardingProgress, type OnboardingInput } from '@/lib/onboarding'

const fresh: OnboardingInput = {
  completedLessons: 0,
  activeCourses: 0,
  communityPosts: 0,
  journalEntries: 0,
  signalsUnlocked: false,
}

const doneIds = (input: OnboardingInput) =>
  buildOnboardingSteps(input)
    .filter((s) => s.done)
    .map((s) => s.id)

describe('buildOnboardingSteps', () => {
  it('starts with nothing done for a brand-new member', () => {
    expect(doneIds(fresh)).toEqual([])
    expect(onboardingProgress(buildOnboardingSteps(fresh))).toEqual({ done: 0, total: 5, complete: false })
  })

  it('counts a bio or avatar as a completed profile, but not whitespace', () => {
    expect(doneIds({ ...fresh, bio: 'Swing trader' })).toContain('profile')
    expect(doneIds({ ...fresh, avatarUrl: 'https://x/y.png' })).toContain('profile')
    expect(doneIds({ ...fresh, bio: '   ' })).not.toContain('profile')
  })

  it('marks steps done from real activity', () => {
    expect(doneIds({ ...fresh, activeCourses: 1 })).toEqual(['course'])
    expect(doneIds({ ...fresh, completedLessons: 3 })).toEqual(['course'])
    expect(doneIds({ ...fresh, communityPosts: 1 })).toEqual(['community'])
    expect(doneIds({ ...fresh, journalEntries: 1 })).toEqual(['journal'])
    expect(doneIds({ ...fresh, signalsUnlocked: true })).toEqual(['signals'])
  })

  it('reports complete when every step is done', () => {
    const steps = buildOnboardingSteps({
      bio: 'hi',
      completedLessons: 1,
      activeCourses: 1,
      communityPosts: 1,
      journalEntries: 1,
      signalsUnlocked: true,
    })
    expect(onboardingProgress(steps).complete).toBe(true)
  })

  it('links every step to a dashboard section', () => {
    buildOnboardingSteps(fresh).forEach((s) => expect(s.section).toMatch(/^[a-z-]+$/))
  })
})
