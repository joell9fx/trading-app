'use client';

import { useState, useEffect } from 'react';
import { getGlobalNews, type GlobalNewsSection } from '@/lib/news/global-news';
import { NewsCard } from './news-card';

export function GlobalNewsFeed() {
  const [sections, setSections] = useState<GlobalNewsSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlobalNews()
      .then(setSections)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading news…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.key}>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 border-b border-border pb-2">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
