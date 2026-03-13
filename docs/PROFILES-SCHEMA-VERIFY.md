# Profiles schema verification and migration

## 1. Verify whether production has the access columns

You cannot verify production from this repo alone. Use one of these:

### Option A: Supabase Dashboard (SQL Editor)

Run in the SQL Editor for your **production** project:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN (
    'has_signals_access',
    'has_funding_access',
    'has_courses_access',
    'has_mentorship_access',
    'has_ai_tools_access'
  )
ORDER BY column_name;
```

- **0 rows** → none of these columns exist (migrations not applied).
- **5 rows** → all columns exist (migrations applied; 400 may be RLS or API issue).

### Option B: Regenerate types from production

From the repo root, with Supabase CLI linked to the **production** project:

```bash
npm run db:generate
```

- If `types/supabase.ts` gains the five `has_*` fields on `profiles`, the live DB has those columns.
- If they do not appear, the live schema does not have them (or the CLI is linked to another project).

---

## 2. Whether migrations 036, 038, 039 were applied

- **Applied**: The verification query in Option A returns 5 rows, or `db:generate` adds the access columns to `profiles`.
- **Not applied**: The query returns 0 rows, or `db:generate` does not add those columns.

---

## 3. Exact SQL if migrations were NOT applied

Run this in the Supabase SQL Editor (production) **in order**:

```sql
-- From 036_access_flags.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_signals_access boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_funding_access boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS has_courses_access boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS has_mentorship_access boolean DEFAULT true;

UPDATE profiles SET has_signals_access = COALESCE(has_signals_access, false);
UPDATE profiles SET has_funding_access = COALESCE(has_funding_access, true);
UPDATE profiles SET has_courses_access = COALESCE(has_courses_access, true);
UPDATE profiles SET has_mentorship_access = COALESCE(has_mentorship_access, true);

-- From 038_ai_tools_flag.sql (and 039)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_ai_tools_access boolean DEFAULT false;

UPDATE profiles SET has_ai_tools_access = COALESCE(has_ai_tools_access, false);
```

Or apply via CLI (against the correct project):

```bash
supabase db push
```

---

## 4. If migrations WERE applied but PostgREST still returns 400

Possible causes:

1. **RLS**: Policy blocks `SELECT` on those columns or on the row. Check Table Editor → `profiles` → RLS policies; ensure authenticated (and anon, if used) can select these columns.
2. **Wrong project**: App is using a different Supabase project (e.g. staging) where migrations were not run.
3. **Caching**: Rare; try a hard refresh or a different client.
4. **PostgREST schema cache**: Restart the Supabase project or run a lightweight migration so PostgREST reloads schema.

---

## 5. Regenerate types so types/supabase.ts matches live schema

**Recommended (from live DB):**

```bash
npm run db:generate
```

This overwrites `types/supabase.ts` with types from the **linked** Supabase project. Ensure the CLI is linked to production:

```bash
supabase link --project-ref cfnfrxnxnavlknrjujurj
npm run db:generate
```

**Done in this repo:** The five `has_*` columns were added to `profiles` in `types/supabase.ts` so the codebase matches the intended schema (036 + 038/039). After you run `npm run db:generate` against production, you may get additional columns or small differences; keep the generated file as the source of truth for the live DB.
