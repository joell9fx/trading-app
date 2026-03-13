# Production CSP and manifest 404 – root cause and fix

## What you see in production

- **/signin** returns **exactly one** CSP header, but it is the **stripped** policy:
  - `default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com; frame-ancestors 'none';`
- **Missing:** `script-src`, `style-src`, and the rest of the full policy from `middleware.ts`.
- **/manifest.webmanifest** and **/site.webmanifest** both return **404**.

---

## 1. Why the live CSP is stripped down

That exact stripped string is the **old `next.config.js` CSP** (the one that was removed in this repo). So in production either:

- The **deployed branch** still has an older `next.config.js` where `headers()` sets `Content-Security-Policy` to that value, or  
- **Vercel** (or another host) is configured to send that same header (e.g. copied from the old config).

When both middleware and `next.config.js` (or the platform) set the same header name, **the last value wins**. So:

- If the **deployed** `next.config.js` still has that CSP in `headers()`, it runs **after** (or in addition to) middleware and **replaces** the full middleware CSP with the minimal one.
- If middleware does **not** run for that request (e.g. wrong matcher or runtime issue), then only the config/platform CSP is sent.

So the stripped-down CSP is **not** coming from the current `middleware.ts` (which sets the full policy). It is coming from either:

1. **Old `next.config.js`** in the deployed build (most likely), or  
2. **Vercel (or host) Security/Headers** configuration.

---

## 2. Is middleware running in production?

We can’t see your production logs, but we can infer:

- The response has **one** CSP and it’s the **minimal** one, not the full one from `middleware.ts`.
- So either:
  - Middleware **does** run and sets the full CSP, but **next.config (or platform) overwrites** it with the stripped one, or  
  - Middleware **does not** run for that request, and only the config/platform CSP is sent.

So in production, **either** middleware isn’t applying **or** its CSP is being overwritten. The **matcher** in this repo does include `/signin`:

- Matcher: `'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)).*)'`
- `/signin` does **not** match the negative lookahead, so it **is** matched and middleware should run for it.

So the main problem is almost certainly **another source** (old `next.config` or Vercel) sending the stripped CSP, not the matcher excluding `/signin`.

---

## 3. Is Vercel overriding CSP?

- If **Vercel** (Project → Settings → Security / Headers) has a **Content-Security-Policy** (or “Security Headers”) set to that same minimal value, it will override or replace the one from your app.
- The exact string matches the **old repo** `next.config.js` CSP, so the most likely source is **deployed app code** (old config), not a generic Vercel default. But if you once copied that policy into Vercel, it would have the same effect.

So: **Either** the deployed `next.config.js` **or** Vercel Security/Headers is the source of the stripped CSP.

---

## 4. Why manifest routes 404 in production

- The app **layout** links to **`/manifest.webmanifest`**.
- There was **no** route handler for **`/manifest.webmanifest`** in the repo: no `app/manifest.webmanifest/route.ts`. So in production that path has no handler and returns **404**.
- **`app/manifest.ts`** is a Next.js metadata convention; Next.js typically serves it at **`/manifest.json`**, not `/manifest.webmanifest`. So it does **not** fix a request to `/manifest.webmanifest`.
- The **redirect** in `next.config.js` sends **`/site.webmanifest`** → **`/manifest.webmanifest`**. If `/manifest.webmanifest` 404s, the redirect just sends users to a URL that also 404s. So **both** look broken (redirect “works” but target is 404).

**Root cause of manifest 404:** There was no route that serves the manifest at **`/manifest.webmanifest`**. The redirect and layout both point there, but no handler existed.

---

## 5. Why the /site.webmanifest redirect “doesn’t work” in production

- The redirect **is** in `next.config.js`: `source: '/site.webmanifest'`, `destination: '/manifest.webmanifest'`.
- So in production, **/site.webmanifest** should respond with **301/308** to **/manifest.webmanifest**.
- If **/manifest.webmanifest** returns **404**, then after the redirect the browser loads a page that 404s. So the redirect is “live” but the **destination** is broken. Fixing the destination (see below) fixes both:
  - **/manifest.webmanifest** → 200 with manifest.
  - **/site.webmanifest** → 301/308 → **/manifest.webmanifest** → 200.

---

## 6. Exact file or setting causing each issue

| Issue | Cause |
|-------|--------|
| **Stripped CSP on /signin** | **Deployed** `next.config.js` still has `headers()` with `Content-Security-Policy` set to the minimal string **and/or** Vercel Project → Settings → Security/Headers has that CSP. |
| **Middleware CSP not visible** | Same header set again by config or platform **overwrites** middleware’s value (last writer wins). |
| **/manifest.webmanifest 404** | No handler for that path. **Repo had no** `app/manifest.webmanifest/route.ts` (only `app/manifest.ts`, which is served at `/manifest.json`). |
| **/site.webmanifest 404** | Redirect goes to `/manifest.webmanifest`, which 404s. So the redirect is effectively “to a 404” until the manifest route exists. |

---

## 7. Exact fix needed

### A. Stripped CSP (and making middleware’s CSP effective)

1. **Deployed code**  
   Ensure the **deployed** branch has the **current** `next.config.js` **with no** `Content-Security-Policy` in `headers()`. In this repo that’s already the case (only a comment). So:
   - Confirm the branch you deploy (e.g. `main`) has **no** `headers()` block that sets CSP (or remove it if it’s still there), then **redeploy**.

2. **Vercel**  
   In Vercel Dashboard → your project → **Settings** → **Security** (or **Headers**). If there is any **Content-Security-Policy** or “Security Headers” entry, **remove** it so only the app (middleware) sets CSP.

3. **Redeploy**  
   After the above, redeploy and hard-refresh (or incognito). You should then see **one** CSP header on `/signin` with the **full** policy from `middleware.ts` (including `script-src` and `style-src`).

### B. Manifest 404

1. **Route added in repo**  
   **`app/manifest.webmanifest/route.ts`** has been added. It imports the manifest from `app/manifest.ts` and serves it at **`/manifest.webmanifest`** with `Content-Type: application/manifest+json`.

2. **Deploy**  
   Deploy the branch that includes this new file. Then:
   - **/manifest.webmanifest** → **200** with the manifest JSON.
   - **/site.webmanifest** → **301/308** to **/manifest.webmanifest** → **200**.

No change is required to the redirect or layout; they already point to `/manifest.webmanifest`. The missing piece was the route handler.

---

## 8. Checklist after deploy

1. Redeploy from the branch that has:
   - `next.config.js` **without** any CSP in `headers()`
   - **`app/manifest.webmanifest/route.ts`**
2. In Vercel, remove any CSP from Security/Headers.
3. Run:  
   `BASE_URL=https://YOUR_VERCEL_URL ./scripts/verify-deployed-headers.sh`
4. Confirm:
   - One CSP header on **/signin** and it contains **script-src** and **style-src**.
   - **/manifest.webmanifest** returns **200** and **application/manifest+json**.
   - **/site.webmanifest** returns **301** or **308** to **/manifest.webmanifest**.
