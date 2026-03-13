-- Trade annotations: drawing overlay data for journal entry screenshots
CREATE TABLE IF NOT EXISTS public.trade_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  annotation_data jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(journal_entry_id)
);

CREATE INDEX IF NOT EXISTS idx_trade_annotations_journal_entry ON public.trade_annotations(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_trade_annotations_user ON public.trade_annotations(user_id);

ALTER TABLE public.trade_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade annotations"
  ON public.trade_annotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade annotations"
  ON public.trade_annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade annotations"
  ON public.trade_annotations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade annotations"
  ON public.trade_annotations FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.trade_annotations IS 'Canvas annotation data (arrows, shapes, markers) for journal entry screenshots';
