-- Security audits and findings
CREATE TABLE IF NOT EXISTS security_audits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category text,
  issue text,
  severity text,
  recommendation text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audits_status ON security_audits(status);

