-- Community Hub schema updates: channels, messages, reactions, storage bucket

-- Extend community_channels with metadata required for the hub
ALTER TABLE community_channels
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Enforce category domain and slug uniqueness
ALTER TABLE community_channels
ADD CONSTRAINT IF NOT EXISTS community_channels_category_check
CHECK (category IN ('general', 'forex', 'crypto', 'signals', 'mentorship', 'announcements', 'dm'));

ALTER TABLE community_channels
ADD CONSTRAINT IF NOT EXISTS community_channels_slug_unique UNIQUE (slug);

-- Backfill slugs and categories for existing rows
UPDATE community_channels
SET
  slug = COALESCE(slug, lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))),
  category = COALESCE(category, 'general')
WHERE slug IS NULL OR category IS NULL;

ALTER TABLE community_channels
ALTER COLUMN slug SET NOT NULL;

-- Seed default channel set for the Community Hub
INSERT INTO community_channels (name, slug, description, category, is_private)
VALUES
  ('🟢 General Chat', 'general-chat', 'Hang out with everyone.', 'general', false),
  ('💬 Forex Discussion', 'forex-discussion', 'FX pairs, macro themes, and intraday setups.', 'forex', false),
  ('💰 Crypto Discussion', 'crypto-discussion', 'Digital assets, on-chain trends, and news.', 'crypto', false),
  ('📈 Signal Talk', 'signal-talk', 'Discuss shared signals, entries, and risk plans.', 'signals', false),
  ('🎓 Mentorship Room', 'mentorship-room', 'Small-group practice with mentors.', 'mentorship', false),
  ('📢 Announcements', 'announcements', 'Official updates from the team.', 'announcements', false)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_private = EXCLUDED.is_private;

-- Expand messages table to support channel linkage, attachments, threads, and moderation
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES community_channels(id),
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS thread_parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Backfill new message columns
UPDATE messages
SET author_id = COALESCE(author_id, user_id)
WHERE author_id IS NULL;

UPDATE messages
SET channel_id = (
  SELECT id FROM community_channels WHERE slug = 'general-chat' LIMIT 1
)
WHERE channel_id IS NULL;

ALTER TABLE messages ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN channel_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN attachments SET NOT NULL;
ALTER TABLE messages ALTER COLUMN is_pinned SET NOT NULL;

-- Helpful indexes for message lookups
CREATE INDEX IF NOT EXISTS idx_messages_channel_id_created_at ON messages (channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_thread_parent_id ON messages (thread_parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages (deleted_at);

-- Reactions support
CREATE TABLE IF NOT EXISTS reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 16),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- Storage bucket for community uploads (images/files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the community bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated uploads to community bucket'
  ) THEN
    CREATE POLICY "Allow authenticated uploads to community bucket"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'community-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read community bucket'
  ) THEN
    CREATE POLICY "Allow authenticated read community bucket"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'community-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous read community bucket'
  ) THEN
    CREATE POLICY "Allow anonymous read community bucket"
    ON storage.objects FOR SELECT TO anon
    USING (bucket_id = 'community-uploads');
  END IF;
END $$;

