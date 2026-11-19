import { NextResponse } from 'next/server'

/**
 * Small in-memory sliding-window rate limiter.
 *
 * Best effort only: each server instance keeps its own counters, so on a
 * serverless host the real limit is per warm instance. It still stops a single
 * client hammering the OpenAI-backed routes. Swap for a shared store (Redis /
 * Upstash) if stricter limits are needed; that is a new paid service.
 */
type Bucket = number[]

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 10_000

export interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** Milliseconds until the next request would be allowed (0 when allowed). */
  retryAfterMs: number
}

export function checkRateLimit(key: string, { limit, windowMs }: RateLimitOptions, now = Date.now()): RateLimitResult {
  const windowStart = now - windowMs
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart)

  if (hits.length >= limit) {
    buckets.set(key, hits)
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, hits[0] + windowMs - now) }
  }

  hits.push(now)
  buckets.delete(key) // re-insert so Map order tracks recency
  buckets.set(key, hits)

  if (buckets.size > MAX_KEYS) {
    const oldest = buckets.keys().next().value
    if (oldest !== undefined) buckets.delete(oldest)
  }

  return { allowed: true, remaining: limit - hits.length, retryAfterMs: 0 }
}

/** Default budget for routes that call OpenAI: 20 requests per user per 10 minutes. */
export const AI_RATE_LIMIT: RateLimitOptions = { limit: 20, windowMs: 10 * 60 * 1000 }

/**
 * Returns a 429 response when `key` is over its limit, otherwise null.
 * Use the user id as the key for signed-in routes.
 */
export function rateLimitResponse(key: string, options: RateLimitOptions = AI_RATE_LIMIT): NextResponse | null {
  const result = checkRateLimit(key, options)
  if (result.allowed) return null
  const retryAfter = Math.ceil(result.retryAfterMs / 1000)
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment and try again.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}

/** Test helper. */
export function __resetRateLimits() {
  buckets.clear()
}
