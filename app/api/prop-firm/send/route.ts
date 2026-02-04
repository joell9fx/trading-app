import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Prop firm submission auth error:', authError)
      return NextResponse.json({ error: 'Unable to verify user session' }, { status: 401 })
    }

    const user = authData?.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { full_name, account_id, platform, email, user_id } = await req.json()

    if (!full_name || !account_id || !platform || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (user_id && user_id !== user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('prop_firm_submissions')
      .insert([{
        user_id: user.id,
        full_name,
        account_id,
        platform,
        email
      }])
      .select()

    if (error) {
      console.error('Prop firm submission insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Submission successful', data })
  } catch (error) {
    console.error('Prop firm submission API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

