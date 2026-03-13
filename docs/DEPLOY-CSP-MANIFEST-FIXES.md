# Deploy CSP and manifest fixes to production

## Why production is still broken

The **fixed** code (middleware full CSP, next.config without CSP, manifest route, layout link) exists only **locally**:

- **middleware.ts** – modified (full CSP), not committed
- **next.config.js** – modified (no CSP in headers), not committed  
- **app/layout.tsx** – modified (manifest link), not committed
- **app/manifest.webmanifest/** – **untracked** (route handler), never committed

Production deploys from **origin/main**. The latest commit there is `f0dcf97 fix: allow Stripe in CSP`, which still has the old stripped CSP and no manifest route. So production is serving the correct **deployed** build; that build is just the old one.

---

## Steps to fix production

### 1. Commit and push the fixes

```bash
# Stage CSP/manifest fixes
git add middleware.ts next.config.js app/layout.tsx app/manifest.ts app/manifest.webmanifest/

# Commit
git commit -m "fix: single CSP in middleware, add manifest route, remove next.config CSP"

# Push to the branch Vercel deploys (usually main)
git push origin main
```

Vercel will build and deploy from the new commit. If you use a different production branch, push there instead.

### 2. Remove Vercel Content-Security-Policy override (if any)

1. Vercel Dashboard → your project (**trading-app-five-gold**)
2. **Settings** → **Security** (or **Headers** / **Security Headers**)
3. If there is a **Content-Security-Policy** (or “Security Headers”) entry, **remove** it
4. Save

### 3. Redeploy (if needed)

If you don’t use auto-deploy on push: **Deployments** → **Redeploy** latest, or push an empty commit to trigger a build.

### 4. Verify

After the new deployment is live:

```bash
BASE_URL=https://trading-app-five-gold.vercel.app ./scripts/verify-deployed-headers.sh
```

Expect:

- **CSP count 1** – PASS  
- **CSP has script-src** – PASS  
- **CSP has style-src** – PASS  
- **/site.webmanifest** – PASS (301/308 or 200)  
- **/manifest.webmanifest** – 200, `Content-Type: application/manifest+json`

---

## Current live results (before push)

| Check | Result |
|-------|--------|
| /signin CSP count | 1 |
| CSP value | `default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com; frame-ancestors 'none';` |
| script-src | Missing (FAIL) |
| style-src | Missing (FAIL) |
| /manifest.webmanifest | 404 |
| /site.webmanifest | 404 |

These will change only after the fixes are **committed, pushed, and deployed**.
