-- Add is_admin flag to profiles for admin portal access
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

