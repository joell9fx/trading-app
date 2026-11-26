-- 047_trader_missions.sql
-- Stores each member's daily Trader Mission (plan, discipline checklist,
-- psychology check, completion) so it follows them across devices.
-- Previously this lived only in the browser's localStorage.
--
-- Additive and idempotent: creates one table, its policies and a trigger.
-- Depends on public.is_admin() from 046 for the admin read policy; that
-- policy is skipped if 046 hasn't been applied yet.

create table if not exists public.trader_missions (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  mission_date date        not null,
  plan         jsonb,
  discipline   jsonb,
  psychology   jsonb,
  completion   jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, mission_date),
  -- Keep rows small: each part is a small JSON object written by the app.
  constraint trader_missions_size check (
    coalesce(pg_column_size(plan), 0)
    + coalesce(pg_column_size(discipline), 0)
    + coalesce(pg_column_size(psychology), 0)
    + coalesce(pg_column_size(completion), 0) < 16384
  )
);

alter table public.trader_missions enable row level security;

drop policy if exists trader_missions_select_own on public.trader_missions;
create policy trader_missions_select_own on public.trader_missions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists trader_missions_insert_own on public.trader_missions;
create policy trader_missions_insert_own on public.trader_missions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists trader_missions_update_own on public.trader_missions;
create policy trader_missions_update_own on public.trader_missions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists trader_missions_delete_own on public.trader_missions;
create policy trader_missions_delete_own on public.trader_missions
  for delete to authenticated using (user_id = auth.uid());

do $$
begin
  if to_regprocedure('public.is_admin(uuid)') is not null then
    execute 'drop policy if exists trader_missions_admin_select on public.trader_missions';
    execute 'create policy trader_missions_admin_select on public.trader_missions
               for select to authenticated using (public.is_admin(auth.uid()))';
  end if;
end $$;

create or replace function public.trader_missions_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trader_missions_touch_updated_at on public.trader_missions;
create trigger trader_missions_touch_updated_at
  before update on public.trader_missions
  for each row execute function public.trader_missions_touch_updated_at();

grant select, insert, update, delete on public.trader_missions to authenticated;
revoke all on public.trader_missions from anon;
