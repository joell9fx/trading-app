-- Access logs for paid feature unlocks
CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);

