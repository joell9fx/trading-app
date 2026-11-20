# CLAUDE.md

Trading Academy is a Next.js 14 App Router app built on Supabase, Stripe and OpenAI. Current status, backlog and session log are in `PROGRESS.md`. Read it first and update it as you work.

## Commands
- `npm run dev` starts the dev server on :3000. The preview config is in `.claude/launch.json`.
- `npx tsc --noEmit` type-checks. TS strict mode is on.
- `npx next lint` runs ESLint. `.eslintrc.json` is `root: true`, which it must be because worktrees are nested inside the main checkout.
- `npm test` runs Jest. Put tests in `__tests__/` or name them `*.test.ts`.
- `npx next build` does a production build. Stop the dev server first, because both use `.next`.

## Conventions
- Brand name: **Trading Academy**, not "VisionEdge".
- Supabase clients:
  - `lib/supabase/server.ts` `createClient()` uses the user session, so RLS applies.
  - `lib/supabase/client.ts` is the browser client.
  - The service role is server-only. Use it only after an admin or owner check, or in signature-verified webhooks.
- Auth guards:
  - `app/api/admin/auth.ts` provides `requireAdmin` and `requireOwner`.
  - `lib/api/require-service-access.ts` gates paid features.
  - `utils/auth.ts` has the role helpers. Roles are lowercase: `member`, `admin`, `owner`.
- Validate request bodies with zod in any mutating route.
- Stripe: `/api/checkout` creates the session and `/api/stripe/webhook` grants access. Those two are the canonical pair.
- New env vars go in `env.example`.
- Migrations live in `supabase/migrations/NNN_name.sql`. Make them idempotent with `IF EXISTS` / `IF NOT EXISTS`.

## Hard stops (ask the owner first)
- Deploying, pushing to main or merging PRs.
- Applying migrations to the live project, or restoring it.
- Destructive or renaming migrations.
- Changes to auth or payments beyond what has been approved.
- Adding paid services or big dependencies.
- Deleting files or features.
- Large (L-effort) features.
