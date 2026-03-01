
-- Sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL CHECK (session_type IN ('lunch', 'dinner')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

-- Queue orders table
CREATE TABLE public.queue_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  group_size INTEGER,
  previous_group_size INTEGER,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'done', 'cancelled', 'not_found')),
  notes TEXT[] DEFAULT '{}',
  custom_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.queue_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write queue_orders" ON public.queue_orders FOR ALL USING (true) WITH CHECK (true);

-- Tables (restaurant tables)
CREATE TABLE public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  floor TEXT NOT NULL CHECK (floor IN ('ground', 'first')),
  column_position INTEGER NOT NULL,
  table_index INTEGER NOT NULL,
  table_type TEXT NOT NULL CHECK (table_type IN ('small', 'big')),
  is_expandable BOOLEAN NOT NULL DEFAULT false,
  expanded_size INTEGER,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'sharing')),
  mapped_order_id UUID REFERENCES public.queue_orders(id),
  occupied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write restaurant_tables" ON public.restaurant_tables FOR ALL USING (true) WITH CHECK (true);

-- Chairs
CREATE TABLE public.chairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  chair_index INTEGER NOT NULL,
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  mapped_order_id UUID REFERENCES public.queue_orders(id),
  occupied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write chairs" ON public.chairs FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chairs;

-- Indexes
CREATE INDEX idx_queue_orders_session ON public.queue_orders(session_id);
CREATE INDEX idx_queue_orders_status ON public.queue_orders(status);
CREATE INDEX idx_restaurant_tables_session ON public.restaurant_tables(session_id);
CREATE INDEX idx_chairs_table ON public.chairs(table_id);
