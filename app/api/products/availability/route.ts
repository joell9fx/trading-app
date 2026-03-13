import { NextResponse } from 'next/server'
import { SERVICE_PRODUCTS } from '@/lib/service-products'

const PAID_KEYS = ['signals', 'gold_to_glory', 'elite_membership', 'vip_membership'] as const

export async function GET() {
  const availability: Record<string, boolean> = {}
  for (const key of PAID_KEYS) {
    const price = SERVICE_PRODUCTS[key]
    availability[key] = Boolean(typeof price === 'string' && price.trim().length > 0)
  }
  return NextResponse.json({ availability })
}
