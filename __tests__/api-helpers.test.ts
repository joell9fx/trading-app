/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { z } from 'zod'
import { checkRateLimit, rateLimitResponse, __resetRateLimits } from '@/lib/api/rate-limit'
import { parseBody, idSchema } from '@/lib/api/parse-body'
import { isSameOriginRequest } from '@/lib/api/same-origin'
import { serverError } from '@/lib/api/errors'

const jsonRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost:3000/api/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('checkRateLimit', () => {
  beforeEach(() => __resetRateLimits())

  it('allows up to the limit, then blocks', () => {
    const opts = { limit: 3, windowMs: 1000 }
    expect(checkRateLimit('k', opts, 0).allowed).toBe(true)
    expect(checkRateLimit('k', opts, 1).allowed).toBe(true)
    expect(checkRateLimit('k', opts, 2).remaining).toBe(0)
    const blocked = checkRateLimit('k', opts, 3)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBe(997)
  })

  it('frees capacity once the window slides past old hits', () => {
    const opts = { limit: 1, windowMs: 1000 }
    expect(checkRateLimit('k', opts, 0).allowed).toBe(true)
    expect(checkRateLimit('k', opts, 999).allowed).toBe(false)
    expect(checkRateLimit('k', opts, 1001).allowed).toBe(true)
  })

  it('keeps keys independent', () => {
    const opts = { limit: 1, windowMs: 1000 }
    expect(checkRateLimit('a', opts, 0).allowed).toBe(true)
    expect(checkRateLimit('b', opts, 0).allowed).toBe(true)
  })

  it('returns a 429 with Retry-After when over the limit', () => {
    const opts = { limit: 1, windowMs: 60_000 }
    expect(rateLimitResponse('u', opts)).toBeNull()
    const res = rateLimitResponse('u', opts)
    expect(res?.status).toBe(429)
    expect(Number(res?.headers.get('Retry-After'))).toBeGreaterThan(0)
  })
})

describe('parseBody', () => {
  const schema = z.object({ id: idSchema, note: z.string().max(5) })

  it('returns parsed data for a valid body', async () => {
    const out = await parseBody(jsonRequest({ id: 42, note: 'hi' }), schema)
    expect(out.data).toEqual({ id: '42', note: 'hi' })
  })

  it('returns 400 for invalid JSON', async () => {
    const out = await parseBody(jsonRequest('{not json'), schema)
    expect(out.error?.status).toBe(400)
  })

  it('returns 400 naming the bad field', async () => {
    const out = await parseBody(jsonRequest({ id: 'x', note: 'too long' }), schema)
    expect(out.error?.status).toBe(400)
    const body = await out.error!.json()
    expect(body.error).toContain('note')
  })

  it('rejects an empty id', async () => {
    const out = await parseBody(jsonRequest({ id: '  ', note: '' }), schema)
    expect(out.error?.status).toBe(400)
  })
})

describe('isSameOriginRequest', () => {
  const req = (headers: Record<string, string>) =>
    new Request('http://localhost:3000/api/auth/callback', { method: 'POST', headers })

  it('allows a matching Origin', () => {
    expect(isSameOriginRequest(req({ origin: 'http://localhost:3000', host: 'localhost:3000' }))).toBe(true)
  })

  it('rejects a different Origin', () => {
    expect(isSameOriginRequest(req({ origin: 'https://evil.example', host: 'localhost:3000' }))).toBe(false)
  })

  it('rejects cross-site Sec-Fetch-Site', () => {
    expect(isSameOriginRequest(req({ 'sec-fetch-site': 'cross-site', host: 'localhost:3000' }))).toBe(false)
  })

  it('allows requests with no Origin (non-browser clients)', () => {
    expect(isSameOriginRequest(req({ host: 'localhost:3000' }))).toBe(true)
  })

  it('rejects a malformed Origin', () => {
    expect(isSameOriginRequest(req({ origin: 'not a url', host: 'localhost:3000' }))).toBe(false)
  })
})

describe('serverError', () => {
  it('logs the real error but returns a generic message', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {})
    const res = serverError({ message: 'relation "public.secret_table" does not exist' }, 'ctx', 400)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(JSON.stringify(body)).not.toContain('secret_table')
    expect(log).toHaveBeenCalledWith('[ctx]', expect.anything())
    log.mockRestore()
  })

  it('defaults to 500 and allows a custom message', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {})
    const res = serverError(new Error('boom'), 'ctx', undefined, 'Failed to load channels')
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Failed to load channels' })
    log.mockRestore()
  })
})
