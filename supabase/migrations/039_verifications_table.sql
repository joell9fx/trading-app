-- Verification records for account/KYC-style workflows
create table if not exists verifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  reviewer_id uuid references profiles(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_verifications_user_id on verifications(user_id);
create index if not exists idx_verifications_status on verifications(status);

