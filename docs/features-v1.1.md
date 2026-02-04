# VisionEdge FX v1.1 — Feature Specs & Ticket Seeds

Use this to spin epics/tickets and track acceptance criteria. Align with the 30-day roadmap in `/docs/v1.1-plan.md`.

## Milestone
- Milestone: `v1.1-week-1-2` (core features), `v1.1-week-3-4` (AI + infra), `v1.1-week-5-6` (testing, polish, beta → RC).

## Epics
### 1) Community Hub — Threads & Reactions
- Objective: increase clarity and engagement in message streams.
- Scope: threaded replies, emoji reactions, unread/thread badges, moderation rules.
- Acceptance:
  - Users can start/reply to threads; thread view shows nested context.
  - Emoji reactions available on posts/replies; counts update in realtime.
  - RLS/ACL: users only interact where authorized; audit trail for moderators.
  - Playwright covers create/reply/react; latency remains within current SLAs.
- Dependencies: data model updates; realtime/channel events; UI design.

### 2) Signals — Analytics Dashboard
- Objective: give traders visibility on hit rate, ROI, risk metrics.
- Scope: metrics definition, ingestion from signal posts/trades, dashboard UI, exports.
- Acceptance:
  - Metrics computed nightly + on-demand; definitions documented.
  - Dashboard shows hit rate, ROI, win/loss count, avg R:R, drawdown.
  - Filters by date, instrument, mentor; CSV export.
  - Data correctness spot-checks vs sampled signals; alerts on failed jobs.
- Dependencies: schema for signals/trades; ETL or Supabase functions; caching (Redis).

### 3) Mentorship — Calendar, Tiers, Billing
- Objective: make mentor booking reliable and monetize tiers.
- Scope: booking calendar, mentor availability, tiered plans, Stripe recurring subs, reminders.
- Acceptance:
  - Users can view/book/cancel slots; double-booking prevented.
  - Mentor tiers map to pricing and permissions; Stripe subscription created/updated on change.
  - Email/DM reminders 24h + 1h before sessions.
  - Playwright flow: select tier → checkout → book → cancel → refund (test mode).
- Dependencies: Stripe keys/products/prices; calendar source of truth; time zone handling.

### 4) AI Trade Analyzer (High)
- Objective: <5s response identifying liquidity zones & bias from uploads.
- Scope: upload → preprocess → model → response; queue; cache; observability.
- Acceptance:
  - Supports png/jpg uploads; size/type validation; secure storage.
  - Model returns zones/bias with confidence + concise rationale.
  - P95 latency <5s; retries/backoff; user-facing error states.
  - Metrics: success rate, latency, cost per call; alerts on failure/timeout spikes.
- Dependencies: model choice; queue (Supabase Functions/RabbitMQ); cache (Redis); CDN.

### 5) Auto-Summary Bot (Community Digest)
- Objective: weekly digest to boost retention.
- Scope: scheduled job, ranking logic, summary generation, posting to hub.
- Acceptance:
  - Job runs weekly; skips if volume < threshold; posts summary with links.
  - “Top trades” and “Most liked posts” sections; respects private channels.
  - Admin override to rerun or delete a digest.
- Dependencies: scheduler; permissions; OpenAI budget guardrails.

### 6) UX & Onboarding Refresh
- Objective: unified dashboard and smoother first-run experience.
- Scope: mobile-first grid, typography/spacing refresh, WCAG AA color pass, onboarding walkthrough.
- Acceptance:
  - Lighthouse: ≥95 desktop, ≥85 mobile on dashboard route.
  - Onboarding tour triggered for new accounts; dismissible/persistent state.
  - Accessibility scan passes WCAG AA for contrast/navigation.
- Dependencies: design tokens; analytics event hooks; feature flag for rollout.

### 7) Infra & Reliability
- Objective: faster API, resilient async work, reliable assets, stronger auth.
- Scope: Redis cache, queue (Supabase Functions or RabbitMQ), CDN (R2 or Supabase Storage), 2FA toggle, backup verification.
- Acceptance:
  - Redis integrated for hot paths/rate-limit counters; fallbacks documented.
  - Queue processes webhook/AI jobs with DLQ + retries; dashboards for job health.
  - CDN serving static assets; cache headers tuned.
  - 2FA (Supabase Auth OTP) toggle in user settings; recovery flow documented.
  - Weekly backup verification job with alert on failure.
- Dependencies: provider choice; env/secrets; CI/CD updates.

### 8) Testing & CI Expansion
- Objective: 95% of validation automated.
- Scope: Playwright E2E (auth, chat, checkout, verification, bookings), contract tests for APIs, lint/format gates.
- Acceptance:
  - Playwright suite green in CI; flakes <1%.
  - Critical APIs have contract tests; mocks for external services (Stripe, OpenAI).
  - CI blocks on lint/test failures; artifacts stored for failures (videos/logs).
- Dependencies: stable test data/seeds; CI minutes; secrets for test modes.

## Ticket Seeds (copy/paste to tracker)
- Define metrics & data model for Signals Analytics (owner: data).
- Design spec for Threads/Reactions UI/flows (owner: product/design).
- Implement thread schema + API + RLS (owner: backend).
- Realtime events for reactions/threads (owner: backend).
- Mentorship: create Stripe products/prices for tiers (owner: ops).
- Calendar backend with availability + conflict detection (owner: backend).
- AI Analyzer: choose model + latency budget test (owner: AI).
- AI Analyzer: enqueue/process job with retries + DLQ (owner: platform).
- Auto-Summary: ranking logic + weekly scheduler (owner: backend).
- UX: dashboard grid + typography refresh (owner: frontend).
- Accessibility: WCAG AA color tokens update (owner: frontend).
- Infra: add Redis + connection mgmt + metrics (owner: platform).
- Infra: queue choice (Supabase Functions vs RabbitMQ) decision record (owner: platform).
- CDN migration plan and headers (owner: platform).
- Testing: Playwright auth/chat/checkout/verification flows (owner: QA/eng).

## Open Decisions to Resolve Early
- Cache/queue stack (Redis + Supabase Functions vs RabbitMQ).
- CDN choice (R2 vs Supabase Storage) for assets and uploads.
- AI model provider/cost guardrails for Analyzer and Summary Bot.
- Onboarding tour framework (native vs third-party) and feature flag strategy.


