ALTER TABLE public.queue_orders
ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP WITH TIME ZONE;

UPDATE public.queue_orders
SET registered_at = CASE
  WHEN group_size IS NOT NULL THEN COALESCE(registered_at, updated_at)
  ELSE registered_at
END
WHERE registered_at IS NULL;