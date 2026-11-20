# PROGRESS

> Living status doc. A fresh session should be able to resume from this file alone.
> Last updated: 2026-11-20 · Branch: `claude/local-host-setup-54ce2b` (PR joell9fx/trading-app#1, open, not merged)

## What this project is
**Trading Academy**: a Next.js 14 (App Router) + Supabase + Stripe + OpenAI membership platform for retail traders.
- **Paid tiers:** Signals, Gold to Glory, Elite and VIP.
- **Member dashboard:** about 30 sections (journal, trade replay, AI mentor, community hub, leaderboards and XP, wallet, referrals and affiliates).
- **Back office:** admin and superadmin consoles.

## Environment status
| Item | State |
|---|---|
| Supabase project `trading-app` (`cffqnrxnavlknrijuurj`) | **Paused (INACTIVE).** No logins, no live DB checks, no type regeneration until the owner restores it. |
| Vercel | **Account blocked.** Preview deploys fail ("Account is blocked"). Must be fixed in the Vercel dashboard. |
| Local `.env.local` | Supabase keys only. No Stripe, OpenAI or Resend keys. |
| Migration test DB | Local Docker image `public.ecr.aws/supabase/postgres:17.6.1.159` is available. See `supabase/tests/README.md`. |

## Health check (2026-11-20, after batch 7)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ pass (if you get TS6053 errors for `.next/types`, run `rm -rf .next/types`) |
| `npx next lint` | ✅ 0 errors, 0 warnings. `rules-of-hooks` is enforced again. |
| `npm test` | ✅ 56/56 (`auth-helpers`, `api-helpers`, `catalog-and-access`) |
| `npx next build` | ✅ 100 pages |
| Prod smoke test (`next start`) | ✅ Dev routes 404; protected API routes 401 without a session; bad candles input 400; cross-origin auth sync 403; `/support` 200 |
| `supabase/tests/046_rls_test.sql` | ✅ 24/24 on a throwaway Supabase Postgres; 046 applies twice cleanly |

## Current state map
**Legend:** ✅ done · 🟡 partial · 🔴 broken · ⚪ stub · 🧪 dev-only · 🔁 duplicate or redirect

### Public pages
| Route | Status | Notes |
|---|---|---|
| `/` `/about` `/courses` `/signals` `/mentoring` `/funding-account` `/funding-service` | ✅ | Marketing. Stats, testimonials and course numbers are invented (owner decision). |
| `/pricing` | ✅ | Stripe checkout. Tiers show "Coming Soon" until `STRIPE_PRICE_*` is set. |
| `/prices` → `/pricing`, `/contact` → `/support`, `/learn` → `/courses`, `/login` → `/signin` | 🔁 | |
| `/support` | ✅ | Uses `NEXT_PUBLIC_SUPPORT_EMAIL`, falling back to the Community Hub |
| `/signin` `/signup` `/forgot-password` `/reset-password` | ✅ | Signup relies on the `handle_new_user` trigger; referrals go through `/api/referral-track` |
| `/community-hub` | ✅ | Members only |
| `/leaderboard`, `/u/[username]` | ✅ | Public profile no longer exposes the mentor journal; 404 via `notFound()` |
| `/auto-trader` | ⚪ | Deliberately "coming soon" |
| `/privacy` `/terms` `/cookies` | ⚪ | Placeholder. **Owner must supply legal copy.** |
| `/test` `/preview` `/local-preview` | 🧪 | 404 in production |

### Member dashboard (`/dashboard?section=…`)
| Section | Status | Notes |
|---|---|---|
| overview, signals, ai, funding, courses, notifications, wallet, leaderboard, learning-path, mentor, journal, timeline, affiliate, marketing, campaigns, analytics, reports, ai-coach, consistency, performance, terminal, optimizer | ✅ | Real data. `journal_entries` is created by migration 046 (not yet applied). |
| profile | ✅ | Real stats (lessons, courses, posts, sessions) |
| community-hub | ✅ | Demo-channel fallback when a fetch fails |
| mentorship | 🟡 | Booking modal says "coming soon" |
| gold-to-glory | 🟡 | Hardcoded `SAMPLE_*` data, now labelled "Sample data" |
| news | 🟡 | Placeholder feed, labelled "Sample data" |
| admin (hub) | 🟡 | Mock data, labelled; toggles don't save |
| elite-membership, vip-membership | ⚪ | Static text |
| mission | 🟡 | Plan stored only in localStorage |

### Admin
- **Working (✅):**
  - `/admin`
  - `/admin/users` (new): search and pagination
  - `/admin/users/[id]/services`
  - admin `analytics`, `community`, `courses`, `dashboard`, `funding`, `notifications`, `referrals`, `wallet`, `verification`, `operator`, `security`, `tools`
- ⚪ `/admin/forecast` and `/admin/legal` are stubs.
- **Superadmin:** `/superadmin`, `announcements`, `reports`, `security`, `users` and `logs` (new) are ✅.

### API
- **Canonical Stripe flow:** `POST /api/checkout` → Stripe → `POST /api/stripe/webhook`.
- **Legacy (propose deleting, needs approval):**
  - `checkout/webhook`: superseded; fixing it would double-grant if both endpoints are registered in Stripe
  - `checkout/session` (410)
  - `services/webhook`
  - `community/posts` and `community/channels` (demo fallback)
  - `community/simple`
- **Admin/internal guard:** `lib/api/internal-auth.ts` `requireAdminOrInternal` (admin session, or the `x-internal-secret` header set to `SERVICE_WEBHOOK_SECRET`).
- **Service-role client:** `lib/supabase/admin.ts`. Use it only after an auth check.
- **Request validation:** `lib/api/parse-body.ts` `parseBody(req, schema)` returns `{data}` or a 400 `{error}`; `idSchema` for row ids.
- **Rate limit:** `lib/api/rate-limit.ts` `rateLimitResponse(\`ai:${userId}\`)`, 20 requests per user per 10 min on the 12 member AI routes. In-memory, so per server instance (best effort).
- **Referrals:** `lib/referrals/record-referral.ts` is shared by `/api/referral-track` and the auth sync route.
- **Server-derived profile fields** (tier, badges, has_*_access after a validated unlock): `lib/privileged-profile.ts`.

## Fixed this session
**Batch 7:**
- `trades/feedback` skipped its ownership check when the client left out `user_id`, so a member could overwrite another user's trade feedback. It now checks the database and scopes the update to the caller.
- Admin notes are HTML-escaped in the funding emails (`notifications/email`, `prop-firm/status`).
- Hook order fixed in the profile and performance sections; `rules-of-hooks` turned back on.
- Rate limits on showcase comments/likes and referral tracking.
- zod on admin community (channels, messages, reports), operator execute, funding status/email, the superadmin forms and the AI generate routes.
- All 20 lint warnings cleared.

**Batch 6:**
- `trades/candles` validates pair and range (max 1000 minutes) and builds the URL safely.
- Auth sync (`/api/auth/callback` POST) rejects cross-origin requests (login CSRF) and invalid bodies, and records a pending referral on first sign-in.
- `ai/chat` uses `getUser`, caps message size and drops client-sent system messages from history.
- `coach/review-progress` and `coach/generate-learning-path` no longer act on another user's `user_id`.
- Per-user rate limit on the member AI routes.
- zod on admin tier/services/subscription/moderation and on eight member routes.

**API security:**
- Routes that wrote data with no auth now require admin or the internal secret: commission, evaluate-tier, referral-reward, leaderboard recalc, weekly XP, optimizer/run.
- `referral-track` is now self-only and once-only.
- Email and mentor-journal leaks closed.

**Free-unlock paths closed:**
- `services/unlock`: paid services return 402.
- `wallet/redeem`: the cost comes from the server.
- `subscriptions` POST: admin only.
- Paid course enroll: 402.

**Roles:**
- Uppercase `'ADMIN'` checks fixed in the community hub, notifications, prop-firm and **nine admin pages**, which were bouncing every admin.
- Admin cross-user writes now use the service role.
- The role picker uses lowercase roles.

**Broken features:**
- Three missing `/logs` endpoints added.
- The signup profile insert is fixed.
- The dead links are fixed: `/support`, `/contact`, `/learn`, `/admin/users`, `/superadmin/logs`, `/404`, and the Settings link was removed.
- `.gitignore` no longer hides directories named `logs` everywhere (it hid real routes).

**Other:**
- Database: `046_security_hardening.sql` written and tested locally (see below). **Not applied.**
- Brand: VisionEdge → Trading Academy everywhere.
- Tooling: ESLint `root: true`, the jest config typo, `env.example` synced, first unit tests.

## Broken / known issues (remaining)
1. 🔴 **The two chat systems contradict the `messages` NOT NULL columns.** `community-hub/messages` sends no `user_id`; `realtime-chat.tsx` sends no `channel_id`/`author_id`. Needs the live schema to settle which shape is real. Blocked on DB restore.
2. 🔴 **The migrations 001–045 can't build a fresh database.** Confirmed on the scratch DB:
   - Errors in 001, 005, 007, 010–013, 016, 018, 021, 029, 042 and 044.
   - Duplicate numbers 008, 036 and 039.
   - Needs a squashed baseline from the live DB (**L effort, owner approval**).
3. 🟡 **`types/supabase.ts` is very stale.** Regenerate it after the DB is restored and 046 applied.
4. 🟡 **`role-provider.tsx` writes `role: 'member'` and inserts profiles from the browser.** After 046 the profile guard may reject this; move it to the `handle_new_user` trigger or a server route once the DB is back.
5. 🟡 **`showcase/like` has no per-user dedupe.** A member can like the same post repeatedly. Needs a `showcase_likes (user_id, post_id)` unique table (DB change, so after the restore).
6. 🟡 **Routes still without zod:** `admin/users/[userId]/role`, `checkout`, `services/unlock` and `wallet/redeem` check types by hand; the mentor/coach generate routes ignore most of the body; `services/webhook` is legacy (proposed for deletion).
7. 🟡 **Rate limits are per server instance** (in-memory). A shared store would need a paid service.

## Database: migration 046 (written + tested, NOT applied)
`supabase/migrations/046_security_hardening.sql`:
- `is_admin()` and `is_privileged_session()`. The latter is based on the JWT role and `session_user`, never `current_user`.
- A trigger stops members changing privileged profile columns; anon can't read `email`.
- `increment_xp`: members can only award themselves, capped at 100.
- RLS on the 26 tables that had it off; `admin_all` on every table with RLS.
- No member self-grants on subscriptions, paid enrollments or paid services.
- Guards on funding and prop-firm status and on wallet amounts.
- `security_invoker` views.
- `audit_log`, `certificates` and `reports` policy fixes.
- Creates `journal_entries`, `user_patterns`, `audit_logs`, `increment_field()` and the `journal-screenshots` bucket.
- Indexes on the foreign keys that had none.

**To apply (owner approval):**
1. Restore the project.
2. Take a backup.
3. Run 046 in the SQL editor.
4. Run `supabase/tests/046_rls_test.sql` against a **branch**, not prod.
5. Regenerate the types.

**Watch after applying:**
- Logged-out pages that `select('*')` from profiles will fail (anon email revoke). None were found, but check them.
- XP awards above 100 from a member session will now error.

## Unfinished
- Gold to Glory: real data source.
- Admin hub: wire it to the real tables, or remove it in favour of `/admin`.
- News: a real feed (paid API, needs approval).
- Mentorship booking.
- Affiliate payouts.
- Community DMs and emoji picker.
- Mission plan: persist server-side.
- `/admin/forecast` and `/admin/legal`.
- Elite and VIP pages.

## Missing
- E2E tests.
- Error tracking (Sentry, needs approval).
- Rate limiting on the AI and auth routes.
- Real legal pages.
- Refund and cancel handling in `stripe/webhook` (payments, needs approval).
- Onboarding.
- 2FA.

## Ideas backlog
| Idea | Effort | Impact | Status |
|---|---|---|---|
| Shared `isAdminRole()` + service-role admin helper | S | high | ✅ done |
| "Sample data" notice component | S | med | ✅ done |
| Real profile stats | S | med | ✅ done |
| zod schemas on mutating routes (shared `parseBody`) | M | high | ✅ done (a few hand-checked routes remain) |
| In-memory per-user rate limit on AI routes | S | med | ✅ done |
| Validate `trades/candles`; same-origin check on auth sync | S | med | ✅ done |
| Record pending referral on first sign-in | S | med | ✅ done |
| Unit tests: rate limit, parseBody, same-origin | S | med | ✅ done |
| Unit tests: catalogue, Stripe price map, tiers, access flags, redirects | S | med | ✅ done |
| Unit tests for `recordReferral` with a fake Supabase client | S | med | next |
| Rate-limit `/api/referral-track` and showcase comment/like | S | med | ✅ done |
| Fix the profile-section hook-order bug | S | med | ✅ done |
| Fix the `<img>`/alt lint warnings (20) | S | low | ✅ done |
| Basic GitHub Actions CI (tsc, lint, jest) | S | high | next (free tier) |
| Error and empty states for dashboard sections when Supabase is down | M | med | next |
| Stripe refund/cancel webhook → revoke access | M | high | ⛔ payments approval |
| Consolidate webhooks into `stripe/webhook`; delete legacy routes and `/prices` code | S | med | ⛔ deletion approval |
| Sentry error tracking | M | high | ⛔ new service |
| Playwright E2E (auth, checkout, chat) | L | high | ⛔ L effort |
| Mentorship booking calendar | L | high | ⛔ L effort |
| Squash migrations into a clean baseline from the live DB | L | high | ⛔ L + DB |
| Onboarding walkthrough | M | med | |
| Persist mission plan in Supabase | M | med | |
| Regenerate `types/supabase.ts` | S | high | ⛔ blocked on DB |

## Waiting on owner
- ⛔ Restore the Supabase project, then approve applying migration 046.
- ⛔ Unblock the Vercel account.
- ⛔ Legal copy (terms, privacy, cookies, risk disclosure).
- ⛔ Marketing claims (10,000+ students, 95% success, testimonials) and the "we pass your prop challenge" service, which may break prop firms' rules.
- ⛔ Mentoring pricing ($99/$299 on `/mentoring`) is not on `/pricing`.
- ⛔ Approval to delete the legacy routes (`checkout/webhook`, `checkout/session`, `services/webhook`, `community/*` demo APIs, `/prices` code).
- ⛔ Set `NEXT_PUBLIC_SUPPORT_EMAIL` in production.

## Next 5
1. GitHub Actions CI running tsc, lint and jest on PRs (no paid service).
2. Unit tests for `recordReferral` with a fake Supabase client.
3. Friendly error/empty states for dashboard sections when Supabase is unreachable.
4. Onboarding walkthrough for new members (M).
5. Persist the mission plan in Supabase instead of localStorage (M; needs a table, so write the migration but don't apply it).

## Session log
- **2026-11-19:** Local dev server set up. Public pages walked through. PR #1 opened: dev pages hidden in production, `/prices` redirect, titles, favicon.
- **2026-11-20, batch 1:** Audit (routes, unfinished work, schema vs code). ESLint root, jest typo, `env.example`. First `next build`; production 404s verified. PROGRESS.md and CLAUDE.md written.
- **2026-11-20, batch 2:** API security: auth on mutating routes, leaks, free-unlock paths, role casing, admin service-role writes. Shared helpers and 19 unit tests.
- **2026-11-20, batch 3:** Migration 046 written and tested on a throwaway Supabase Postgres (24/24). The test caught a `current_user`-in-SECURITY-DEFINER bug, now fixed.
- **2026-11-20, batch 4:**
  - Paid course enroll returns 402.
  - Nine admin pages' role check fixed.
  - Three `/logs` endpoints added.
  - Signup flow fixed.
  - `/admin/users`, `/superadmin/logs` and `/support` added; dead links fixed.
  - `.gitignore` `logs/` scoped to the repo root.
- **2026-11-20, batch 7:** hook order fixed and the lint rule restored; trade-feedback ownership hole closed; email notes escaped; more rate limits; zod across the remaining admin, superadmin and AI routes; 24 new tests; lint fully clean. Health check and smoke test green.
- **2026-11-20, batch 6:** candles validation; auth sync same-origin check and pending referral; coach routes self-only; AI rate limit and `ai/chat` input validation; `parseBody` + zod on 12 routes; 13 new tests. Health check and smoke test green.
- **2026-11-20, batch 5:** VisionEdge → Trading Academy, real profile stats, sample-data notices. Full health check green; production smoke test green.
