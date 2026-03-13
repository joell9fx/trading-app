'use client';

import { cn } from '@/lib/utils';

interface AffectedAssetsPanelProps {
  assets: string[];
  className?: string;
}

export function AffectedAssetsPanel({ assets, className }: AffectedAssetsPanelProps) {
  if (assets.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No specific asset clusters highlighted.
      </div>
    );
  }
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {assets.map((asset) => (
        <span
          key={asset}
          className="rounded-md border border-border bg-panel px-2.5 py-1 text-xs font-medium text-foreground"
        >
          {asset}
        </span>
      ))}
    </div>
  );
}
