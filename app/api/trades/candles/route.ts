import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const pair = req.nextUrl.searchParams.get('pair')
  const start = req.nextUrl.searchParams.get('start')
  const end = req.nextUrl.searchParams.get('end')

  if (!pair || !start || !end) {
    return NextResponse.json({ error: 'pair, start, end are required' }, { status: 400 })
  }

  try {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()

    const url = `https://api.binance.com/api/v3/klines?symbol=${pair.toUpperCase()}&interval=1m&startTime=${startTime}&endTime=${endTime}`
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 500 })
    }
    const raw = await response.json()

    const candles = raw.map((c: any) => ({
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

