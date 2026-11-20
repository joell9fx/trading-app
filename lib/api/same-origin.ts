/**
 * Returns true when a state-changing request comes from this site.
 * Browsers send `Origin` on every cross-origin and same-origin POST from fetch,
 * and modern browsers also send `Sec-Fetch-Site`. A missing header is allowed
 * (non-browser clients), a mismatching one is not.
 */
export function isSameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false

  const origin = request.headers.get('origin')
  if (!origin) return true

  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return false
  }

  const requestHost =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host
  return originHost === requestHost
}
