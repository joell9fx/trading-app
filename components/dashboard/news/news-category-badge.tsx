'use client';

import { cn } from '@/lib/utils';
import type { NewsCategory } from '@/lib/news/global-news';

const categoryStyles: Record<NewsCategory, string> = {
  Geopolitics: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  'Central Bank': 'bg-blue-500/15 text-blue-200 border-blue-400/30',
  Economy: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  Energy: 'bg-orange-500/15 text-orange-200 border-orange-400/30',
  Markets: 'bg-primary/15 text-primary border-primary/40',
};

interface NewsCategoryBadgeProps {
  category: NewsCategory;
  className?: string;
}

export function NewsCategoryBadge({ category, className }: NewsCategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        categoryStyles[category],
        className
      )}
    >
      {category}
    </span>
  );
}
