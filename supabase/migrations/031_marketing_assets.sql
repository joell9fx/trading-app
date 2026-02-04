-- Marketing assets history
CREATE TABLE IF NOT EXISTS marketing_assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  asset_type text, -- caption, email, ad, image
  content text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_assets_user ON marketing_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_assets_type ON marketing_assets(asset_type);

