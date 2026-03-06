import { ACCESS_DEFAULTS, AccessModuleKey } from '@/lib/access-flags'

export type ClientAccessState = Partial<Record<AccessModuleKey, boolean>>

export function isServiceUnlocked(services: ClientAccessState | undefined, key: AccessModuleKey): boolean {
  if (!services) return ACCESS_DEFAULTS[key]
  return !!services[key]
}
