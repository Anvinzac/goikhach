import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QueueOrder {
  id: string;
  session_id: string;
  order_number: number;
  group_size: number | null;
  previous_group_size: number | null;
  status: 'waiting' | 'done' | 'cancelled' | 'not_found';
  notes: string[];
  custom_note: string | null;
  reached_table_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useQueueOrders(sessionId: string | undefined) {
  const [orders, setOrders] = useState<QueueOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!sessionId) return;
    const { data, error } = await supabase
      .from('queue_orders')
      .select('*')
      .eq('session_id', sessionId)
      .order('order_number');

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    setOrders((data || []) as QueueOrder[]);
    setLoading(false);
  }, [sessionId]);

  const updateOrder = useCallback(async (id: string, updates: Partial<QueueOrder>) => {
    const currentOrder = orders.find(o => o.id === id);
    const isFirstRegistration = currentOrder && currentOrder.group_size === null && updates.group_size != null;
    const isBecomingDone = updates.status === 'done' && currentOrder?.status !== 'done';
    const dbUpdates: Record<string, unknown> = { ...updates };
    if (isFirstRegistration) {
      dbUpdates.updated_at = new Date().toISOString();
    }
    if (isBecomingDone) {
      dbUpdates.reached_table_at = new Date().toISOString();
    }
    if (updates.status && updates.status !== 'done') {
      dbUpdates.reached_table_at = null;
    }

    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates, ...(isFirstRegistration ? { updated_at: new Date().toISOString() } : {}) } : o));

    const { error } = await supabase
      .from('queue_orders')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update order');
      fetchOrders(); // Revert on error
    }
  }, [fetchOrders, orders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('queue-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_orders', filter: `session_id=eq.${sessionId}` },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchOrders]);

  return { orders, loading, updateOrder, refetch: fetchOrders };
}
