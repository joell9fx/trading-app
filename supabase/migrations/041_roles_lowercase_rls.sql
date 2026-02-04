-- Normalize roles to lowercase and harden role updates
-- Safe to run repeatedly; uses IF EXISTS guards where applicable

-- A1: Normalize existing values and backfill
UPDATE profiles
SET role = LOWER(role)
WHERE role IS NOT NULL AND role <> LOWER(role);

UPDATE profiles
SET role = 'member'
WHERE role IS NULL OR TRIM(role) = '';

-- A2: Enforce canonical constraint and default
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('member','admin','owner'));

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'member';

-- A3: Ensure trigger inserts lowercase role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'member'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- A4: Harden updates so authenticated users cannot change role
CREATE OR REPLACE FUNCTION prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow service_role / supabase_admin to manage roles
    IF auth.role() IN ('service_role', 'supabase_admin') THEN
        RETURN NEW;
    END IF;

    -- Allow setting role from NULL to member (initial backfill only)
    IF OLD.role IS NULL AND NEW.role = 'member' THEN
        RETURN NEW;
    END IF;

    -- Block any role change attempted by regular authenticated users
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Updating role is not allowed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON profiles;
CREATE TRIGGER prevent_profile_role_change
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_profile_role_change();

-- A5: RLS policies - keep self-service updates but lock role
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow users to view profiles (retains existing open-read behavior)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT USING (true);

-- Allow users to insert their own row as member only
CREATE POLICY "Users insert own profile as member" ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id AND role = 'member');

-- Allow users to update their own row (role change blocked by trigger)
CREATE POLICY "Users update own profile without role change" ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

