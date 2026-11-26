-- RLS checks for 047_trader_missions. Prints PASS/FAIL per line.
-- Run after 046 and 047 on a throwaway database (see README.md).
\set QUIET on
\pset tuples_only on
set client_min_messages = warning;
insert into auth.users (id, email, raw_user_meta_data) values
 ('aaaaaaaa-0000-0000-0000-00000000000a','a@test.local','{}'),
 ('bbbbbbbb-0000-0000-0000-00000000000b','b@test.local','{}'),
 ('cccccccc-0000-0000-0000-00000000000c','admin@test.local','{}')
on conflict do nothing;
insert into public.profiles (id, email, name, role) values
 ('aaaaaaaa-0000-0000-0000-00000000000a','a@test.local','A','member'),
 ('bbbbbbbb-0000-0000-0000-00000000000b','b@test.local','B','member'),
 ('cccccccc-0000-0000-0000-00000000000c','admin@test.local','Admin','member')
on conflict (id) do nothing;
update public.profiles set role='admin' where id='cccccccc-0000-0000-0000-00000000000c';
delete from public.trader_missions;
insert into public.trader_missions (user_id, mission_date, plan)
values ('bbbbbbbb-0000-0000-0000-00000000000b', current_date, '{"goal":"B private plan"}');

create or replace function pg_temp.expect(label text, sql text, should_fail boolean) returns void language plpgsql as $$
begin
  begin
    execute sql;
    if should_fail then raise notice 'FAIL  % (allowed, expected blocked)', label; else raise notice 'PASS  %', label; end if;
  exception when others then
    if should_fail then raise notice 'PASS  % (blocked: %)', label, left(sqlerrm, 60); else raise notice 'FAIL  % (blocked: %)', label, left(sqlerrm, 80); end if;
  end;
end $$;
create or replace function pg_temp.expect_count(label text, sql text, expected int) returns void language plpgsql as $$
declare n int;
begin
  execute sql into n;
  if n = expected then raise notice 'PASS  % (%)', label, n; else raise notice 'FAIL  % (got %, expected %)', label, n, expected; end if;
end $$;
create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, false);
  perform set_config('request.jwt.claim.sub', uid, false);
  perform set_config('request.jwt.claim.role', 'authenticated', false);
end $$;
grant execute on function pg_temp.expect(text,text,boolean) to authenticated, anon;
grant execute on function pg_temp.expect_count(text,text,int) to authenticated, anon;
set client_min_messages = notice;

-- member A
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-00000000000a');
set role authenticated;
select pg_temp.expect('A saves own mission', $$insert into public.trader_missions (user_id, mission_date, plan) values (auth.uid(), current_date, '{"goal":"A"}')$$, false);
select pg_temp.expect('A upserts own mission', $$insert into public.trader_missions (user_id, mission_date, discipline) values (auth.uid(), current_date, '{"rules":{}}') on conflict (user_id, mission_date) do update set discipline = excluded.discipline$$, false);
select pg_temp.expect('A writes a mission as B', $$insert into public.trader_missions (user_id, mission_date, plan) values ('bbbbbbbb-0000-0000-0000-00000000000b', current_date - 1, '{}')$$, true);
select pg_temp.expect('A moves own row to B', $$update public.trader_missions set user_id='bbbbbbbb-0000-0000-0000-00000000000b' where user_id=auth.uid()$$, true);
select pg_temp.expect('A writes oversized plan', $$insert into public.trader_missions (user_id, mission_date, plan) values (auth.uid(), current_date - 2, jsonb_build_object('goal', repeat(md5(random()::text), 1000)))$$, true);
select pg_temp.expect_count('A sees only own rows', $$select count(*) from public.trader_missions$$, 1);
select pg_temp.expect_count('A cannot see B plan', $$select count(*) from public.trader_missions where user_id='bbbbbbbb-0000-0000-0000-00000000000b'$$, 0);
select pg_temp.expect_count('A updates B row (no effect)', $$with u as (update public.trader_missions set plan='{}' where user_id='bbbbbbbb-0000-0000-0000-00000000000b' returning 1) select count(*) from u$$, 0);
select pg_temp.expect_count('A deletes B row (no effect)', $$with d as (delete from public.trader_missions where user_id='bbbbbbbb-0000-0000-0000-00000000000b' returning 1) select count(*) from d$$, 0);
reset role;

-- admin
select pg_temp.as_user('cccccccc-0000-0000-0000-00000000000c');
set role authenticated;
select pg_temp.expect_count('admin can read all missions', $$select count(*) from public.trader_missions$$, 2);
select pg_temp.expect_count('admin cannot edit B mission', $$with u as (update public.trader_missions set plan='{}' where user_id='bbbbbbbb-0000-0000-0000-00000000000b' returning 1) select count(*) from u$$, 0);
reset role;

-- anon
select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;
select pg_temp.expect('anon reads missions', $$select count(*) from public.trader_missions$$, true);
reset role;

-- updated_at trigger
select pg_temp.expect_count('updated_at moves on update', $$with before as (select updated_at from public.trader_missions where user_id='bbbbbbbb-0000-0000-0000-00000000000b'),
  u as (update public.trader_missions set psychology='{"beforeMood":"Calm"}' where user_id='bbbbbbbb-0000-0000-0000-00000000000b' returning updated_at)
  select count(*) from u, before where u.updated_at >= before.updated_at$$, 1);
