import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resendApiKey = process.env.RESEND_API_KEY
const resendFrom = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!resend || !resendFrom) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 400 })
    }

    const { to, status, notes, title, message } = await req.json()

    if (!to || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const subject =
      status === 'Approved'
        ? '✅ Your Funding Submission Was Approved!'
        : status === 'Rejected'
        ? '❌ Your Funding Submission Was Rejected'
        : title || 'Funding Submission Update'

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
        <h2>${subject}</h2>
        <p>${
          message ||
          (status === 'Approved'
            ? 'Congratulations! Your evaluation was approved by VisionEdge Funding.'
            : 'Your funding submission was updated.')
        }</p>
        ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
        <p>Log in to your dashboard for more details.</p>
      </div>
    `

    const result = await resend.emails.send({
      from: resendFrom,
      to,
      subject,
      html,
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Email notification API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

