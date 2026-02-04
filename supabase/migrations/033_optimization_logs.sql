-- Optimization logs for AI ROI engine
CREATE TABLE IF NOT EXISTS optimization_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  old_roi numeric,
  new_roi numeric,
  recommendation text,
  adjustment text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_optimization_logs_campaign ON optimization_logs(campaign_id);

