
-- Add daily_notice to sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS daily_notice text DEFAULT '';

-- Add reached_table_at to queue_orders for tracking when customer reaches table
ALTER TABLE public.queue_orders ADD COLUMN IF NOT EXISTS reached_table_at timestamp with time zone DEFAULT NULL;

-- Create queue_certificates table
CREATE TABLE public.queue_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.queue_orders(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  secret_code text UNIQUE NOT NULL,
  order_number integer NOT NULL,
  group_size integer NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  browser_token text DEFAULT NULL,
  customer_name text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.queue_certificates ENABLE ROW LEVEL SECURITY;

-- Public read/write for queue_certificates (matches existing pattern)
CREATE POLICY "Public read/write queue_certificates"
ON public.queue_certificates
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Enable realtime for certificates
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_certificates;
