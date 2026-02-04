-- Add progressive access flags to user profiles
alter table profiles
  add column if not exists has_signals_access boolean default false,
  add column if not exists has_funding_access boolean default true,
  add column if not exists has_courses_access boolean default true,
  add column if not exists has_mentorship_access boolean default true;

-- Backfill existing records with the intended defaults
update profiles set has_signals_access = coalesce(has_signals_access, false);
update profiles set has_funding_access = coalesce(has_funding_access, true);
update profiles set has_courses_access = coalesce(has_courses_access, true);
update profiles set has_mentorship_access = coalesce(has_mentorship_access, true);

