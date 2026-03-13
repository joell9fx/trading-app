'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4 text-center border border-red-500/40 bg-red-500/10 rounded-2xl p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-red-300">Access Restricted</p>
        <h1 className="text-3xl font-bold text-white">Account Disabled</h1>
        <p className="text-sm text-muted-foreground">
          Your account has been restricted by VisionEdge administration. If you believe this is a mistake,
          please contact support to review your status.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/support">
            <Button variant="outline" className="border-border text-foreground/90 hover:border-red-400 hover:text-foreground">
              Contact Support
            </Button>
          </Link>
          <Link href="/signin">
            <Button className="bg-red-500 text-white hover:bg-red-600">Return to Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

