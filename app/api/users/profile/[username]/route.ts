import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPublicProfile } from '@/lib/public-profile'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const profile = await getPublicProfile(createClient(), params.username)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not available' }, { status: 403 })
    }
    return NextResponse.json(profile)
  } catch (error) {
    console.error('[users/profile] load failed:', error)
    return NextResponse.json({ error: 'Profiles are temporarily unavailable' }, { status: 503 })
  }
}
