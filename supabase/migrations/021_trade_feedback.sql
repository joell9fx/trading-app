-- AI feedback fields on trades
ALTER TABLE user_trades ADD COLUMN IF NOT EXISTS ai_feedback TEXT;
ALTER TABLE user_trades ADD COLUMN IF NOT EXISTS feedback_sentiment TEXT;

