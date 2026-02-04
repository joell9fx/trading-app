-- Migration: Add expanded roles and role-based permissions
-- This migration expands the role system and adds permission checking

-- Step 1: Update profiles table to support more roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('VIEWER', 'MEMBER', 'TRADER', 'ADMIN', 'MODERATOR'));

-- Step 2: Create role_permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

-- Step 3: Create plan_features table to map plan features
CREATE TABLE IF NOT EXISTS plan_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  feature_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, feature_name)
);

-- Step 4: Insert default role permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  -- VIEWER: Read-only access
  ('VIEWER', 'courses', 'view_basic'),
  ('VIEWER', 'community', 'view'),
  ('VIEWER', 'signals', 'view_basic'),
  
  -- MEMBER: Standard member access
  ('MEMBER', 'courses', 'view_basic'),
  ('MEMBER', 'courses', 'enroll'),
  ('MEMBER', 'community', 'view'),
  ('MEMBER', 'community', 'post'),
  ('MEMBER', 'signals', 'view_basic'),
  ('MEMBER', 'chat', 'participate'),
  
  -- TRADER: Enhanced trading features
  ('TRADER', 'courses', 'view_all'),
  ('TRADER', 'courses', 'enroll'),
  ('TRADER', 'community', 'view'),
  ('TRADER', 'community', 'post'),
  ('TRADER', 'signals', 'view_priority'),
  ('TRADER', 'signals', 'create'),
  ('TRADER', 'mentorship', 'book'),
  ('TRADER', 'chat', 'participate'),
  
  -- MODERATOR: Community moderation
  ('MODERATOR', 'courses', 'view_all'),
  ('MODERATOR', 'community', 'moderate'),
  ('MODERATOR', 'community', 'delete_posts'),
  ('MODERATOR', 'signals', 'view_all'),
  ('MODERATOR', 'chat', 'moderate'),
  
  -- ADMIN: Full access
  ('ADMIN', 'courses', 'manage'),
  ('ADMIN', 'community', 'manage'),
  ('ADMIN', 'signals', 'manage'),
  ('ADMIN', 'mentorship', 'manage'),
  ('ADMIN', 'users', 'manage'),
  ('ADMIN', 'settings', 'manage'),
  ('ADMIN', 'chat', 'manage')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Step 5: Create function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_has_permission BOOLEAN;
BEGIN
  -- Get user's role
  SELECT role INTO v_role
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if role has permission
  SELECT allowed INTO v_has_permission
  FROM role_permissions
  WHERE role = v_role
    AND resource = p_resource
    AND action = p_action;
  
  -- Return true if permission exists and is allowed
  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to get user's active subscription plan
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TABLE (
  plan_id UUID,
  plan_name TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan_id,
    p.name as plan_name,
    s.status,
    s.current_period_end
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND s.current_period_end > NOW()
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Step 8: Enable RLS on new tables
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Step 9: RLS Policies
CREATE POLICY "Anyone can view role permissions" ON role_permissions FOR SELECT USING (true);
CREATE POLICY "Anyone can view plan features" ON plan_features FOR SELECT USING (true);

-- Step 10: Update existing users to have appropriate roles (if needed)
-- This keeps existing ADMIN users as ADMIN, others become MEMBER
UPDATE profiles 
SET role = CASE 
  WHEN role = 'ADMIN' THEN 'ADMIN'
  ELSE 'MEMBER'
END
WHERE role IS NOT NULL;

