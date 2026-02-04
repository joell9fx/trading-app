# Launch Readiness Audit Report

**Date:** 2026-02-04  
**Scope:** Auth flow, route protection, env vars, Supabase, console/silent failures, production-breaking code  
**Rules:** Audit only; no fixes or refactors applied.

---

## BLOCKER

Issues that will cause runtime errors or critical security flaws in production.

| # | Category | File(s):Line(s) | Finding |
|---|----------|-----------------|---------|
| 1 | **Route protection / production crash** | `middleware.ts:113` | **`normalizedRole` is used before it is defined.** It is only declared at line 128 inside `if (pathname.startsWith('/admin'))`. For `/superadmin` routes the code never enters that block, so `normalizedRole` is undefined and triggers a **ReferenceError**. Superadmin access control is broken and middleware will crash on superadmin requests. |
| 2 | **Open redirect** | `app/auth/callback/route.ts:8,39` | Redirect target is taken from query param `next` and passed to `new URL(next, requestUrl.origin)` without validation. If `next` is an absolute URL (e.g. `?next=https://evil.com`), the user is redirected off-site. Enables phishing. |

---

## HIGH

Issues that can cause incorrect behavior, data exposure, or production-only failures.

| # | Category | File(s):Line(s) | Finding |
|---|----------|-----------------|---------|
| 3 | **Auth flow** | `app/auth/callback/route.ts:34-38` | **`exchangeCodeForSession(code)` result is ignored.** On failure (expired/invalid code) the handler still redirects to `next` (default `/dashboard`). User can land on dashboard without a valid session; errors are silent. |
| 4 | **Env / config** | `components/dashboard/use-checkout.ts:7-8` | Code expects **`NEXT_PUBLIC_STRIPE_PUBLIC_KEY`**. `env.example` documents **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**. Name mismatch will leave Stripe client uninitialized in production if deploy uses the example. |
| 5 | **Env / config** | `app/api/checkout/session/route.ts:28-30` | Uses **`STRIPE_PRICE_SIGNALS`**, **`STRIPE_PRICE_MENTORSHIP`**, **`STRIPE_PRICE_AI_TOOLS`**. These are **not listed in `env.example`**. Missing in production will cause "Invalid product" (400) or misconfiguration. |
| 6 | **Env / config** | Multiple (see below) | **`NEXT_PUBLIC_SITE_URL`** and **`DOMAIN_URL`** are used for redirects, referral links, and API base URL but **not in `env.example`**. Example has `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` instead. Deployments may leave SITE_URL/DOMAIN_URL unset. Used in: `app/api/checkout/session/route.ts:8`, `app/api/checkout/route.ts:9`, `app/api/marketing/generate/route.ts:30`, `app/api/campaigns/generate/route.ts:28`, `app/api/admin/insights/route.ts:18`, `app/api/admin/forecast/route.ts:28`, `app/api/trades/log/route.ts:71`, `app/u/[username]/page.tsx:10`, `lib/referral-utils.ts:50`, `components/dashboard/referral-center.tsx:30`. |
| 7 | **Supabase / server** | `lib/supabase/server.ts:8-9`, `middleware.ts:70` | **Non-null assertion** on `NEXT_PUBLIC_SUPABASE_URL!` and `NEXT_PUBLIC_SUPABASE_ANON_KEY!` with no runtime check. If either is missing in production, server/client creation throws and can take down middleware or server-rendered pages. |
| 8 | **Exposed dev/test** | `app/test/page.tsx` (whole page) | **Public test page** at `/test` (not under `PROTECTED_PREFIXES`). Exposes "Trading App Test Page", community posts API, and direct DB checks. Should be disabled or protected in production. |
| 9 | **Exposed dev/test** | `app/api/test-supabase/route.ts` | **Public API** returns diagnostic payload including `supabaseUrl`, `projectRef`, `tableQueried`. Information disclosure and confirms Supabase config; should be removed or gated (e.g. `NODE_ENV !== 'production'`). |
| 10 | **Profile schema vs code** | `types/supabase.ts:12-45` vs middleware & API | **Generated `profiles` type** has no `role`, `is_owner`, `banned`, `has_ai_tools_access` (or `is_admin`). Middleware and many API routes select and use these columns. Types are out of date; runtime depends on DB having these columns or queries will fail. |

---

## MEDIUM

Issues that can cause subtle bugs, degraded UX, or inconsistent behavior.

| # | Category | File(s):Line(s) | Finding |
|---|----------|-----------------|---------|
| 11 | **Console / observability** | Multiple (see list) | **`console.error` / `console.warn`** used for error reporting in app code. In production these may be lost or noisy. Consider structured logging or Sentry. Files: `components/dashboard/dashboard-layout.tsx:135,148,161`, `components/dashboard/role-provider.tsx:107`, `app/api/admin/users/[userId]/role/route.ts:46,58`, `hooks/use-permissions.ts:77`, `components/dashboard/profile-section.tsx:99,127,132,164`, `components/dashboard/dashboard-overview.tsx:136`, `components/dashboard/signals-section.tsx` (multiple), `app/api/mentor/chat/route.ts:153`, `components/dashboard/ai-assistant.tsx:100`, `app/api/ai/chat/route.ts:107,132`, `components/dashboard/use-user-services.ts:45,59`, `components/providers.tsx:33,50,72`, `components/community-hub/community-hub.tsx:41`, `app/api/showcase/comment/route.ts:31,40,45`, `app/api/marketing/generate/route.ts:81,93`, `app/api/campaigns/generate/route.ts:74,102`, `app/api/community-hub/messages/route.ts:75,295`, `app/api/optimizer/run/route.ts:104`. |
| 12 | **Silent failure** | `app/api/showcase/create/route.ts:60-61` | **Empty `catch {}`** after `supabase.rpc('increment_xp', ...)`. XP increment failures are swallowed; user gets success response while XP may not be applied. |
| 13 | **Silent failure** | `app/api/checkout/webhook/route.ts:55-57` | **`catch` only logs** on profile/access_logs/XP update errors. Response is still 200, so Stripe may not retry; user can pay but not receive access. |
| 14 | **Env / config** | `app/api/notifications/email/route.ts:8`, `app/api/prop-firm/status/route.ts:10` | Use **`RESEND_FROM`** or **`RESEND_FROM_EMAIL`**. `env.example` has **`NEXT_PUBLIC_FROM_EMAIL`** only. Mismatch can cause missing or wrong sender in production. |
| 15 | **Auth / admin** | `app/api/admin/auth.ts:11,43-44` | Admin auth reads **`is_admin`** from profiles; `utils/auth.ts` **assertAdmin** uses **`role`** and **`is_owner`** only. If RLS or app logic relies on `is_admin` separately from `role`, behavior may diverge between middleware (role-only) and API (role + is_admin). |
| 16 | **OAuth redirect** | `components/auth/signin-form.tsx:28` | OAuth `redirectTo` is fixed to `${origin}/auth/callback` with no `next` (e.g. `redirectTo=/dashboard/upgrade`). After OAuth, callback uses default `next=/dashboard`, so post-OAuth redirect-to-intended-page is lost. |

---

## LOW

Minor or documentation/consistency issues.

| # | Category | File(s):Line(s) | Finding |
|---|----------|-----------------|---------|
| 17 | **Env / config** | `env.example` | **`NEXTAUTH_SECRET`** and **`NEXTAUTH_URL`** are present but app uses Supabase Auth, not NextAuth. Unused; remove or comment to avoid confusion. |
| 18 | **Duplicate auth callback** | `app/auth/callback/route.ts` vs `app/api/auth/callback/route.ts` | Two callback routes exist (App Router `auth/callback`, API `api/auth/callback`). Supabase OAuth typically points at one. Ensure redirect URLs in Supabase dashboard and client `redirectTo` use the same path to avoid confusion. |
| 19 | **Direct Supabase client** | Several pages (e.g. `app/dashboard/admin/page.tsx:9-11`, `app/dashboard/page.tsx:9-11`) | Pages create **`createServerClient`** from `@supabase/ssr` with raw env instead of `createClient()` from `lib/supabase/server`. Inconsistent pattern and duplicates non-null env usage; consider centralizing. |
| 20 | **Superadmin logs** | `app/superadmin/logs/page.tsx:7-10` | Queries **`admin_logs`**. If table or columns are missing in DB, page will throw. Ensure schema exists and matches. |
| 21 | **CSP in prod** | `middleware.ts:26` | `connect-src` allows `ws://localhost:4001 http://localhost:4001`. In production these are unnecessary; consider removing or gating on `isDev`. |

---

## Summary Checklist

- **BLOCKER:** 2 (middleware crash on superadmin, auth callback open redirect)
- **HIGH:** 8 (auth callback silent failure, env naming/gaps, Supabase non-null, test exposure, types vs DB)
- **MEDIUM:** 6 (console usage, silent RPC/webhook failures, env/Resend mismatch, admin role vs is_admin, OAuth next param, duplicate callback)
- **LOW:** 5 (NextAuth in example, duplicate callbacks, direct Supabase usage, admin_logs schema, CSP localhost)

---

## Recommended Order of Remediation

1. Fix **middleware.ts**: define `normalizedRole` (from `profile`) once, before the superadmin block (e.g. after loading profile), and use it in both superadmin and admin checks.
2. Fix **app/auth/callback/route.ts**: validate `next` (allow only relative paths or same-origin URL) before redirect; handle `exchangeCodeForSession` errors and redirect to signin or error page with message.
3. Align **env.example** with code: add `NEXT_PUBLIC_SITE_URL`, `DOMAIN_URL`, `STRIPE_PRICE_*`, `RESEND_FROM` / `RESEND_FROM_EMAIL`; fix Stripe key to one canonical name (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in code or example); remove or comment NEXTAUTH vars.
4. Gate or remove **/test** and **/api/test-supabase** in production.
5. Add runtime checks or centralize Supabase client creation so missing env returns a clear error instead of throwing.
6. Regenerate **types/supabase.ts** from current DB (or add missing columns to the type) so `profiles` matches actual usage.
7. Replace or supplement **console.error** with structured logging/Sentry where appropriate; handle **showcase create** RPC and **checkout webhook** errors so failures are visible and, for webhooks, return 5xx on DB failure so Stripe retries.
