-- Performance reports: saved analytics snapshots per user
CREATE TABLE IF NOT EXISTS public.performance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL DEFAULT 'custom',
  title text,
  date_from date,
  date_to date,
  total_trades integer,
  win_rate numeric,
  total_r numeric,
  avg_r numeric,
  best_trade numeric,
  worst_trade numeric,
  report_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_reports_user_id ON public.performance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reports_created_at ON public.performance_reports(created_at DESC);

ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance reports"
  ON public.performance_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance reports"
  ON public.performance_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance reports"
  ON public.performance_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own performance reports"
  ON public.performance_reports FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.performance_reports IS 'Saved performance analytics snapshots from journal entries';
