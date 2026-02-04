-- Admin Moderation schema: reports, moderation actions, bans, mutes

-- Reports table to store flagged content
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_message_id ON reports(message_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Moderation audit log
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES community_channels(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_admin ON moderation_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON moderation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_message ON moderation_actions(message_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_channel ON moderation_actions(channel_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created_at ON moderation_actions(created_at);

-- Bans table
CREATE TABLE IF NOT EXISTS bans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_bans_user_active ON bans(user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bans_expires_at ON bans(expires_at);

-- Muted users table
CREATE TABLE IF NOT EXISTS muted_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_muted_users_user_active ON muted_users(user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_muted_users_expires_at ON muted_users(expires_at);

-- Archive support for community channels
ALTER TABLE community_channels
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE muted_users ENABLE ROW LEVEL SECURITY;

-- Helper predicates for admin/moderator checks
-- Policies use inline role checks against profiles

-- Reports policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Reports readable by admins or reporter'
  ) THEN
    CREATE POLICY "Reports readable by admins or reporter" ON reports
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
      OR reporter_id = auth.uid()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Reports insert by authenticated users'
  ) THEN
    CREATE POLICY "Reports insert by authenticated users" ON reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Reports update by admins'
  ) THEN
    CREATE POLICY "Reports update by admins" ON reports
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
    );
  END IF;
END $$;

-- Moderation actions policies (admin only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Moderation actions readable by admins'
  ) THEN
    CREATE POLICY "Moderation actions readable by admins" ON moderation_actions
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Moderation actions insert by admins'
  ) THEN
    CREATE POLICY "Moderation actions insert by admins" ON moderation_actions
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
    );
  END IF;
END $$;

-- Ban policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Bans readable by admins or self'
  ) THEN
    CREATE POLICY "Bans readable by admins or self" ON bans
    FOR SELECT USING (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Bans insert by admins'
  ) THEN
    CREATE POLICY "Bans insert by admins" ON bans
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Bans update by admins'
  ) THEN
    CREATE POLICY "Bans update by admins" ON bans
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
    );
  END IF;
END $$;

-- Muted users policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Mutes readable by admins or self'
  ) THEN
    CREATE POLICY "Mutes readable by admins or self" ON muted_users
    FOR SELECT USING (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Mutes insert by admins'
  ) THEN
    CREATE POLICY "Mutes insert by admins" ON muted_users
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Mutes update by admins'
  ) THEN
    CREATE POLICY "Mutes update by admins" ON muted_users
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'MODERATOR'))
    );
  END IF;
END $$;


