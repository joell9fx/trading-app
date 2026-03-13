'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { GlobalNewsItem } from '@/lib/news/global-news';
import { NewsCategoryBadge } from './news-category-badge';
import { cn } from '@/lib/utils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface NewsCardProps {
  item: GlobalNewsItem;
  className?: string;
}

function formatDate(dateStr: string, time?: string) {
  const d = new Date(dateStr + (time ? `T${time}:00` : 'T12:00:00'));
  if (time) return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NewsCard({ item, className }: NewsCardProps) {
  return (
    <Card
      className={cn(
        'border-border bg-panel transition-colors hover:border-primary/20',
        item.highlighted && 'ring-1 ring-primary/30',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <NewsCategoryBadge category={item.category} />
          <span className="text-xs text-muted-foreground">
            {formatDate(item.date, item.time)} · {item.source}
          </span>
        </div>
        <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2">
          {item.headline}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.summary}
        </p>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
          >
            Read more
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        )}
        {!item.url && (
          <span className="text-xs text-muted-foreground">Source: {item.source}</span>
        )}
      </CardContent>
    </Card>
  );
}
