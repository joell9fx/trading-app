'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

export function Avatar({ src, alt = 'Avatar', className, fallback = '👤', ...props }: AvatarProps) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-sm text-white',
          className
        )}
      >
        {fallback}
      </div>
    )
  }

  return <img src={src} alt={alt} className={cn('h-10 w-10 rounded-full object-cover', className)} {...props} />
}


