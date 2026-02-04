-- Add AI tools flag to users table (if present) and ensure profiles stay in sync
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'users'
  ) THEN
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS has_ai_tools_access boolean DEFAULT false;
    UPDATE users
      SET has_ai_tools_access = COALESCE(has_ai_tools_access, false);
  END IF;
END$$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_ai_tools_access boolean DEFAULT false;

UPDATE profiles
  SET has_ai_tools_access = COALESCE(has_ai_tools_access, false);

-- Create verification tracking table
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  status text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  reviewer_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS verifications_user_id_idx ON verifications(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_verifications_updated_at'
  ) THEN
    CREATE TRIGGER update_verifications_updated_at
    BEFORE UPDATE ON verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;


