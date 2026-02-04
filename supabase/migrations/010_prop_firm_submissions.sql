-- Create prop_firm_submissions table
CREATE TABLE IF NOT EXISTS prop_firm_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    account_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backfill & ensure columns exist for incremental deploys
ALTER TABLE prop_firm_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE prop_firm_submissions ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE prop_firm_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE prop_firm_submissions SET status = COALESCE(status, 'Pending'), updated_at = COALESCE(updated_at, NOW());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'prop_firm_submissions_status_check'
  ) THEN
    ALTER TABLE prop_firm_submissions 
      ADD CONSTRAINT prop_firm_submissions_status_check 
      CHECK (status IN ('Pending', 'Approved', 'Rejected'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prop_firm_submissions_user_id ON prop_firm_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_prop_firm_submissions_created_at ON prop_firm_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_prop_firm_submissions_status ON prop_firm_submissions(status);

-- Enable RLS
ALTER TABLE prop_firm_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own prop firm submissions" ON prop_firm_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prop firm submissions" ON prop_firm_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all prop firm submissions" ON prop_firm_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can update prop firm submissions'
  ) THEN
    CREATE POLICY "Admins can update prop firm submissions" ON prop_firm_submissions
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
      );
  END IF;
END $$;

-- Updated-at trigger
DROP TRIGGER IF EXISTS update_prop_firm_submissions_updated_at ON prop_firm_submissions;
CREATE TRIGGER update_prop_firm_submissions_updated_at
BEFORE UPDATE ON prop_firm_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

