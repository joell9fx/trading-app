import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

type Status = 'Approved' | 'Rejected' | 'Pending'

const resendApiKey = process.env.RESEND_API_KEY
const resendFrom = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL
const resend = resendApiKey ? new Resend(resendApiKey) : null

function buildEmail(status: Status, notes?: string) {
  const subject =
    status === 'Approved'
      ? '✅ Your Funding Submission Was Approved!'
      : status === 'Rejected'
      ? '❌ Your Funding Submission Was Rejected'
      : 'Funding Submission Update'

  const description =
    status === 'Approved'
      ? 'Congratulations! Your evaluation was approved by VisionEdge Funding.'
      : status === 'Rejected'
      ? 'Unfortunately, your submission did not meet the criteria this time.'
      : 'Your funding submission status was updated.'

  const notesBlock = notes
    ? `<p><strong>Admin Notes:</strong> ${notes}</p>`
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h2>${subject}</h2>
      <p>${description}</p>
      ${notesBlock}
      <p>Log in to your dashboard for more details.</p>
    </div>
  `

  return { subject, html }
}

export async function POST(req: NextRequest) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Status update auth error:', authError)
      return NextResponse.json({ error: 'Unable to verify user session' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId, status, admin_notes }: { submissionId: string; status?: Status; admin_notes?: string } =
      await req.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
    }

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email, full_name, name')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('prop_firm_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !existing) {
      console.error('Fetch submission error:', fetchError)
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const updates: any = {}
    if (status) updates.status = status
    if (admin_notes !== undefined) updates.admin_notes = admin_notes

    const { data: updated, error: updateError } = await supabase
      .from('prop_firm_submissions')
      .update(updates)
      .eq('id', submissionId)
      .select()
      .single()

    if (updateError) {
      console.error('Update submission error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    let notificationInserted = null
    let emailResult: any = null

    if (status === 'Approved' || status === 'Rejected') {
      const title = status === 'Approved' ? '🎉 Funding Approved!' : '❌ Funding Application Rejected'
      const message =
        status === 'Approved'
          ? 'Your funding submission has been approved by VisionEdge Funding.'
          : `Your funding submission was rejected. ${admin_notes || 'Please contact support for more info.'}`

      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: existing.user_id,
            type: 'funding_update',
            title,
            message,
          },
        ])
        .select()
        .single()

      if (notificationError) {
        console.error('Insert notification error:', notificationError)
      } else {
        notificationInserted = notification
      }

      // Optional email
      if (resend && resendFrom) {
        const { subject, html } = buildEmail(status, admin_notes)
        const recipient = existing.email || profile?.email
        if (recipient) {
          try {
            emailResult = await resend.emails.send({
              from: resendFrom,
              to: recipient,
              subject,
              html,
            })
          } catch (emailError) {
            console.error('Resend email error:', emailError)
          }
        }
      }
    }

    return NextResponse.json({
      submission: updated,
      notification: notificationInserted,
      email: emailResult ? 'sent' : resend ? 'not_sent' : 'email_not_configured',
    })
  } catch (error) {
    console.error('Status update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

