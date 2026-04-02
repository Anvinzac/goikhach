import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KioskState {
  currentOrderNumber: number | null;
  secretCode: string | null;
  sessionId: string | null;
  sessionType: string | null;
  loading: boolean;
  noSession: boolean;
  allUsed: boolean;
  claimed: boolean;
}

function generateSecretCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// We use queue_certificates with group_size=0 as "kiosk pending" placeholders.
// When a customer claims it, group_size gets set to the real value.
// When the kiosk advances, unclaimed placeholders are invalidated (is_used=true).

export function useKiosk() {
  const [state, setState] = useState<KioskState>({
    currentOrderNumber: null,
    secretCode: null,
    sessionId: null,
    sessionType: null,
    loading: true,
    noSession: false,
    allUsed: false,
    claimed: false,
  });
  const advancingRef = useRef(false);
  const currentCertIdRef = useRef<string | null>(null);

  // Find the next available order number (group_size is null, status waiting, not 13,
  // and no staff-created certificate exists for it)
  const findNextAvailable = useCallback(async (sessionId: string): Promise<{ orderNumber: number; orderId: string } | null> => {
    // Get order_ids that already have a staff-created cert (group_size > 0)
    const { data: staffCerts } = await supabase
      .from('queue_certificates')
      .select('order_id')
      .eq('session_id', sessionId)
      .gt('group_size', 0);

    const staffOrderIds = new Set((staffCerts || []).map(c => c.order_id));

    const { data: orders } = await supabase
      .from('queue_orders')
      .select('id, order_number, group_size, status')
      .eq('session_id', sessionId)
      .eq('status', 'waiting')
      .is('group_size', null)
      .neq('order_number', 13)
      .order('order_number')
      .limit(10); // fetch a few to filter client-side

    if (!orders || orders.length === 0) return null;

    const eligible = orders.find(o => !staffOrderIds.has(o.id));
    if (!eligible) return null;
    return { orderNumber: eligible.order_number, orderId: eligible.id };
  }, []);

  // Create a kiosk placeholder certificate for a given order
  const createKioskCert = useCallback(async (
    sessionId: string,
    orderId: string,
    orderNumber: number,
  ): Promise<{ secretCode: string; certId: string } | null> => {
    // Invalidate any existing unclaimed kiosk placeholders for this session
    // (group_size=0 means kiosk pending, is_used=false means unclaimed)
    await supabase
      .from('queue_certificates')
      .update({ is_used: true })
      .eq('session_id', sessionId)
      .eq('group_size', 0)
      .eq('is_used', false);

    const secret = generateSecretCode();
    const { data, error } = await supabase
      .from('queue_certificates')
      .insert({
        order_id: orderId,
        session_id: sessionId,
        order_number: orderNumber,
        secret_code: secret,
        group_size: 0, // sentinel: kiosk pending
        is_used: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create kiosk certificate:', error);
      return null;
    }
    return { secretCode: secret, certId: data.id };
  }, []);

  // Initialize: find active session, find next order, create placeholder cert
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) {
      setState(prev => ({ ...prev, loading: false, noSession: true }));
      return;
    }

    const next = await findNextAvailable(session.id);
    if (!next) {
      setState(prev => ({
        ...prev,
        loading: false,
        sessionId: session.id,
        sessionType: session.session_type,
        allUsed: true,
      }));
      return;
    }

    const result = await createKioskCert(session.id, next.orderId, next.orderNumber);
    currentCertIdRef.current = result?.certId ?? null;

    setState({
      currentOrderNumber: next.orderNumber,
      secretCode: result?.secretCode ?? null,
      sessionId: session.id,
      sessionType: session.session_type,
      loading: false,
      noSession: false,
      allUsed: false,
      claimed: false,
    });
  }, [findNextAvailable, createKioskCert]);

  // Advance to next order number
  const advance = useCallback(async () => {
    if (advancingRef.current || !state.sessionId) return;
    advancingRef.current = true;

    try {
      const next = await findNextAvailable(state.sessionId);
      if (!next) {
        setState(prev => ({ ...prev, allUsed: true, currentOrderNumber: null, secretCode: null }));
        currentCertIdRef.current = null;
        return;
      }

      const result = await createKioskCert(state.sessionId, next.orderId, next.orderNumber);
      currentCertIdRef.current = result?.certId ?? null;

      setState(prev => ({
        ...prev,
        currentOrderNumber: next.orderNumber,
        secretCode: result?.secretCode ?? null,
        allUsed: false,
        claimed: false,
      }));
    } finally {
      advancingRef.current = false;
    }
  }, [state.sessionId, findNextAvailable, createKioskCert]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for certificate changes (customer claimed) and queue_orders changes (staff assigned)
  useEffect(() => {
    if (!state.sessionId) return;

    const channel = supabase
      .channel('kiosk-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queue_certificates', filter: `session_id=eq.${state.sessionId}` },
        (payload) => {
          // When our current placeholder gets claimed (group_size changed from 0)
          const updated = payload.new as any;
          if (
            updated.id === currentCertIdRef.current &&
            updated.group_size > 0
          ) {
            advance();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queue_orders', filter: `session_id=eq.${state.sessionId}` },
        (payload) => {
          // When the current order gets a group_size assigned by staff, advance
          const updated = payload.new as any;
          if (
            updated.order_number === state.currentOrderNumber &&
            updated.group_size !== null
          ) {
            advance();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.sessionId, state.currentOrderNumber, advance]);

  return { ...state, refresh: initialize };
}
