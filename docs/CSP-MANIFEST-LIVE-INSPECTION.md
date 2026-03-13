# Live inspection: /signin CSP and manifest (actual response)

This report is from **inspecting the running app** (response headers and HTML), not just the repo.

---

## 1. Environment inspected

- **URL:** `http://127.0.0.1:3000/signin` (local running app; no deployed URL available in repo).
- **Time:** Response fetched with `curl -sI` and `curl -s` for HTML.

---

## 2. Exact CSP header(s) seen on /signin

**Count:** **1** (one) `Content-Security-Policy` header.

**Full value returned by the app:**

```
content-security-policy: default-src 'self'; base-uri 'self'; form-action 'self' https://*.supabase.co; frame-ancestors 'none'; object-src 'none'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com https://api.stripe.com https://*.vercel-insights.com blob:; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; frame-src https://js.stripe.com https://hooks.stripe.com
```

So in the inspected environment the app sends a **single, full** CSP including explicit `script-src` and `style-src`. There is no “default-src only” CSP from the app.

---

## 3. Duplicate CSP headers?

**In the inspected run:** **No.** Only one CSP header was present.

If in **your** environment (e.g. production) you see **two** CSP headers, the second one is not from this app; it is from the **host** (e.g. Vercel Security/Headers).

---

## 4. Host/platform injecting CSP?

- **In the repo:** CSP is set only in `middleware.ts`. No CSP in `next.config.js`, no `vercel.json`, no meta tags.
- **On the inspected run (localhost):** Only the middleware CSP was present.

If the **deployed** site (e.g. on Vercel) still behaves like “default-src 'self' only”, that implies either:

1. **Vercel (or another host) is adding a second CSP** (e.g. in Project Settings → Security / Headers), and the browser applies both, so the effective policy is the stricter one, or  
2. **A cached response** (browser or CDN) is serving an old CSP.

So: the **bad CSP is external to the repo** (host-level or cache).

---

## 5. Does the HTML still reference /site.webmanifest?

**In the inspected response:** **No.** The served HTML contained:

- `<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials"/>`
- `<link rel="manifest" href="/manifest.webmanifest"/>`

There was **no** `href="/site.webmanifest"` in the document.

So in the running build that was inspected, the HTML is correct. If **your** browser still requests `/site.webmanifest`, then either:

1. The **deployed build is stale** (old HTML with `/site.webmanifest`), or  
2. **Cache** (browser/CDN) is serving old HTML.

---

## 6. Is the /site.webmanifest redirect live?

**In the inspected run:** Requesting `http://127.0.0.1:3000/site.webmanifest` returned **200 OK** with `Content-Type: application/manifest+json` (static file from `public/site.webmanifest`). So locally the redirect was not used because the static file is served first.

On **Vercel**, `next.config.js` redirects `/site.webmanifest` → `/manifest.webmanifest`. That only runs for the deployed build. If `public/site.webmanifest` is not deployed (e.g. ignored), then `/site.webmanifest` would hit the redirect. If you still get **404** on the deployed site, the deploy may be from before the redirect was added, or the redirect is not applied for that request.

---

## 7. Is the running build stale?

- **Locally:** The running app matched the current repo (one full CSP, manifest link to `/manifest.webmanifest`).
- **Deployed:** Cannot be verified without the production URL. If production shows broken CSP or `/site.webmanifest` in HTML or 404, the **deployed** build or **host/cache** is stale or adding headers.

---

## 8. Exact source of the bad CSP (when you see it)

| Where you see it | Likely source |
|------------------|----------------|
| **Production only** | **Host-level:** Vercel (or other host) Security/Headers adding a second CSP (e.g. `default-src 'self'` only). Remove or relax that CSP in the host dashboard so only the app (middleware) sets CSP. |
| **Production + hard refresh still broken** | Same as above; ensure the header is removed/updated in project settings and redeploy if needed. |
| **After clearing cache** | If it fixes itself, the cause was **cache-level** (old response with old CSP). |

The app code is **not** the source of the “default-src only” behavior; the source is **external** (host or cache).

---

## 9. Exact source of the /site.webmanifest request (when you see it)

| Observation | Likely source |
|-------------|----------------|
| HTML contains `href="/site.webmanifest"` | **Stale deploy:** Deployed from an old commit (before layout was changed to `/manifest.webmanifest`). Redeploy from current main. |
| HTML has `href="/manifest.webmanifest"` but browser still requests `/site.webmanifest` | **Cache:** Cached HTML or service worker. Hard refresh, clear site data, or test in incognito. |
| `/site.webmanifest` returns 404 on production | Redirect may not be in the deployed build, or static file is missing and redirect not applied. Redeploy and ensure `next.config.js` redirect is in the build. |

---

## 10. Exact fix needed

**For broken CSP on /signin (effective “default-src 'self' only”):**

1. Open **Vercel Dashboard** → your project → **Settings** → **Security** (or **Headers** / **Security Headers**).
2. Find any **Content-Security-Policy** (or “Security Headers”) configuration.
3. **Remove** the CSP entry entirely so only the app (middleware) sets CSP, then save.
4. **Redeploy** (or wait for cache to expire).
5. Hard refresh or use an incognito window and re-check `/signin`; in DevTools → Network → document request, confirm there is only **one** CSP header and it includes `script-src` and `style-src`.

**For /site.webmanifest 404 and old manifest link:**

1. **Redeploy** from the current branch so the build includes (a) layout with `href="/manifest.webmanifest"` and (b) the redirect in `next.config.js`.
2. **Clear cache** (browser and, if applicable, Vercel/CDN) so clients get the new HTML and the redirect is used if needed.
3. In production, open **View Page Source** for `/signin` and confirm there is no `href="/site.webmanifest"`; if there is, the deploy is still stale.

No code changes are required in the repo for CSP or manifest link; fixes are **host/config** (remove Vercel CSP) and **deploy/cache** (latest build + cache clear).
