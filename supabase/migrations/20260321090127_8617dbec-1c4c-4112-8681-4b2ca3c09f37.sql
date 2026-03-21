DROP POLICY IF EXISTS "Allow all access floor_return_signals" ON public.floor_return_signals;

CREATE POLICY "Public can read floor return signals"
ON public.floor_return_signals
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can create valid floor return signals"
ON public.floor_return_signals
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (
    table_id IS NOT NULL
    AND chair_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.restaurant_tables rt
      WHERE rt.id = floor_return_signals.table_id
        AND rt.session_id = floor_return_signals.session_id
        AND rt.floor = floor_return_signals.floor
    )
  )
  OR
  (
    chair_id IS NOT NULL
    AND table_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.chairs c
      JOIN public.restaurant_tables rt ON rt.id = c.table_id
      WHERE c.id = floor_return_signals.chair_id
        AND rt.session_id = floor_return_signals.session_id
        AND rt.floor = floor_return_signals.floor
    )
  )
);