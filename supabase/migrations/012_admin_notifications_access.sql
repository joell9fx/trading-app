-- Ensure notifications table has is_resolved and admin policies
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT FALSE;

-- Index for resolved filter
CREATE INDEX IF NOT EXISTS idx_notifications_is_resolved ON notifications(is_resolved);

-- Admin policies for full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Admins can view all notifications') THEN
    CREATE POLICY "Admins can view all notifications" ON notifications
      FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Admins can update notifications') THEN
    CREATE POLICY "Admins can update notifications" ON notifications
      FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Admins can delete notifications') THEN
    CREATE POLICY "Admins can delete notifications" ON notifications
      FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
  END IF;
END $$;

