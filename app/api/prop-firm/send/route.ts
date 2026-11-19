import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseBody, idSchema } from '@/lib/api/parse-body'

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

    const body = await parseBody(
      req,
      z.object({
        full_name: z.string().trim().min(1).max(120),
        account_id: z.string().trim().min(1).max(64),
        platform: z.string().trim().min(1).max(64),
        email: z.string().trim().email().max(254),
        user_id: z.string().optional(),
      }),
    )
    if (body.error) return body.error
    const { full_name, account_id, platform, email, user_id } = body.data

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

