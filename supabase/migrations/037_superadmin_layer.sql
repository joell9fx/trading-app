-- Super Admin Layer: ownership + bans + global controls
alter table profiles
  add column if not exists is_owner boolean default false,
  add column if not exists banned boolean default false;

-- Global announcements
create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  title text,
  message text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Admin action audit trail
create table if not exists admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references profiles(id),
  action text,
  module text,
  context jsonb,
  timestamp timestamptz default now()
);
create index if not exists idx_admin_logs_admin on admin_logs(admin_id);
create index if not exists idx_admin_logs_module on admin_logs(module);
create index if not exists idx_admin_logs_ts on admin_logs(timestamp desc);

-- System flags for safety/lockdown
create table if not exists system_flags (
  key text primary key,
  value boolean default false,
  updated_at timestamptz default now()
);

-- Backfill defaults
update profiles set is_owner = coalesce(is_owner, false);
update profiles set banned = coalesce(banned, false);

