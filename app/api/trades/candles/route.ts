import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

/** Binance returns at most 1000 one-minute candles per request. */
const MAX_RANGE_MS = 1000 * 60 * 1000

const QuerySchema = z
  .object({
    pair: z
      .string()
      .trim()
      .transform((s) => s.toUpperCase())
      .pipe(z.string().regex(/^[A-Z0-9]{5,12}$/, 'Invalid pair')),
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((q) => !Number.isNaN(q.start.getTime()) && !Number.isNaN(q.end.getTime()), 'Invalid dates')
  .refine((q) => q.end.getTime() > q.start.getTime(), 'end must be after start')
  .refine((q) => q.end.getTime() - q.start.getTime() <= MAX_RANGE_MS, 'Range too large (max 1000 minutes)')

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const parsed = QuerySchema.safeParse({
    pair: sp.get('pair') ?? '',
    start: sp.get('start') ?? '',
    end: sp.get('end') ?? '',
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'pair, start, end are required' },
      { status: 400 },
    )
  }
  const { pair, start, end } = parsed.data

  try {
    const url = new URL('https://api.binance.com/api/v3/klines')
    url.searchParams.set('symbol', pair)
    url.searchParams.set('interval', '1m')
    url.searchParams.set('startTime', String(start.getTime()))
    url.searchParams.set('endTime', String(end.getTime()))

    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 502 })
    }
    const raw: unknown = await response.json()
    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: 'Unexpected response from data provider' }, { status: 502 })
    }

    const candles = raw.map((c: any[]) => ({
      time: new Date(c[0]).toISOString(),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
    }))

    return NextResponse.json({ candles })
  } catch (error) {
    console.error('Candles error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
