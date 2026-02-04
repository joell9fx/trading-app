-- Align profiles.role to member/admin/owner with safe defaults

-- Ensure role column exists
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT;

-- Default all existing / future users to member
UPDATE profiles SET role = 'member' WHERE role IS NULL;

-- Relax and reset constraint to accept new canonical roles while tolerating legacy ones
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (LOWER(role) IN ('member', 'admin', 'owner', 'trader', 'viewer', 'moderator'));

-- Set default to member going forward
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'member';
