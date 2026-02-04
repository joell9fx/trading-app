'use client';

interface DashboardHeaderProps {
  user: any;
  onSignOut: () => void;
  onMenuToggle: () => void;
  onNotificationsClick?: () => void;
  unreadCount?: number;
}

export default function DashboardHeader({ user, onSignOut, onMenuToggle, onNotificationsClick, unreadCount = 0 }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060910]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button and title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060910]"
              onClick={onMenuToggle}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Dashboard</p>
              <h1 className="text-lg font-semibold text-white">Trading Academy</h1>
            </div>
          </div>

          {/* Right side - User menu and notifications */}
          <div className="flex items-center gap-3">
            <button
              className="relative p-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:text-white hover:border-gold-400/60 hover:bg-gold-500/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060910]"
              onClick={onNotificationsClick}
              aria-label="View notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-black shadow">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center ring-2 ring-gold-500/30">
                <span className="text-black text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-white">
                  {user?.email || 'User'}
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {user?.user_metadata?.role || 'Member'}
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="ml-2 px-3 py-2 text-sm font-semibold text-gray-200 hover:text-black bg-white/10 hover:bg-gold-400 transition rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060910]"
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

