-- 046_security_hardening.sql
--
-- Security hardening + missing objects. NOT YET APPLIED to the live project.
-- Written to be idempotent and tolerant of schema drift: every statement
-- checks that its table/column exists, so it can run on the live DB (which
-- has drifted from 001-045) and be re-run safely.
--
-- What it does
--   1. public.is_admin() helper (lowercase role, is_owner, is_admin; not banned)
--   2. profiles: non-admins can no longer change privileged columns
--      (is_owner, is_admin, banned, has_*_access, membership_tier, xp, ...);
--      anon can no longer read profiles.email
--   3. increment_xp: SECURITY DEFINER, caller may only award themselves a
--      capped amount (admins/service role unrestricted)
--   4. RLS on the 26 tables that had it off, with own-row / public-read /
--      admin-only policies matching how the app uses them
--   5. admin_all policy on every RLS table (old policies check 'ADMIN' in
--      uppercase and no longer match anyone since 041)
--   6. paid-access tables: members can no longer grant themselves
--      subscriptions, paid course enrollments or paid services
--   7. funding_accounts status, referral_rewards amounts: column guards
--   8. views run with the caller's permissions (security_invoker)
--   9. audit_log / certificates / reports policy fixes
--  10. missing objects the code uses: journal_entries, user_patterns,
--      audit_logs, increment_field(), journal-screenshots bucket
--  11. indexes on unindexed foreign keys

begin;

-- ─────────────────────────────────────────────────────────────────────────
-- Helpers (dropped at the end)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function pg_temp.has_table(t text) returns boolean
language sql stable as $$ select to_regclass('public.' || t) is not null $$;

create or replace function pg_temp.has_column(t text, c text) returns boolean
language sql stable as $$
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = t and column_name = c
  )
$$;

-- (Re)create a policy if the table exists. cmd: select|insert|update|delete|all
create or replace function pg_temp.policy(
  t text, name text, cmd text, using_expr text, check_expr text default null
) returns void language plpgsql as $$
begin
  if to_regclass('public.' || t) is null then return; end if;
  execute format('drop policy if exists %I on public.%I', name, t);
  execute format(
    'create policy %I on public.%I for %s to authenticated%s%s',
    name, t, cmd,
    case when using_expr is null then '' else ' using (' || using_expr || ')' end,
    case when check_expr is null then '' else ' with check (' || check_expr || ')' end
  );
end $$;

create or replace function pg_temp.enable_rls(t text) returns void language plpgsql as $$
begin
  if to_regclass('public.' || t) is null then return; end if;
  execute format('alter table public.%I enable row level security', t);
end $$;

create or replace function pg_temp.fk_index(t text, c text) returns void language plpgsql as $$
begin
  if pg_temp.has_column(t, c) then
    execute format('create index if not exists %I on public.%I (%I)', 'idx_' || t || '_' || c, t, c);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. is_admin()
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p record;
begin
  if uid is null then
    return false;
  end if;
  select to_jsonb(pr) as j into p from public.profiles pr where pr.id = uid;
  if p is null then
    return false;
  end if;
  return coalesce((p.j->>'banned')::boolean, false) = false
     and (
       lower(coalesce(p.j->>'role', '')) in ('admin', 'owner')
       or coalesce((p.j->>'is_owner')::boolean, false)
       or coalesce((p.j->>'is_admin')::boolean, false)
     );
end;
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

-- JWT role claim, whichever way PostgREST exposed it
create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb) ->> 'role'
  )
$$;

create or replace function public.jwt_sub()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb) ->> 'sub'
  )
$$;

-- Privileged = service-role API key, a direct DB session (migrations / SQL
-- editor: session_user is postgres and there is no JWT), or a trusted
-- SECURITY DEFINER function that set app.privileged_update for this txn.
-- NB: never use current_user here; inside SECURITY DEFINER functions it is
-- the function owner (postgres) for every caller.
create or replace function public.is_privileged_session()
returns boolean
language sql
stable
as $$
  select coalesce(public.jwt_role(), '') in ('service_role', 'supabase_admin')
      or (public.jwt_sub() is null
          and public.jwt_role() is null
          and session_user in ('postgres', 'supabase_admin'))
      or coalesce(current_setting('app.privileged_update', true), '') = 'on'
$$;

-- Existing audit trigger (001) inserts into audit_log as the caller; with
-- the open insert policy removed (section 9) it must run as definer.
do $$
begin
  if to_regprocedure('public.log_audit_event()') is not null then
    alter function public.log_audit_event() security definer set search_path = public;
  end if;
end $$;

-- 041's role trigger only trusted auth.role() = service_role; align it with
-- is_privileged_session() so direct SQL / service role behave the same.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_privileged_session() then
    return new;
  end if;
  if old.role is null and new.role = 'member' then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'Updating role is not allowed' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. profiles: guard privileged columns, hide email from anon
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  col text;
  old_j jsonb := to_jsonb(old);
  new_j jsonb := to_jsonb(new);
  guarded text[] := array[
    'role', 'is_owner', 'is_admin', 'banned',
    'membership_tier', 'xp', 'rank_position', 'badges',
    'affiliate_tier', 'affiliate_total_commission', 'referral_code',
    'has_signals_access', 'has_funding_access', 'has_courses_access',
    'has_mentorship_access', 'has_ai_tools_access', 'has_gold_to_glory_access',
    'has_elite_access', 'has_vip_access', 'has_auto_trader_access',
    'has_community_access'
  ];
begin
  if public.is_privileged_session() or public.is_admin(auth.uid()) then
    return new;
  end if;

  -- First-time referral code assignment by the owner of the row is allowed
  if old_j->>'referral_code' is null and new_j ? 'referral_code' then
    old_j := old_j - 'referral_code';
    new_j := new_j - 'referral_code';
  end if;

  foreach col in array guarded loop
    if (new_j -> col) is distinct from (old_j -> col) then
      raise exception 'Updating % is not allowed', col using errcode = '42501';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists guard_profile_privileged_columns on public.profiles;
create trigger guard_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- New rows created by members can't start out privileged either
create or replace function public.guard_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_j jsonb := to_jsonb(new);
begin
  if public.is_privileged_session() or public.is_admin(auth.uid()) then
    return new;
  end if;
  if lower(coalesce(new_j->>'role', 'member')) <> 'member'
     or coalesce((new_j->>'is_owner')::boolean, false)
     or coalesce((new_j->>'is_admin')::boolean, false) then
    raise exception 'New profiles must be members' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_insert on public.profiles;
create trigger guard_profile_insert
  before insert on public.profiles
  for each row execute function public.guard_profile_insert();

-- Logged-out visitors: every profiles column except email
do $$
declare
  cols text;
begin
  if pg_temp.has_column('profiles', 'email') then
    select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
      into cols
      from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles'
       and column_name not in ('email', 'stripe_customer_id');
    execute 'revoke select on public.profiles from anon';
    execute format('grant select (%s) on public.profiles to anon', cols);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. increment_xp
-- ─────────────────────────────────────────────────────────────────────────
drop function if exists public.increment_xp(uuid, integer, text);
create function public.increment_xp(user_id uuid, amount integer, reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if amount is null or amount = 0 then
    return;
  end if;

  if not (public.is_privileged_session() or public.is_admin(caller)) then
    if caller is null or caller <> increment_xp.user_id then
      raise exception 'Not allowed to award XP to another user' using errcode = '42501';
    end if;
    if amount < 0 or amount > 100 then
      raise exception 'XP amount out of range' using errcode = '22003';
    end if;
  end if;

  perform set_config('app.privileged_update', 'on', true);
  update public.profiles set xp = coalesce(xp, 0) + amount where id = increment_xp.user_id;
  perform set_config('app.privileged_update', 'off', true);

  if to_regclass('public.notifications') is not null then
    insert into public.notifications (user_id, type, title, message)
    values (increment_xp.user_id, 'xp', '⭐ XP Earned',
            concat('You earned ', amount, ' XP for ', coalesce(reason, 'activity'), '.'));
  end if;
end;
$$;

revoke all on function public.increment_xp(uuid, integer, text) from public, anon;
grant execute on function public.increment_xp(uuid, integer, text) to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. RLS on the 26 tables that had it off
-- ─────────────────────────────────────────────────────────────────────────
select pg_temp.enable_rls(t) from unnest(array[
  'reactions', 'membership_history', 'referrals', 'referral_rewards',
  'leaderboard_snapshots', 'community_activity', 'performance_stats',
  'learning_paths', 'mentor_chats', 'mentor_memory', 'mentor_journal',
  'user_reflections', 'user_showcase_posts', 'showcase_comments',
  'affiliate_tiers', 'affiliate_payouts', 'marketing_assets', 'ad_campaigns',
  'optimization_logs', 'business_actions', 'security_audits', 'access_logs',
  'announcements', 'admin_logs', 'system_flags', 'verifications'
]) as t;

-- Private, owned by user_id (full CRUD on own rows)
select pg_temp.policy(t, 'own_rows', 'all', 'user_id = auth.uid()', 'user_id = auth.uid()')
from unnest(array[
  'mentor_chats', 'mentor_memory', 'mentor_journal', 'user_reflections',
  'learning_paths', 'marketing_assets', 'ad_campaigns'
]) as t;

-- Community content: readable by signed-in users, written by the author
select pg_temp.policy(t, 'read_authenticated', 'select', 'true')
from unnest(array['reactions', 'user_showcase_posts', 'showcase_comments']) as t;
select pg_temp.policy(t, 'insert_own', 'insert', null, 'user_id = auth.uid()')
from unnest(array['reactions', 'user_showcase_posts', 'showcase_comments']) as t;
select pg_temp.policy(t, 'update_own', 'update', 'user_id = auth.uid()', 'user_id = auth.uid()')
from unnest(array['user_showcase_posts', 'showcase_comments']) as t;
select pg_temp.policy(t, 'delete_own', 'delete', 'user_id = auth.uid()')
from unnest(array['reactions', 'user_showcase_posts', 'showcase_comments']) as t;

-- Leaderboard inputs: public to signed-in users, own inserts only
select pg_temp.policy(t, 'read_authenticated', 'select', 'true')
from unnest(array['performance_stats', 'leaderboard_snapshots', 'community_activity']) as t;
select pg_temp.policy('performance_stats', 'write_own', 'insert', null, 'user_id = auth.uid()');
select pg_temp.policy('performance_stats', 'update_own', 'update', 'user_id = auth.uid()', 'user_id = auth.uid()');
select pg_temp.policy('community_activity', 'insert_own', 'insert', null, 'user_id = auth.uid()');

-- Own history, inserted by app code for the current user
select pg_temp.policy('membership_history', 'read_own', 'select', 'user_id = auth.uid()');
select pg_temp.policy('membership_history', 'insert_own', 'insert', null, 'user_id = auth.uid()');
select pg_temp.policy('access_logs', 'read_own', 'select', 'user_id = auth.uid()');

-- Wallet ledger: read own; members may only add spend rows (negative amounts)
select pg_temp.policy('referral_rewards', 'read_own', 'select', 'user_id = auth.uid()');
select pg_temp.policy('referral_rewards', 'insert_own_spend', 'insert', null,
  'user_id = auth.uid() and amount < 0');
select pg_temp.policy('referral_rewards', 'update_own', 'update', 'user_id = auth.uid()', 'user_id = auth.uid()');

-- Referrals: both sides can read; the referred user may record their referrer
do $$
begin
  if pg_temp.has_table('referrals') then
    if pg_temp.has_column('referrals', 'referred_user_id') and pg_temp.has_column('referrals', 'referred_id') then
      perform pg_temp.policy('referrals', 'read_own', 'select',
        'referrer_id = auth.uid() or referred_id = auth.uid() or referred_user_id = auth.uid()');
      perform pg_temp.policy('referrals', 'insert_as_referred', 'insert', null,
        '(referred_id = auth.uid() or referred_user_id = auth.uid()) and referrer_id <> auth.uid()');
    elsif pg_temp.has_column('referrals', 'referred_user_id') then
      perform pg_temp.policy('referrals', 'read_own', 'select',
        'referrer_id = auth.uid() or referred_user_id = auth.uid()');
      perform pg_temp.policy('referrals', 'insert_as_referred', 'insert', null,
        'referred_user_id = auth.uid() and referrer_id <> auth.uid()');
    else
      perform pg_temp.policy('referrals', 'read_own', 'select',
        'referrer_id = auth.uid() or referred_id = auth.uid()');
      perform pg_temp.policy('referrals', 'insert_as_referred', 'insert', null,
        'referred_id = auth.uid() and referrer_id <> auth.uid()');
    end if;
  end if;
end $$;

-- Affiliate payouts: affiliate reads own
select pg_temp.policy('affiliate_payouts', 'read_own', 'select', 'affiliate_id = auth.uid()');

-- Verifications: user reads/creates own; review is admin-only (admin_all)
select pg_temp.policy('verifications', 'read_own', 'select', 'user_id = auth.uid()');
select pg_temp.policy('verifications', 'insert_own', 'insert', null, 'user_id = auth.uid()');

-- Public configuration
select pg_temp.policy(t, 'read_authenticated', 'select', 'true')
from unnest(array['affiliate_tiers', 'announcements', 'system_flags']) as t;

-- optimization_logs, business_actions, security_audits, admin_logs:
-- admin only (covered by admin_all below; no member policies)

-- ─────────────────────────────────────────────────────────────────────────
-- 5. admin_all on every RLS-enabled public table
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  r record;
begin
  for r in
    select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  loop
    perform pg_temp.policy(r.relname, 'admin_all', 'all', 'public.is_admin()', 'public.is_admin()');
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Paid access: no self-granting
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  r record;
begin
  -- Drop every member write policy on these tables (admin_all + service role remain)
  for r in
    select tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename in ('subscriptions', 'course_enrollments', 'user_services', 'transactions')
       and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
       and policyname <> 'admin_all'
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Free course enrollment is still self-service
do $$
begin
  if pg_temp.has_column('course_enrollments', 'purchase_price') then
    perform pg_temp.policy('course_enrollments', 'enroll_free_own', 'insert', null,
      'user_id = auth.uid() and coalesce(purchase_price, 0) = 0');
  end if;
end $$;

-- Included (free) services are still self-service
select pg_temp.policy('user_services', 'activate_included_own', 'insert', null,
  $$user_id = auth.uid() and service_key in ('community', 'funding', 'courses', 'mentorship')$$);
select pg_temp.policy('user_services', 'update_included_own', 'update',
  $$user_id = auth.uid() and service_key in ('community', 'funding', 'courses', 'mentorship')$$,
  $$user_id = auth.uid() and service_key in ('community', 'funding', 'courses', 'mentorship')$$);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Column guards: funding_accounts status, referral_rewards amounts
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.guard_member_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  col text;
  old_j jsonb := to_jsonb(old);
  new_j jsonb := to_jsonb(new);
begin
  if public.is_privileged_session() or public.is_admin(auth.uid()) then
    return new;
  end if;
  foreach col in array tg_argv loop
    if (new_j -> col) is distinct from (old_j -> col) then
      raise exception 'Updating % is not allowed', col using errcode = '42501';
    end if;
  end loop;
  return new;
end;
$$;

do $$
begin
  if pg_temp.has_table('funding_accounts') then
    drop trigger if exists guard_funding_accounts_columns on public.funding_accounts;
    create trigger guard_funding_accounts_columns
      before update on public.funding_accounts
      for each row execute function public.guard_member_columns('status', 'user_id');
  end if;
  if pg_temp.has_table('referral_rewards') then
    drop trigger if exists guard_referral_rewards_columns on public.referral_rewards;
    create trigger guard_referral_rewards_columns
      before update on public.referral_rewards
      for each row execute function public.guard_member_columns('amount', 'user_id', 'reward_type', 'transaction_type');
  end if;
  if pg_temp.has_table('prop_firm_submissions') and pg_temp.has_column('prop_firm_submissions', 'status') then
    drop trigger if exists guard_prop_firm_submissions_columns on public.prop_firm_submissions;
    create trigger guard_prop_firm_submissions_columns
      before update on public.prop_firm_submissions
      for each row execute function public.guard_member_columns('status');
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 8. Views run with the caller's permissions
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  r record;
begin
  for r in select viewname from pg_views where schemaname = 'public' loop
    execute format('alter view public.%I set (security_invoker = on)', r.viewname);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 9. audit_log / certificates / reports
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  r record;
begin
  -- audit_log: drop "anyone can insert" policies
  for r in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'audit_log'
       and cmd = 'INSERT' and coalesce(with_check, 'true') = 'true'
  loop
    execute format('drop policy if exists %I on public.audit_log', r.policyname);
  end loop;

  -- certificates: drop public read
  for r in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'certificates'
       and cmd = 'SELECT' and coalesce(qual, '') = 'true'
  loop
    execute format('drop policy if exists %I on public.certificates', r.policyname);
  end loop;

  -- reports: drop inserts that don't bind the reporter
  if pg_temp.has_column('reports', 'reporter_id') then
    for r in
      select policyname from pg_policies
       where schemaname = 'public' and tablename = 'reports' and cmd = 'INSERT'
         and coalesce(with_check, '') not like '%reporter_id%'
    loop
      execute format('drop policy if exists %I on public.reports', r.policyname);
    end loop;
    perform pg_temp.policy('reports', 'insert_as_reporter', 'insert', null, 'reporter_id = auth.uid()');
  end if;
end $$;

select pg_temp.policy('certificates', 'read_own', 'select', 'user_id = auth.uid()')
where pg_temp.has_column('certificates', 'user_id');

-- ─────────────────────────────────────────────────────────────────────────
-- 10. Missing objects used by the code
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  entry_date date default current_date,
  trade_id uuid,
  pair text,
  session text,
  strategy_used text,
  result_r numeric,
  mood text,
  screenshot_url text,
  what_went_well text,
  mistakes_made text,
  lesson_learned text,
  plan_for_next_session text,
  setup_type text,
  timeframe text,
  bias text,
  confidence_score integer,
  rule_followed boolean,
  execution_quality integer,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Bring a pre-existing (drifted) journal_entries up to the shape the code uses
alter table public.journal_entries add column if not exists title text;
alter table public.journal_entries add column if not exists entry_date date default current_date;
alter table public.journal_entries add column if not exists trade_id uuid;
alter table public.journal_entries add column if not exists pair text;
alter table public.journal_entries add column if not exists session text;
alter table public.journal_entries add column if not exists strategy_used text;
alter table public.journal_entries add column if not exists result_r numeric;
alter table public.journal_entries add column if not exists mood text;
alter table public.journal_entries add column if not exists screenshot_url text;
alter table public.journal_entries add column if not exists what_went_well text;
alter table public.journal_entries add column if not exists mistakes_made text;
alter table public.journal_entries add column if not exists lesson_learned text;
alter table public.journal_entries add column if not exists plan_for_next_session text;
alter table public.journal_entries add column if not exists setup_type text;
alter table public.journal_entries add column if not exists timeframe text;
alter table public.journal_entries add column if not exists bias text;
alter table public.journal_entries add column if not exists confidence_score integer;
alter table public.journal_entries add column if not exists rule_followed boolean;
alter table public.journal_entries add column if not exists execution_quality integer;
alter table public.journal_entries add column if not exists tags text[] default '{}';
alter table public.journal_entries add column if not exists created_at timestamptz not null default now();
alter table public.journal_entries add column if not exists updated_at timestamptz not null default now();
create index if not exists idx_journal_entries_user_date on public.journal_entries (user_id, entry_date desc);
alter table public.journal_entries enable row level security;
select pg_temp.policy('journal_entries', 'own_rows', 'all', 'user_id = auth.uid()', 'user_id = auth.uid()');
select pg_temp.policy('journal_entries', 'admin_all', 'all', 'public.is_admin()', 'public.is_admin()');

create table if not exists public.user_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pattern_type text,
  note text,
  occurrences integer not null default 1,
  last_detected timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_user_patterns_user_last on public.user_patterns (user_id, last_detected desc);
alter table public.user_patterns enable row level security;
select pg_temp.policy('user_patterns', 'own_rows', 'all', 'user_id = auth.uid()', 'user_id = auth.uid()');
select pg_temp.policy('user_patterns', 'admin_all', 'all', 'public.is_admin()', 'public.is_admin()');

-- Code writes to audit_logs (plural) with these columns
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_user_id on public.audit_logs (user_id);
alter table public.audit_logs enable row level security;
select pg_temp.policy('audit_logs', 'insert_own', 'insert', null, 'user_id = auth.uid()');
select pg_temp.policy('audit_logs', 'admin_all', 'all', 'public.is_admin()', 'public.is_admin()');

-- Counter bump used by showcase like/comment. Allow-listed table/columns only.
create or replace function public.increment_field(table_name text, field_name text, row_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null and not public.is_privileged_session() then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if (table_name, field_name) not in (
    ('user_showcase_posts', 'likes'),
    ('user_showcase_posts', 'comments_count')
  ) then
    raise exception 'Field not allowed' using errcode = '42501';
  end if;
  execute format('update public.%I set %I = coalesce(%I, 0) + 1 where id = $1',
                 table_name, field_name, field_name)
  using row_id;
end;
$$;
revoke all on function public.increment_field(text, text, uuid) from public, anon;
grant execute on function public.increment_field(text, text, uuid) to authenticated, service_role;

-- Storage bucket for journal screenshots (private; users manage their own folder)
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('journal-screenshots', 'journal-screenshots', false)
    on conflict (id) do nothing;

    if to_regclass('storage.objects') is not null then
      drop policy if exists "journal screenshots own folder" on storage.objects;
      create policy "journal screenshots own folder" on storage.objects
        for all to authenticated
        using (bucket_id = 'journal-screenshots' and (storage.foldername(name))[1] = auth.uid()::text)
        with check (bucket_id = 'journal-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);
    end if;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 11. Indexes on unindexed foreign keys
-- ─────────────────────────────────────────────────────────────────────────
select pg_temp.fk_index(t, c) from (values
  ('subscriptions', 'plan_id'),
  ('certificates', 'course_id'),
  ('community_channels', 'created_by'),
  ('messages', 'user_id'),
  ('messages', 'author_id'),
  ('events', 'created_by'),
  ('reports', 'reporter_id'),
  ('reports', 'reviewed_by'),
  ('bans', 'admin_id'),
  ('bans', 'user_id'),
  ('muted_users', 'admin_id'),
  ('muted_users', 'user_id'),
  ('leaderboard_snapshots', 'user_id'),
  ('user_reflections', 'user_id'),
  ('showcase_comments', 'user_id'),
  ('showcase_comments', 'post_id'),
  ('affiliate_payouts', 'referral_id'),
  ('affiliate_payouts', 'affiliate_id'),
  ('verifications', 'reviewer_id'),
  ('verifications', 'user_id'),
  ('profiles', 'referred_by'),
  ('mentor_chats', 'user_id'),
  ('mentor_memory', 'user_id'),
  ('mentor_journal', 'user_id'),
  ('referral_rewards', 'user_id'),
  ('community_activity', 'user_id')
) as v(t, c);

commit;
