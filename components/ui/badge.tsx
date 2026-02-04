import { cn } from '@/lib/utils';
import React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const base =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-amber-500 text-black hover:bg-amber-400',
  secondary: 'border-transparent bg-gray-800 text-gray-200 hover:bg-gray-700',
  outline: 'border-gray-700 text-gray-200',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <div className={cn(base, variantClasses[variant], className)} {...props} />;
}

export default Badge;

