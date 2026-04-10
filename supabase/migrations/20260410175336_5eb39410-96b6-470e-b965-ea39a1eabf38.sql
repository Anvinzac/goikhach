ALTER TABLE public.sessions
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;

-- Backfill existing sessions: set expires_at to end of the day they started
UPDATE public.sessions
SET expires_at = date_trunc('day', started_at) + interval '1 day' - interval '1 second'
WHERE expires_at IS NULL;