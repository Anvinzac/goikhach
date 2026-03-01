import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RestaurantTable {
  id: string;
  session_id: string;
  floor: string;
  column_position: number;
  table_index: number;
  table_type: string;
  is_expandable: boolean;
  expanded_size: number | null;
  status: 'available' | 'occupied' | 'sharing';
  mapped_order_id: string | null;
  occupied_at: string | null;
}

export interface Chair {
  id: string;
  table_id: string;
  chair_index: number;
  is_occupied: boolean;
  mapped_order_id: string | null;
  occupied_at: string | null;
}

export function useFloorPlan(sessionId: string | undefined, floor: string) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!sessionId) return;

    const { data: tablesData } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('session_id', sessionId)
      .eq('floor', floor)
      .order('column_position')
      .order('table_index');

    if (tablesData) {
      setTables(tablesData as RestaurantTable[]);
      const tableIds = tablesData.map(t => t.id);
      if (tableIds.length > 0) {
        const { data: chairsData } = await supabase
          .from('chairs')
          .select('*')
          .in('table_id', tableIds)
          .order('chair_index');
        setChairs((chairsData || []) as Chair[]);
      }
    }
    setLoading(false);
  }, [sessionId, floor]);

  const toggleChair = useCallback(async (chairId: string, occupied: boolean, orderId?: string) => {
    const updates: Record<string, unknown> = {
      is_occupied: occupied,
      mapped_order_id: orderId || null,
      occupied_at: occupied ? new Date().toISOString() : null,
    };
    await supabase.from('chairs').update(updates).eq('id', chairId);
  }, []);

  const updateTableStatus = useCallback(async (tableId: string) => {
    const tableChairs = chairs.filter(c => c.table_id === tableId);
    const occupiedCount = tableChairs.filter(c => c.is_occupied).length;
    let status: 'available' | 'occupied' | 'sharing' = 'available';
    if (occupiedCount === tableChairs.length) status = 'occupied';
    else if (occupiedCount > 0) status = 'sharing';

    await supabase.from('restaurant_tables').update({
      status,
      occupied_at: status !== 'available' ? new Date().toISOString() : null,
    }).eq('id', tableId);
  }, [chairs]);

  const setTableMappedOrder = useCallback(async (tableId: string, orderId: string | null) => {
    await supabase.from('restaurant_tables').update({ mapped_order_id: orderId }).eq('id', tableId);
  }, []);

  const expandTable = useCallback(async (tableId: string, newSize: number) => {
    // Add extra chairs
    const tableChairs = chairs.filter(c => c.table_id === tableId);
    const currentCount = tableChairs.length;
    if (newSize > currentCount) {
      const newChairs = Array.from({ length: newSize - currentCount }, (_, i) => ({
        table_id: tableId,
        chair_index: currentCount + i,
        is_occupied: false,
      }));
      await supabase.from('chairs').insert(newChairs);
    } else if (newSize < currentCount) {
      // Remove extra unoccupied chairs from the end
      const toRemove = tableChairs.slice(newSize).filter(c => !c.is_occupied);
      if (toRemove.length > 0) {
        await supabase.from('chairs').delete().in('id', toRemove.map(c => c.id));
      }
    }
    await supabase.from('restaurant_tables').update({ expanded_size: newSize > 4 ? newSize : null }).eq('id', tableId);
    fetchData();
  }, [chairs, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`floor-${floor}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables', filter: `session_id=eq.${sessionId}` }, (payload) => {
        fetchData();
        if (payload.eventType === 'UPDATE') {
          const newRow = payload.new as RestaurantTable;
          if (newRow.floor === floor && newRow.status === 'available') {
            toast.info(`Table returned to available! (${floor === 'ground' ? 'Ground' : '1st'} Floor)`);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chairs' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, floor, fetchData]);

  return { tables, chairs, loading, toggleChair, updateTableStatus, setTableMappedOrder, expandTable, refetch: fetchData };
}
