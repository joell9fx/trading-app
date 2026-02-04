import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export async function GET() {
  try {
    // 1) Basic environment sanity check
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        connected: false,
        error: 'Missing SUPABASE env variables',
      })
    }

    if (!supabase) {
      return NextResponse.json({
        connected: false,
        error: 'Supabase client not initialized',
      })
    }

    // 2) Ping the database (use profiles since it exists in this project)
    const { data, error } = await supabase.from('profiles').select('id').limit(1)

    // 3) Extract project ref from URL (for clarity)
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown'

    // 4) Return structured diagnostic
    return NextResponse.json({
      connected: !error,
      projectRef,
      tableQueried: 'profiles',
      rowCount: data?.length ?? 0,
      supabaseUrl,
      error: error?.message ?? null,
    })
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err?.message || 'Unexpected error',
    })
  }
}
