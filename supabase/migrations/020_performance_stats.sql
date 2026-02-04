-- Trading performance stats
CREATE TABLE IF NOT EXISTS performance_stats (
    user_id UUID REFERENCES profiles(id) PRIMARY KEY,
    total_trades INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    breakevens INT DEFAULT 0,
    avg_rr NUMERIC DEFAULT 0,
    win_rate NUMERIC DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    consistency_score NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_stats_win_rate ON performance_stats(win_rate);

