CREATE OR REPLACE FUNCTION get_leaderboard_data(metric text)
RETURNS TABLE (
  username text,
  avatar_url text,
  xp int,
  metric_value numeric
)
AS $$
BEGIN
  IF metric = 'xp' THEN
    RETURN QUERY
      SELECT username, avatar_url, COALESCE(xp,0)::int, COALESCE(xp,0)::numeric AS metric_value
      FROM profiles
      WHERE username IS NOT NULL AND (is_profile_public IS NULL OR is_profile_public = TRUE)
      ORDER BY COALESCE(xp,0) DESC
      LIMIT 50;
  ELSIF metric = 'consistency' THEN
    RETURN QUERY
      SELECT p.username, p.avatar_url, COALESCE(p.xp,0)::int, COALESCE(ps.consistency_score,0) AS metric_value
      FROM profiles p
      JOIN performance_stats ps ON p.id = ps.user_id
      WHERE p.username IS NOT NULL AND (p.is_profile_public IS NULL OR p.is_profile_public = TRUE)
      ORDER BY COALESCE(ps.consistency_score,0) DESC
      LIMIT 50;
  ELSIF metric = 'referrals' THEN
    RETURN QUERY
      SELECT p.username, p.avatar_url, COALESCE(p.xp,0)::int, COUNT(r.id)::numeric AS metric_value
      FROM profiles p
      JOIN referrals r ON p.id = r.referrer_id
      WHERE p.username IS NOT NULL
        AND (p.is_profile_public IS NULL OR p.is_profile_public = TRUE)
        AND r.status = 'converted'
      GROUP BY p.username, p.avatar_url, p.xp
      ORDER BY COUNT(r.id) DESC
      LIMIT 50;
  ELSE
    RETURN QUERY
      SELECT p.username, p.avatar_url, COALESCE(p.xp,0)::int, COUNT(lp.id)::numeric AS metric_value
      FROM profiles p
      LEFT JOIN learning_paths lp ON p.id = lp.user_id AND lp.status = 'completed'
      WHERE p.username IS NOT NULL AND (p.is_profile_public IS NULL OR p.is_profile_public = TRUE)
      GROUP BY p.username, p.avatar_url, p.xp
      ORDER BY COUNT(lp.id) DESC
      LIMIT 50;
  END IF;
END;
$$ LANGUAGE plpgsql;

