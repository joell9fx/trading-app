// Legacy checkout endpoint replaced by /api/checkout. Respond with 410.
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json({ error: 'Legacy checkout route. Use /api/checkout instead.' }, { status: 410 })
}

