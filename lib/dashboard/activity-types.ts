/**
 * Shared types for dashboard activity feed.
 * Used by ActivityFeed component and can be extended for API/server use.
 */

/** Recognized icon keys for feed items; component maps these to icons. */
export type ActivityItemIconKey =
  | 'signal'
  | 'analysis'
  | 'g2g'
  | 'lesson'
  | 'admin'
  | 'membership'
  | 'default';

/**
 * Single activity feed item.
 * - timestamp: ISO string or any date string for sorting/formatting
 * - timestampLabel: optional pre-formatted label (e.g. "2h ago"); if omitted, UI shows relative time
 * - href: optional link for the whole row (e.g. /dashboard?section=signals). Enables link styling and navigation.
 * - isNew: when true, item is lightly highlighted in the feed (e.g. unread/new).
 */
export type ActivityItem = {
  id: string;
  /** Icon key mapped in UI; use 'default' or omit for generic icon */
  iconKey?: ActivityItemIconKey;
  title: string;
  timestamp: string;
  /** Pre-formatted time label; overrides relative time when set */
  timestampLabel?: string;
  /** Optional destination for click (e.g. /dashboard?section=signals). Enables link styling and navigation. */
  href?: string;
  /** When true, item is shown with a light "new" highlight in the feed */
  isNew?: boolean;
  /** Reserved for future: per-item action callback or label */
  actionLabel?: string;
};
