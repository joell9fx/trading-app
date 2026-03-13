/**
 * Adapter: maps raw dashboard events into ActivityItem[] for ActivityFeed.
 * Keeps UI (ActivityFeed) separate from event shape; swap data source in dashboard-overview.
 */

import type { ActivityItem, ActivityItemIconKey } from './activity-types';

/** Supported event sources; each maps to an ActivityItem iconKey. */
export type DashboardActivitySource =
  | 'signals'
  | 'gold_to_glory'
  | 'lessons'
  | 'admin'
  | 'membership';

/**
 * Raw dashboard event as returned from API/DB.
 * Normalize and extend per source as needed.
 */
export type RawDashboardEvent = {
  id: string;
  source: DashboardActivitySource;
  title: string;
  timestamp: string; // ISO preferred
  /** Optional deep link for this item */
  href?: string;
  /** Optional action label (e.g. "View", "Open") for the feed row */
  actionLabel?: string;
  /** Mark as new/unread in the feed */
  isNew?: boolean;
  /** Optional pre-formatted time (e.g. "2h ago"); otherwise UI computes relative time */
  timestampLabel?: string;
};

const SOURCE_TO_ICON_KEY: Record<DashboardActivitySource, ActivityItemIconKey> = {
  signals: 'signal',
  gold_to_glory: 'g2g',
  lessons: 'lesson',
  admin: 'admin',
  membership: 'membership',
};

/**
 * Default href per source when event has no href. Override per event via raw href.
 */
const DEFAULT_HREF_BY_SOURCE: Partial<Record<DashboardActivitySource, string>> = {
  signals: '/dashboard?section=signals',
  gold_to_glory: '/dashboard?section=gold-to-glory',
  lessons: '/dashboard?section=courses',
  admin: '/dashboard?section=notifications',
  membership: '/dashboard?section=profile',
};

function rawEventToActivityItem(raw: RawDashboardEvent): ActivityItem {
  const iconKey = SOURCE_TO_ICON_KEY[raw.source];
  const href = raw.href ?? DEFAULT_HREF_BY_SOURCE[raw.source];
  return {
    id: raw.id,
    iconKey,
    title: raw.title,
    timestamp: raw.timestamp,
    timestampLabel: raw.timestampLabel,
    href: href || undefined,
    actionLabel: raw.actionLabel,
    isNew: raw.isNew === true,
  };
}

/**
 * Maps raw dashboard events into ActivityItem[] for ActivityFeed.
 * - Normalizes id, iconKey, title, timestamp, href, actionLabel, isNew (and optional timestampLabel).
 * - Sorts by timestamp descending (newest first).
 * Returns a new array; does not mutate input.
 */
export function adaptDashboardEventsToActivityItems(
  events: RawDashboardEvent[]
): ActivityItem[] {
  const items = events.map(rawEventToActivityItem);
  items.sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    return tB - tA; // newest first
  });
  return items;
}
