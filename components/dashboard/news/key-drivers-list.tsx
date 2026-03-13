'use client';

import { cn } from '@/lib/utils';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface KeyDriversListProps {
  drivers: string[];
  className?: string;
}

export function KeyDriversList({ drivers, className }: KeyDriversListProps) {
  if (drivers.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        No major drivers identified.
      </p>
    );
  }
  return (
    <ul className={cn('space-y-1.5', className)}>
      {drivers.map((driver, i) => (
        <li
          key={i}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ChevronRightIcon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
          <span>{driver}</span>
        </li>
      ))}
    </ul>
  );
}
