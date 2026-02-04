-- Add AI tools access flag to profiles
alter table profiles
  add column if not exists has_ai_tools_access boolean default false;

-- Backfill nulls to default
update profiles
  set has_ai_tools_access = coalesce(has_ai_tools_access, false);


