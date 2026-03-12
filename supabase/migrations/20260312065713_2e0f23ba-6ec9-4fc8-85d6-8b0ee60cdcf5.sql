
-- Drop restrictive policies and recreate as permissive for queue_certificates
DROP POLICY IF EXISTS "Public read/write queue_certificates" ON public.queue_certificates;
CREATE POLICY "Allow all access queue_certificates"
ON public.queue_certificates
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Also ensure queue_orders and sessions are accessible to anon
DROP POLICY IF EXISTS "Public read/write queue_orders" ON public.queue_orders;
CREATE POLICY "Allow all access queue_orders"
ON public.queue_orders
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public read/write sessions" ON public.sessions;
CREATE POLICY "Allow all access sessions"
ON public.sessions
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public read/write chairs" ON public.chairs;
CREATE POLICY "Allow all access chairs"
ON public.chairs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public read/write restaurant_tables" ON public.restaurant_tables;
CREATE POLICY "Allow all access restaurant_tables"
ON public.restaurant_tables
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
