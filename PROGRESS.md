# PROGRESS

> Living status doc. A fresh session should be able to resume from this file alone.
> Last updated: 2026-11-20 · Branch: `claude/local-host-setup-54ce2b` (PR joell9fx/trading-app#1)

## What this project is
**Trading Academy**: a Next.js 14 (App Router) + Supabase + Stripe + OpenAI membership platform for retail traders.
- **Paid tiers:** Signals, Gold to Glory, Elite and VIP.
- **Member dashboard:** about 30 sections (journal, trade replay, AI mentor, community hub, leaderboards and XP, wallet, referrals and affiliates).
- **Back office:** admin and superadmin consoles.

Older docs in `/docs` use the name "VisionEdge FX"; the chosen brand is **Trading Academy**.

## Environment status
| Item | State |
|---|---|
| Supabase project `trading-app` (`cffqnrxnavlknrijuurj`) | **Paused (INACTIVE).** No logins, no live DB checks, no type regeneration until restored (needs owner approval). |
| Vercel | **Account blocked.** Preview deploys fail ("Account is blocked"). Must be fixed in the Vercel dashboard. |
| Local `.env.local` | Supabase keys only. No Stripe, OpenAI or Resend keys, so checkout and AI features can't run locally. |
| Tests | None yet. Jest is configured (`npm test`). |

## Health check (2026-11-20)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ pass |
| `npx next lint` | ✅ 0 errors, 22 warnings (`<img>` vs `next/image`, missing alt text, hook deps) |
| `npx jest` | ✅ (no tests) |
| `npx next build` | ✅ pass. Edge Runtime warnings come from the Supabase client in the middleware (harmless). |
| Production dev-only routes | ✅ `/test`, `/preview`, `/local-preview`, `/api/test-supabase`, `/api/community/test-db`, `/api/community/check-schema` → 404 |

## Current state map
**Legend:** ✅ done · 🟡 partial · 🔴 broken · ⚪ stub · 🧪 dev-only · 🔁 duplicate or redirect

### Public pages
| Route | Status | Notes |
|---|---|---|
| `/` `/about` `/courses` `/signals` `/mentoring` `/funding-account` `/funding-service` | ✅ | Marketing pages. Stats, testimonials and course numbers are invented (needs a business decision). |
| `/pricing` | ✅ | Real availability and Stripe checkout. Tiers show "Coming Soon" while `STRIPE_PRICE_*` is unset. |
| `/prices` | 🔁 | Redirects to `/pricing`. The legacy page code is still in the repo (it had a `/100` price bug). |
| `/signin` `/signup` `/forgot-password` `/reset-password` | ✅ | `/login` → `/signin` |
| `/community-hub` | ✅ | Members only. `/community`, `/chat` and `/dashboard/community` redirect here. |
| `/leaderboard` | ✅ | Same data as `/dashboard/leaderboard` |
| `/auto-trader` | ⚪ | Deliberately "coming soon" |
| `/u/[username]` | 🟡 | Uses `redirect('/404')`; the public API returns `mentor_journal` (leak) |
| `/banned` | 🟡 | Links to `/support`, which doesn't exist |
| `/privacy` `/terms` `/cookies` | ⚪ | Placeholder text. **The owner must supply real legal copy.** |
| `/test` `/preview` `/local-preview` | 🧪 | 404 in production |

### Member dashboard (`/dashboard?section=…`, `components/dashboard/dashboard-layout.tsx`)
| Section | Status | Data |
|---|---|---|
| overview, signals, ai, funding, courses, notifications, wallet, leaderboard, learning-path, mentor, journal, timeline, affiliate, marketing, campaigns, analytics, reports, ai-coach, consistency, performance, terminal | ✅ | Real Supabase or API data. Many depend on the `journal_entries` table, which **no migration creates** (see DB). |
| community-hub | ✅ | Real, with a demo-channel fallback when a fetch fails |
| mentorship | 🟡 | Real list; booking modal says "coming soon" |
| profile | 🟡 | Real profile, but **hardcoded stats** (3 courses, 12 lessons…) |
| gold-to-glory | 🟡 | **All `SAMPLE_*` hardcoded data** |
| elite-membership, vip-membership | ⚪ | Static text |
| optimizer | 🔴 | Fetches missing `/api/optimizer/logs` |
| news | 🟡 | `lib/news/*` returns **placeholder** headlines and calendar; the risk radar is built on fake data |
| mission | 🟡 | Plan and discipline data stored only in localStorage |
| admin | 🟡 | `AdminHub` is **mock data**; toggles and kill switches only change local state |

Standalone dashboard routes: `/dashboard/{affiliate,campaigns,marketing,learning-path,wallet,referrals,showcase,analytics,timeline,trades,trade-review/[id],success,upgrade,progress}` work. `/dashboard/optimizer` is 🔴. `/dashboard/funding` redirects to the public marketing page instead of `?section=funding`.

### Admin
- **Working:** `/admin` (launch readiness) and admin `analytics`, `community`, `courses(/create)`, `dashboard`, `funding`, `notifications`, `referrals`, `wallet`, `verification`, `users/[id]/services`. All ✅ with real data.
- 🔴 `/admin/operator` and `/admin/security` fetch missing `/logs` endpoints.
- ⚪ `/admin/forecast` and `/admin/legal` are stubs.
- Dead links: `/admin/users`, `/admin/settings`.
- **Superadmin:** `/superadmin(/announcements,/reports,/security,/users)` ✅. Dead link: `/superadmin/logs`.

### API (104 routes)
- **Canonical Stripe flow:** `POST /api/checkout` → Stripe → `POST /api/stripe/webhook` (signature-verified, service role).
- **Legacy or duplicate:**
  - `checkout/webhook` (reads `metadata.product`, but the session sets `service_key`, so it never unlocks anything)
  - `checkout/session` (410)
  - `services/webhook` (anon client, blocked by RLS)
  - `community/posts` and `community/channels` (fallback demo data; only `/test` uses them)
- **21 routes have no caller** (listed in the backlog for review).
- **zod validation** only in about 11 route files.

## Broken
1. 🔴 Three missing API routes: `/api/optimizer/logs`, `/api/admin/operator/logs`, `/api/admin/security/logs`.
2. 🔴 `checkout/webhook` metadata key mismatch (legacy handler never grants access).
3. 🔴 Signup inserts `role: 'MEMBER'` (`components/auth/signup-form.tsx`), which breaks the lowercase role CHECK. The error is swallowed, so `referral_code` is never set.
4. 🔴 The two chat systems contradict the `messages` NOT NULL columns (`community-hub/messages` sends no `user_id`; `realtime-chat.tsx` sends no `channel_id`/`author_id`).
5. 🔴 Admin API routes write other users' rows through the anon-key client, so RLS silently blocks them (superadmin users, admin role/tier/services, community user moderation).
6. 🔴 Uppercase `'ADMIN'` checks in `community-hub/*` and `notifications/email`: admins stored in lowercase are not treated as admins.
7. 🔴 Dead links: `/support`, `/contact`, `/learn`, `/admin/users`, `/admin/settings`, `/superadmin/logs`, `/404`.

## Security — API (owner approved fixing, 2026-11-20)
- **Mutating routes with no auth:**
  - `affiliate/commission` (pays commission)
  - `referral-reward` (XP)
  - `referral-track` (sets `referred_by` on any user)
  - `optimizer/run` (OpenAI spend)
  - `affiliate/evaluate-tier`
  - `leaderboard/recalc`
  - `community/leaderboard/weekly`
- **Leaks:** `traders/leaderboard` returns `email`; `users/profile/[username]` returns `mentor_journal`.
- **Payments:**
  - `wallet/redeem` trusts the client's `cost`.
  - `services/unlock` grants any service to any logged-in user.
  - `subscriptions` POST creates an active subscription with no payment.
- `api/auth/callback` POST calls `setSession` with tokens from the request body. Review it.
- `trades/candles` puts `pair` into the Binance URL unchecked.

## Security — Database (fix migration to be written, NOT applied)
From reading the migrations (the live DB is paused, so this is unverified against prod):
- **C1:** The profiles UPDATE policy lets a user set their own `is_owner`, `is_admin`, `banned`, `has_*_access`, `membership_tier`, `xp` and `affiliate_*`. The 041 trigger guards only `role`.
- **C2:** RLS is **off** on 26 tables, combined with `GRANT ALL TO anon, authenticated`:
  - reactions, membership_history, referrals, referral_rewards, leaderboard_snapshots, community_activity, performance_stats
  - learning_paths, mentor_chats, mentor_memory, mentor_journal, user_reflections, user_showcase_posts, showcase_comments
  - affiliate_tiers, affiliate_payouts, marketing_assets, ad_campaigns, optimization_logs, business_actions
  - security_audits, access_logs, announcements, admin_logs, system_flags, verifications
- **C3:** Users can insert or update their own `subscriptions`, `course_enrollments` (any price) and `user_services`, which means free unlocks.
- **C4:** Users can self-approve `funding_accounts.status`. `api_key` is stored in plaintext.
- **C5:** Views run with the owner's rights and leak cross-user data: `course_enrollments_with_progress`, `user_wallet_balance`, and the 009 analytics views.
- **C6:** Any user can call the `increment_xp` RPC for any user, with any amount. The SECURITY DEFINER helpers take any user id.
- **C7:** `audit_log` INSERT `WITH CHECK (true)`; `certificates` SELECT is public; `reports` insert doesn't bind the reporter; `profiles` SELECT exposes emails to anyone.
- **High:** Policies from 001–013 check uppercase roles, so after 041 no admin policy matches anyone. `increment_xp` writes `notifications`, whose insert policy needs `'ADMIN'`, so it probably always fails.
- **Missing objects the code needs:**
  - `journal_entries` (13 call sites; migrations 042 and 044 also depend on it)
  - `audit_logs` (the code uses the plural; the migration creates `audit_log`)
  - `user_patterns`
  - RPC `increment_field`
  - storage bucket `journal-screenshots`
- **Migrations can't build from scratch:**
  - Syntax or logic errors in 001 (seed FK), 005, 007, 010–013, 016 and 028.
  - Ordering bugs: 018 and 021 come before 045; 042 and 044 have no `journal_entries`.
  - `referrals` is defined as 015 vs 029 (the 029 columns never exist, but the code uses them).
  - Duplicate migration numbers 008, 036 and 039 (`supabase db push` will reject them). **Renaming needs owner approval.**
- **`types/supabase.ts` is very stale:** about 35 tables missing, profiles missing most columns, `Functions` empty. It looks generated from a DB that has drifted, since it includes tables no migration has (`journal_entry_tags`, `mistake_library`, …).
- **Foreign keys with no index:** subscriptions.plan_id, certificates.course_id, community_channels.created_by, messages.user_id/author_id, events.created_by, reports.reporter_id/reviewed_by, bans.admin_id, muted_users.admin_id, leaderboard_snapshots.user_id, user_reflections.user_id, showcase_comments.user_id, affiliate_payouts.referral_id, verifications.reviewer_id, profiles.referred_by.

## Unfinished
- Gold to Glory: all sample data.
- Admin hub: mocked.
- News and risk radar: placeholder data.
- Profile stats: hardcoded.
- Mentorship booking: "coming soon".
- Affiliate payouts: "Connect Payouts (Coming Soon)".
- Community DMs and emoji picker: "coming soon".
- Mission plan: localStorage only.
- `/admin/forecast` and `/admin/legal`: stubs.
- `auto-trader-section` equity curve: placeholder.

## Missing
- Tests (unit and E2E).
- Error tracking (Sentry is referenced in docs but not installed).
- Rate limiting on the AI and auth routes.
- Real legal pages.
- `/support` and `/contact`.
- Refund and cancel handling in `stripe/webhook`.
- An onboarding flow for new sign-ups.
- 2FA.
- A server-side source of truth for the mission plan.

## Ideas backlog
| Idea | Effort | Impact |
|---|---|---|
| Shared `isAdminRole()` + service-role admin client helper | S | high |
| zod schemas for all mutating routes (shared `parseBody` helper) | M | high |
| Simple in-memory/IP rate limit for AI routes (no new infra) | S | med |
| Unit tests for access helpers, pricing/availability, referral utils | S | med |
| "Sample data" banner component for demo sections | S | med |
| Real profile stats from enrollments/posts/journal counts | S | med |
| Stripe refund/cancel webhook handling (revoke access) | M | high (payments → needs approval) |
| Consolidate the three webhook handlers into `stripe/webhook` | M | med (payments → approval) |
| Delete legacy `/prices`, `checkout/session`, `community/*` APIs | S | low (deletion → approval) |
| Sentry error tracking | M | high (new service → approval) |
| Playwright E2E for auth/checkout/chat | L | high (approval) |
| Mentorship booking calendar | L | high (approval) |
| Real news/economic-calendar feed | L | med (paid API → approval) |
| Onboarding walkthrough for new sign-ups | M | med |
| Move mission plan to Supabase table | M | med |
| Regenerate `types/supabase.ts` once DB restored | S | high (blocked on DB) |
| Squash/renumber migrations into a clean baseline | L | high (approval) |

## Waiting on owner
- ⛔ Restore the Supabase project (and then apply the fix migration).
- ⛔ Unblock the Vercel account.
- ⛔ Legal copy for terms, privacy and cookies.
- ⛔ The marketing claims (10,000+ students, 95% success rate, testimonials) and the "we pass your prop challenge" service, which may break prop firms' rules.
- ⛔ Mentoring pricing ($99/$299 on `/mentoring`) is not on `/pricing`.

## Next 5
1. API security fixes (Batch 2).
2. `046_security_hardening.sql`, tested on a scratch Postgres (Batch 3).
3. Missing `/logs` routes, the webhook metadata fix, signup role fix, dead links (Batch 4).
4. VisionEdge → Trading Academy; real profile stats; sample-data banners (Batch 5).
5. Unit tests for the new auth helpers.

## Session log
- **2026-11-19:** Local dev server set up (`.claude/launch.json`). Public pages walked through. PR #1: dev pages hidden in production, `/prices` → `/pricing`, page titles, favicon.
- **2026-11-20:** Full audit (routes, unfinished work, schema vs code). Fixed the ESLint root config, the jest typo and `env.example`. First successful `next build`; production 404s for the dev routes verified with `next start`. Wrote PROGRESS.md and CLAUDE.md.
