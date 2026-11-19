# Migration tests

`046_rls_test.sql` checks that migration 046 blocks privilege escalation and free unlocks.
Each line prints PASS or FAIL. Run it against a **throwaway** Supabase Postgres, never the live project:

```bash
docker run -d --name ta-migtest -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:54329:5432 public.ecr.aws/supabase/postgres:17.6.1.159
export PGPASSWORD=postgres
for f in supabase/migrations/0*.sql; do psql -h 127.0.0.1 -p 54329 -U postgres -q -f "$f" >/dev/null 2>&1; done   # 001-045 are best-effort (several fail; see PROGRESS.md)
psql -h 127.0.0.1 -p 54329 -U postgres -v ON_ERROR_STOP=1 -f supabase/migrations/046_security_hardening.sql
psql -h 127.0.0.1 -p 54329 -U postgres -f supabase/tests/046_rls_test.sql
docker rm -f ta-migtest
```
