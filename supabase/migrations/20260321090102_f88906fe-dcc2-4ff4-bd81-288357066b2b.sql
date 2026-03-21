CREATE TABLE public.floor_return_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  floor TEXT NOT NULL,
  table_id UUID NULL,
  chair_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT floor_return_signals_target_check CHECK (
    (table_id IS NOT NULL)::int + (chair_id IS NOT NULL)::int = 1
  )
);

ALTER TABLE public.floor_return_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access floor_return_signals"
ON public.floor_return_signals
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX idx_floor_return_signals_session_floor_created_at
ON public.floor_return_signals (session_id, floor, created_at DESC);

CREATE INDEX idx_floor_return_signals_table_id
ON public.floor_return_signals (table_id)
WHERE table_id IS NOT NULL;

CREATE INDEX idx_floor_return_signals_chair_id
ON public.floor_return_signals (chair_id)
WHERE chair_id IS NOT NULL;