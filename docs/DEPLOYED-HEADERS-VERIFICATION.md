# Deployed headers verification

Use this to confirm whether the “default-src only” CSP and manifest 404 are fixed on the **deployed** app.

## Run against your deployed URL

```bash
# Replace with your actual deployment URL (e.g. from Vercel)
BASE_URL=https://your-app.vercel.app ./scripts/verify-deployed-headers.sh
```

Or:

```bash
./scripts/verify-deployed-headers.sh https://your-app.vercel.app
```

## What to check

### 1. CSP on `/signin`

- **Count:** Script prints “Content-Security-Policy header count”. If **Count: 2** (or more), you have **duplicate CSP headers** (e.g. one from app, one from Vercel).
- **Value:** The printed CSP line(s) should include both `script-src` and `style-src` (e.g. `script-src 'self' 'unsafe-inline' ...` and `style-src 'self' 'unsafe-inline'`). If you see only something like `default-src 'self'` (with no script-src or style-src), that is the “bad” policy.

### 2. Where the bad CSP comes from

- **One CSP header that is full (has script-src and style-src):** Repo/middleware is correct; if the browser still reports fallback to default-src, check cache or another layer (CDN, proxy).
- **Two (or more) CSP headers:** The browser enforces **all** of them. If one is minimal (`default-src 'self'`), the effective policy is restrictive. The minimal one is almost certainly from **Vercel** (or another host) Security/Headers, not from this repo.

### 3. `/site.webmanifest`

- **301/308** with `location: .../manifest.webmanifest`: Redirect is active; no 404 for the old path.
- **200** with `content-type: application/manifest+json`: Either the redirect isn’t applied (e.g. static file served first) or the request hit `/manifest.webmanifest`; both are fine.

## Exact fix when the bad CSP is from Vercel

1. Open **Vercel Dashboard** → your project → **Settings** → **Security** (or **Headers** / **Security Headers**).
2. Find any **Content-Security-Policy** (or “Security Headers”) configuration.
3. Either:
   - **Remove** the CSP from Vercel so only the app (middleware) sets CSP, or
   - Replace it with the **full** policy (same as in `middleware.ts`) so there is a single, correct CSP.
4. Redeploy or wait for cache to expire; then re-run the script and check the browser again.

## Repo state (no changes needed if host is the cause)

- **CSP:** Set only in `middleware.ts` (full policy with script-src and style-src).
- **Manifest:** Layout links to `/manifest.webmanifest`; `next.config.js` redirects `/site.webmanifest` → `/manifest.webmanifest`.
- No duplicate CSP or manifest link is defined in the repo; any duplicate or minimal CSP on the live site is from the **host (e.g. Vercel)** or **cache**.
