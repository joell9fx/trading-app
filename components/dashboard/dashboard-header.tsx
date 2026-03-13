'use client';

interface DashboardHeaderProps {
  user: unknown;
  onSignOut: () => void;
  onMenuToggle: () => void;
  onNotificationsClick?: () => void;
  onOpenCommandPalette?: () => void;
  unreadCount?: number;
}

export default function DashboardHeader({ user, onSignOut, onMenuToggle, onNotificationsClick, onOpenCommandPalette, unreadCount = 0 }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button and title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-panel transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={onMenuToggle}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
              <h1 className="text-base font-semibold text-foreground tracking-tight">Trading Desk</h1>
            </div>
          </div>

          {/* Right side - Command palette hint, notifications, user */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-panel text-muted-foreground hover:text-foreground hover:border-border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                title="Search sections (⌘K)"
              >
                <span>Search</span>
                <kbd className="px-1 py-0.5 rounded bg-elevated text-[10px]">⌘K</kbd>
              </button>
            )}
            <button
              className="relative p-2.5 rounded-xl border border-border bg-panel text-foreground/90 hover:text-foreground hover:border-primary/40 hover:bg-accent-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={onNotificationsClick}
              aria-label="View notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-panel px-3 py-2">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center ring-2 ring-primary/30">
                <span className="text-primary-foreground text-sm font-semibold">
                  {(user as { email?: string })?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-foreground">
                  {(user as { email?: string })?.email || 'User'}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {(user as { user_metadata?: { role?: string } })?.user_metadata?.role || 'Member'}
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="ml-2 px-3 py-2 text-sm font-semibold text-foreground/90 hover:text-primary-foreground bg-panel hover:bg-primary transition rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

