\set QUIET on
\pset tuples_only on
set client_min_messages = warning;
-- seed users (handle_new_user creates profiles, if the trigger exists)
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
insert into public.admin_logs (action) select 'seed' where to_regclass('public.admin_logs') is not null;
insert into public.mentor_chats (user_id, role, message) select 'bbbbbbbb-0000-0000-0000-00000000000b','user','B private chat' where to_regclass('public.mentor_chats') is not null;

create or replace function pg_temp.expect(label text, sql text, should_fail boolean) returns void language plpgsql as $$
begin
  begin
    execute sql;
    if should_fail then raise notice 'FAIL  % (allowed, expected blocked)', label; else raise notice 'PASS  %', label; end if;
  exception when others then
    if should_fail then raise notice 'PASS  % (blocked: %)', label, left(sqlerrm, 60); else raise notice 'FAIL  % (blocked: %)', label, left(sqlerrm, 80); end if;
  end;
end $$;
create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, false);
  perform set_config('request.jwt.claim.sub', uid, false);
  perform set_config('request.jwt.claim.role', 'authenticated', false);
end $$;
grant execute on function pg_temp.expect(text,text,boolean) to authenticated, anon;
set client_min_messages = notice;

select pg_temp.as_user('aaaaaaaa-0000-0000-0000-00000000000a');
set role authenticated;
select pg_temp.expect('member edits own name', $$update public.profiles set name='A2' where id=auth.uid()$$, false);
select pg_temp.expect('member makes self owner', $$update public.profiles set is_owner=true where id=auth.uid()$$, true);
select pg_temp.expect('member makes self admin via role', $$update public.profiles set role='admin' where id=auth.uid()$$, true);
select pg_temp.expect('member grants self signals access', $$update public.profiles set has_signals_access=true where id=auth.uid()$$, true);
select pg_temp.expect('member sets own tier VIP', $$update public.profiles set membership_tier='Elite' where id=auth.uid()$$, true);
select pg_temp.expect('member unlocks paid service row', $$insert into public.user_services (user_id, service_key, is_unlocked) values (auth.uid(),'signals',true)$$, true);
select pg_temp.expect('member activates included service', $$insert into public.user_services (user_id, service_key, is_unlocked) values (auth.uid(),'community',true)$$, false);
select pg_temp.expect('member creates own subscription', $$insert into public.subscriptions (user_id, status) values (auth.uid(),'active')$$, true);
select pg_temp.expect('member self-credits wallet', $$insert into public.referral_rewards (user_id, reward_type, amount) values (auth.uid(),'credit',100)$$, true);
select pg_temp.expect('member spends wallet credits', $$insert into public.referral_rewards (user_id, reward_type, amount, transaction_type) values (auth.uid(),'credit',-5,'spend')$$, false);
select pg_temp.expect('member awards XP to B', $$select public.increment_xp('bbbbbbbb-0000-0000-0000-00000000000b', 50, 'x')$$, true);
select pg_temp.expect('member awards self 1000 XP', $$select public.increment_xp(auth.uid(), 1000, 'x')$$, true);
select pg_temp.expect('member awards self 25 XP', $$select public.increment_xp(auth.uid(), 25, 'x')$$, false);
select pg_temp.expect('member writes own journal entry', $$insert into public.journal_entries (user_id, title) values (auth.uid(),'my trade')$$, false);
select pg_temp.expect('member writes journal entry as B', $$insert into public.journal_entries (user_id, title) values ('bbbbbbbb-0000-0000-0000-00000000000b','x')$$, true);
select '   admin_logs rows visible to A: ' || count(*) from public.admin_logs;
\echo '-- data visibility (member A):'
select '   B mentor_chats visible to A: ' || count(*) from public.mentor_chats where user_id='bbbbbbbb-0000-0000-0000-00000000000b';
select '   system_flags readable: ' || (count(*) >= 0)::text from public.system_flags;
select '   A xp after +25: ' || xp from public.profiles where id=auth.uid();
reset role;

select pg_temp.as_user('cccccccc-0000-0000-0000-00000000000c');
set role authenticated;
select pg_temp.expect('admin sets B tier', $$update public.profiles set membership_tier='Premium' where id='bbbbbbbb-0000-0000-0000-00000000000b'$$, false);
select '   admin sees B mentor_chats: ' || count(*) from public.mentor_chats where user_id='bbbbbbbb-0000-0000-0000-00000000000b';
reset role;

select set_config('request.jwt.claims', '', false), set_config('request.jwt.claim.sub', '', false);
set role anon;
select pg_temp.expect('anon reads emails', $$select email from public.profiles limit 1$$, true);
select pg_temp.expect('anon reads usernames', $$select id, name from public.profiles limit 1$$, false);
select pg_temp.expect('anon reads mentor_chats', $$select 1/(case when count(*)=0 then 0 else 1 end) from public.mentor_chats$$, true);
reset role;

set role service_role;
select pg_temp.expect('service role sets owner flag', $$update public.profiles set is_owner=false where id='aaaaaaaa-0000-0000-0000-00000000000a'$$, false);
reset role;
