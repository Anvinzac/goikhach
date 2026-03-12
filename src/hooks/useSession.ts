import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Session {
  id: string;
  session_type: string;
  started_at: string;
  is_active: boolean;
  daily_notice: string;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSession = useCallback(async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching session:', error);
    }
    setSession(data);
    setLoading(false);
  }, []);

  const startNewSession = useCallback(async (type: 'lunch' | 'dinner') => {
    // Deactivate old sessions
    await supabase.from('sessions').update({ is_active: false }).eq('is_active', true);

    const { data, error } = await supabase
      .from('sessions')
      .insert({ session_type: type, is_active: true })
      .select()
      .single();

    if (error) {
      toast.error('Failed to start session');
      return;
    }

    // Initialize 80 queue orders
    const orders = Array.from({ length: 80 }, (_, i) => ({
      session_id: data.id,
      order_number: i + 1,
      status: 'waiting' as const,
      notes: [],
    }));

    await supabase.from('queue_orders').insert(orders);

    // Initialize restaurant tables and chairs
    const tableConfigs = [
      // Ground floor
      ...Array.from({ length: 5 }, (_, i) => ({
        session_id: data.id, floor: 'ground', column_position: 0, table_index: i,
        table_type: 'big', is_expandable: i >= 3, chair_count: 4,
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        session_id: data.id, floor: 'ground', column_position: 1, table_index: i,
        table_type: 'small', is_expandable: false, chair_count: 2,
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        session_id: data.id, floor: 'ground', column_position: 2, table_index: i,
        table_type: 'small', is_expandable: false, chair_count: 2,
      })),
      // First floor
      ...Array.from({ length: 3 }, (_, i) => ({
        session_id: data.id, floor: 'first', column_position: 0, table_index: i,
        table_type: 'small', is_expandable: false, chair_count: 2,
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        session_id: data.id, floor: 'first', column_position: 1, table_index: i,
        table_type: 'big', is_expandable: true, chair_count: 4,
      })),
      {
        session_id: data.id, floor: 'first', column_position: 2, table_index: 0,
        table_type: 'big', is_expandable: false, chair_count: 4,
      },
    ];

    for (const config of tableConfigs) {
      const { chair_count, ...tableData } = config;
      const { data: tableRow } = await supabase
        .from('restaurant_tables')
        .insert(tableData)
        .select()
        .single();

      if (tableRow) {
        const chairs = Array.from({ length: chair_count }, (_, i) => ({
          table_id: tableRow.id,
          chair_index: i,
          is_occupied: false,
        }));
        await supabase.from('chairs').insert(chairs);
      }
    }

    setSession(data);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} session started!`);
  }, []);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  return { session, loading, startNewSession, refreshSession: fetchActiveSession };
}
