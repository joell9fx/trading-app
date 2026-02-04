-- Smart Ad Campaign Manager schema
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  platform text,
  campaign_name text,
  ad_copy text,
  image_url text,
  targeting text,
  budget numeric,
  spend numeric DEFAULT 0,
  clicks int DEFAULT 0,
  conversions int DEFAULT 0,
  revenue numeric DEFAULT 0,
  roi numeric DEFAULT 0,
  status text DEFAULT 'draft', -- draft, active, completed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user ON ad_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform ON ad_campaigns(platform);

-- ROI helper
CREATE OR REPLACE FUNCTION update_campaign_roi()
RETURNS void AS $$
BEGIN
  UPDATE ad_campaigns
  SET roi = CASE WHEN spend > 0 THEN ((revenue - spend) / spend) * 100 ELSE 0 END,
      updated_at = now();
END;
$$ LANGUAGE plpgsql;

