# Post-redeploy verification (deployed /signin CSP and manifest)

After you **remove any CSP from Vercel project settings** and **redeploy**, run the script against your **actual** deployed URL to get the answers below.

## Run the script

```bash
BASE_URL=https://YOUR_ACTUAL_VERCEL_URL ./scripts/verify-deployed-headers.sh
```

Example:

```bash
BASE_URL=https://trading-app-abc123.vercel.app ./scripts/verify-deployed-headers.sh
```

Use your real Vercel deployment URL (e.g. from the Vercel dashboard or your production domain).

---

## What the script returns (and how to interpret)

### 1. Deployed /signin CSP header count

- **Section:** "Content-Security-Policy header count on /signin"
- **You want:** `Count: 1`
- **If Count ≥ 2:** Vercel (or the host) is still injecting an extra CSP. Remove it in **Vercel → Project → Settings → Security** (or Headers).

### 2. Exact deployed CSP value

- **Section:** "All CSP header value(s) on /signin"
- **You want:** One line containing both `script-src` and `style-src` (e.g. `script-src 'self' 'unsafe-inline' https://js.stripe.com` and `style-src 'self' 'unsafe-inline'`).
- **If you see only** `default-src 'self'` (no script-src/style-src): the host is still sending a minimal CSP; remove it in Vercel settings.

### 3. Whether Vercel is still injecting CSP

- **CSP count = 1** and that single value includes script-src and style-src → **No**, Vercel is not injecting a second CSP; the app (middleware) is the only source.
- **CSP count ≥ 2** or the single value is minimal → **Yes**, the host is still adding/overriding CSP; fix in Vercel project settings.

### 4. Whether the manifest issue is resolved

- **Section:** "/site.webmanifest response" and Summary line "/site.webmanifest"
- **You want:** Either **301/308** (redirect to /manifest.webmanifest) or **200** (manifest served). Summary should show **PASS (301)**, **PASS (308)**, or **PASS (200)**.
- **If 404:** Stale deploy or redirect not applied; redeploy from current branch and re-run the script.

---

## Summary checklist (from script output)

After running the script, the Summary section should show:

- `CSP count 1?           PASS`
- `CSP has script-src?    PASS`
- `CSP has style-src?     PASS`
- `/site.webmanifest:     PASS (200)` or `PASS (301)` or `PASS (308)`

If any line is FAIL, use the sections above to fix (Vercel settings or redeploy).
