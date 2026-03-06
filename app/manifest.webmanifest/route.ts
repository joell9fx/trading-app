import { NextResponse } from 'next/server'
import getManifest from '@/app/manifest'

/** Serves manifest at /manifest.webmanifest. Required for production; Next.js manifest.ts is served at /manifest.json by default. */
export function GET() {
  const body = JSON.stringify(getManifest())
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
