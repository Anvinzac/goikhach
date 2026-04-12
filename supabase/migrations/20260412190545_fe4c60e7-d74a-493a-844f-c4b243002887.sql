
CREATE OR REPLACE FUNCTION public.auto_update_daily_notice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session_id uuid;
  v_last_called int;
  v_upcoming_numbers int[];
  v_notice text;
BEGIN
  v_session_id := COALESCE(NEW.session_id, OLD.session_id);
  IF v_session_id IS NULL THEN RETURN NEW; END IF;

  SELECT MAX(order_number) INTO v_last_called
  FROM queue_orders
  WHERE session_id = v_session_id
    AND status IN ('done', 'not_found')
    AND group_size IS NOT NULL;

  IF v_last_called IS NULL THEN
    UPDATE sessions SET daily_notice = '' WHERE id = v_session_id;
    RETURN NEW;
  END IF;

  SELECT ARRAY_AGG(order_number ORDER BY order_number)
  INTO v_upcoming_numbers
  FROM (
    SELECT order_number
    FROM queue_orders
    WHERE session_id = v_session_id
      AND status = 'waiting'
      AND group_size IS NOT NULL
      AND order_number > v_last_called
    ORDER BY order_number
    LIMIT 2
  ) sub;

  IF v_upcoming_numbers IS NULL OR array_length(v_upcoming_numbers, 1) IS NULL THEN
    UPDATE sessions SET daily_notice = '' WHERE id = v_session_id;
  ELSE
    v_notice := '📢 Số ' || array_to_string(v_upcoming_numbers, ', ') || ' vui lòng quay lại nhà hàng, số của bạn sắp được gọi! Nếu không có mặt, số sẽ bị bỏ qua 🙏';
    UPDATE sessions SET daily_notice = v_notice WHERE id = v_session_id;
  END IF;

  RETURN NEW;
END;
$function$;
