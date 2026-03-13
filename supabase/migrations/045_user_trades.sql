-- user_trades: executed trade log used by Signals dashboard, trade replay, analytics, mentor, and feedback.
-- Migrations 018 and 021 ALTER this table; the base table was missing and is created here.

CREATE TABLE IF NOT EXISTS public.user_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    pair TEXT,
    direction TEXT,
    entry_price NUMERIC,
    exit_price NUMERIC,
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    risk_reward NUMERIC,
    result TEXT,
    profit NUMERIC,
    risked_amount NUMERIC,
    ai_feedback TEXT,
    feedback_sentiment TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_trades_user_id ON public.user_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trades_created_at ON public.user_trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_trades_entry_time ON public.user_trades(entry_time DESC NULLS LAST);

ALTER TABLE public.user_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own trades"
    ON public.user_trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
    ON public.user_trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
    ON public.user_trades FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
