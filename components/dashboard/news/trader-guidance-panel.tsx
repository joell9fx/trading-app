'use client';

import { cn } from '@/lib/utils';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface TraderGuidancePanelProps {
  notes: string[];
  className?: string;
}

export function TraderGuidancePanel({ notes, className }: TraderGuidancePanelProps) {
  if (notes.length === 0) return null;
  return (
    <ul className={cn('space-y-2', className)}>
      {notes.map((note, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
          <LightBulbIcon className="h-4 w-4 text-primary/70 shrink-0 mt-0.5" />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  );
}
