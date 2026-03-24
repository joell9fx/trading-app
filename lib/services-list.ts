import { SERVICES_CATALOG } from '@/lib/services-catalog'

type CatalogKey = (typeof SERVICES_CATALOG)[number]['key']
type ServiceKeyInternal = Exclude<CatalogKey, 'auto_trader'>

const CREDITS: Record<ServiceKeyInternal, number> = {
  community: 5,
  signals: 8,
  mentorship: 10,
  funding: 6,
  courses: 4,
  gold_to_glory: 9,
  elite_membership: 12,
  vip_membership: 15,
}

export const ALL_SERVICES = SERVICES_CATALOG.filter(
  (e): e is (typeof SERVICES_CATALOG)[number] & { key: ServiceKeyInternal } =>
    e.key !== 'auto_trader',
).map((e) => ({ ...e, credit_cost: CREDITS[e.key] }))

export type ServiceKey = ServiceKeyInternal
