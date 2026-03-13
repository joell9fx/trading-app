-- Structured trade tags for journal_entries (setup type, timeframe, bias, confidence, rule followed, execution quality)
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS setup_type text,
  ADD COLUMN IF NOT EXISTS timeframe text,
  ADD COLUMN IF NOT EXISTS bias text,
  ADD COLUMN IF NOT EXISTS confidence_score smallint,
  ADD COLUMN IF NOT EXISTS rule_followed boolean,
  ADD COLUMN IF NOT EXISTS execution_quality smallint;

COMMENT ON COLUMN public.journal_entries.setup_type IS 'e.g. Breakout, SMC, Pullback';
COMMENT ON COLUMN public.journal_entries.timeframe IS 'e.g. 1H, 4H, D1';
COMMENT ON COLUMN public.journal_entries.bias IS 'bullish, bearish, neutral';
COMMENT ON COLUMN public.journal_entries.confidence_score IS '1-10';
COMMENT ON COLUMN public.journal_entries.rule_followed IS 'yes/no';
COMMENT ON COLUMN public.journal_entries.execution_quality IS '1-10';
