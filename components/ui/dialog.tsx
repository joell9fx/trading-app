'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type DialogProps = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  const handleClose = () => onOpenChange?.(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative z-50 w-full max-w-xl rounded-2xl border border-gold-500/40 bg-neutral-900 p-4 shadow-2xl shadow-black/40',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}


