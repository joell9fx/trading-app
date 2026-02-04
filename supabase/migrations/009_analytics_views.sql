-- Analytics views for moderation and activity dashboards

CREATE OR REPLACE VIEW daily_message_count AS
SELECT
  date(created_at) AS day,
  COUNT(*) AS message_count,
  COUNT(DISTINCT author_id) AS unique_authors
FROM messages
WHERE deleted_at IS NULL
GROUP BY day
ORDER BY day DESC
LIMIT 90;

CREATE OR REPLACE VIEW top_channels_by_message_count AS
SELECT
  c.id AS channel_id,
  c.name AS channel_name,
  c.slug,
  COUNT(m.id) AS message_count
FROM community_channels c
LEFT JOIN messages m ON m.channel_id = c.id AND m.deleted_at IS NULL AND m.created_at > NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name, c.slug
ORDER BY message_count DESC
LIMIT 10;

CREATE OR REPLACE VIEW moderation_summary_by_type AS
SELECT
  action_type,
  COUNT(*) AS action_count
FROM moderation_actions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY action_type
ORDER BY action_count DESC;

CREATE OR REPLACE VIEW active_users_per_day AS
SELECT
  date(created_at) AS day,
  COUNT(DISTINCT author_id) AS active_users
FROM messages
WHERE deleted_at IS NULL
GROUP BY day
ORDER BY day DESC
LIMIT 90;

