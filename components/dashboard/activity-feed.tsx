'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  BarChart3,
  Flame,
  BookOpen,
  ShieldCheck,
  Crown,
  Activity,
  Inbox,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityItem, ActivityItemIconKey } from '@/lib/dashboard/activity-types';

// ─── Centralized icon map for all ActivityItem iconKey values ───────────────
// Single source of truth; add new iconKey in activity-types.ts and map here.

const ACTIVITY_ICON_MAP: Record<ActivityItemIconKey, LucideIcon> = {
  signal: TrendingUp,
  analysis: BarChart3,
  g2g: Flame,
  lesson: BookOpen,
  admin: ShieldCheck,
  membership: Crown,
  default: Activity,
};

function getActivityItemIcon(iconKey?: ActivityItemIconKey): LucideIcon {
  if (!iconKey || !(iconKey in ACTIVITY_ICON_MAP)) return ACTIVITY_ICON_MAP.default;
  return ACTIVITY_ICON_MAP[iconKey];
}

// ─── Fallback mock data (only when items not passed) ────────────────────────

const MOCK_ITEMS: ActivityItem[] = [
  {
    id: 'mock-1',
    iconKey: 'signal',
    title: 'New Gold Signal Posted',
    timestamp: '2026-03-06T14:30:00Z',
  },
  {
    id: 'mock-2',
    iconKey: 'analysis',
    title: 'Weekly Analysis Uploaded',
    timestamp: '2026-03-06T10:00:00Z',
  },
  {
    id: 'mock-3',
    iconKey: 'g2g',
    title: 'Gold to Glory Update (+4R today)',
    timestamp: '2026-03-06T09:15:00Z',
  },
  {
    id: 'mock-4',
    iconKey: 'lesson',
    title: 'New Lesson Added',
    timestamp: '2026-03-05T16:45:00Z',
  },
];

// ─── Time formatting ─────────────────────────────────────────────────────

function formatRelativeTime(ts: string): string {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return ts;
  }
}

function getTimeLabel(item: ActivityItem): string {
  if (item.timestampLabel != null && item.timestampLabel !== '') {
    return item.timestampLabel;
  }
  return formatRelativeTime(item.timestamp);
}

// ─── Component ────────────────────────────────────────────────────────────

export interface ActivityFeedProps {
  /** Feed items; when undefined, fallback mock data is used. Pass [] for empty state. */
  items?: ActivityItem[];
  /** Section title; default "Member Updates" */
  title?: string;
  /** Max number of items to show before scrolling; default 5. Ignored when 0. */
  maxVisible?: number;
  /** When there are hidden items, optional href for "View all updates" footer link. */
  viewAllHref?: string;
  /** Label for the footer "view all" action; default "View all updates". */
  viewAllLabel?: string;
}

const DEFAULT_TITLE = 'Member Updates';
const DEFAULT_MAX_VISIBLE = 5;
const DEFAULT_VIEW_ALL_LABEL = 'View all updates';
const FEED_MAX_HEIGHT = '16rem'; /* ~256px, keeps overview compact */

export function ActivityFeed({
  items,
  title = DEFAULT_TITLE,
  maxVisible = DEFAULT_MAX_VISIBLE,
  viewAllHref,
  viewAllLabel = DEFAULT_VIEW_ALL_LABEL,
}: ActivityFeedProps) {
  const list = items !== undefined ? items : MOCK_ITEMS;
  const hasItems = list.length > 0;
  const displayList = maxVisible > 0 ? list.slice(0, maxVisible) : list;
  const hasMore = maxVisible > 0 && list.length > maxVisible;

  const cardHover =
    'transition-all duration-200 ease-out hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20';

  return (
    <Card className={`bg-white/5 border border-white/10 overflow-hidden ${cardHover}`}>
      <div className="px-4 py-3 border-b border-white/10 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Activity</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-5 h-5 text-gold-300 shrink-0" aria-hidden />
            <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0" aria-label="Live">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500">Live</span>
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        {!hasItems ? (
          <div
            className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center"
            style={{ minHeight: FEED_MAX_HEIGHT }}
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-gray-500" aria-hidden />
            </div>
            <p className="text-sm text-gray-400">No updates yet</p>
            <p className="text-xs text-gray-500 max-w-[220px]">
              New member activity and platform updates will appear here.
            </p>
          </div>
        ) : (
          <ul
            className="divide-y divide-white/5 overflow-y-auto"
            style={{ maxHeight: FEED_MAX_HEIGHT }}
          >
            {displayList.map((item) => {
              const Icon = getActivityItemIcon(item.iconKey);
              const timeLabel = getTimeLabel(item);
              const isNew = item.isNew === true;
              const rowBaseClass =
                'flex items-start gap-3 px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-inset';
              const rowClass = isNew
                ? `${rowBaseClass} bg-gold-500/5 border-l-2 border-l-gold-500/40 hover:bg-white/5`
                : `${rowBaseClass} hover:bg-white/5`;
              const content = (
                <>
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gold-400" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeLabel}</p>
                  </div>
                  {item.actionLabel ? (
                    <span className="text-xs font-semibold text-gold-200 whitespace-nowrap">
                      {item.actionLabel}
                    </span>
                  ) : null}
                </>
              );

              return (
                <li key={item.id}>
                  {item.href ? (
                    <Link href={item.href} className={rowClass}>
                      {content}
                    </Link>
                  ) : (
                    <div className={rowClass}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {hasItems && hasMore && (
          <div className="border-t border-white/5">
            {viewAllHref ? (
              <Link
                href={viewAllHref}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-gold-300 hover:text-gold-200 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-inset"
              >
                {viewAllLabel}
                <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
              </Link>
            ) : (
              <div className="px-4 py-2 text-center">
                <p className="text-xs text-gray-500">
                  +{list.length - (maxVisible ?? 0)} more
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
