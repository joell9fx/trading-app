import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: campaignsData, error } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('campaigns fetch failed', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaigns: campaignsData ?? [] });
  } catch (e) {
    console.error('campaigns failed', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

