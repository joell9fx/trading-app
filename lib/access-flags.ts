export type AccessModuleKey = 'community' | 'signals' | 'funding' | 'courses' | 'mentorship' | 'auto_trader'

export const ACCESS_DEFAULTS: Record<AccessModuleKey, boolean> = {
  community: true,
  signals: false,
  funding: true,
  courses: true,
  mentorship: true,
  auto_trader: false,
}

export const ACCESS_COLUMN_MAP: Record<AccessModuleKey, string | null> = {
  community: null,
  signals: 'has_signals_access',
  funding: 'has_funding_access',
  courses: 'has_courses_access',
  mentorship: 'has_mentorship_access',
  auto_trader: null,
}

export function deriveAccessFromProfile(profile?: Record<string, any>): Record<AccessModuleKey, boolean> {
  const access = { ...ACCESS_DEFAULTS }

  Object.entries(ACCESS_COLUMN_MAP).forEach(([key, column]) => {
    if (!column) return
    const value = profile?.[column]
    if (typeof value === 'boolean') {
      access[key as AccessModuleKey] = value
    }
  })

  return access
}

export function mergeAccessWithOverrides(
  base: Record<AccessModuleKey, boolean>,
  overrides?: Record<string, boolean>
): Record<AccessModuleKey, boolean> {
  const next = { ...base }
  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      if (key in next && typeof value === 'boolean') {
        next[key as AccessModuleKey] = value
      }
    })
  }
  return next
}

export function countUnlocked(access: Record<AccessModuleKey, boolean>): number {
  return Object.values(access).filter(Boolean).length
}

export function accessColumnForService(key: AccessModuleKey): string | null {
  return ACCESS_COLUMN_MAP[key]
}

