'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createSupabaseClient } from '@/lib/supabase/client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)

  useEffect(() => {
    // Only create Supabase client if environment variables are available
    try {
      const client = createSupabaseClient() as SupabaseClient<Database>
      setSupabase(client)
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, session }),
        })
      } catch (err) {
        console.error('Auth sync failed:', err)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Ensure initial session is synced to server (middleware) on first load/refresh
  useEffect(() => {
    if (!supabase) return

    const syncInitialSession = async () => {
      const { data } = await supabase.auth.getSession()
      try {
        await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'INITIAL_SESSION', session: data.session }),
        })
      } catch (err) {
        console.error('Initial auth sync failed:', err)
      }
    }

    syncInitialSession()
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </QueryProvider>
  )
}
