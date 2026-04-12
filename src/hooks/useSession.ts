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

function getSessionWindow(): { type: 'lunch' | 'dinner'; expiresAt: Date } | null {
  const now = new Date();
  const h = now.getHours();

  if (h >= 10 && h < 15) {
    const expires = new Date(now);
    expires.setHours(15, 0, 0, 0);
    return { type: 'lunch', expiresAt: expires };
  }
  if (h >= 15) {
    // Dinner expires at 10AM next day
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 1);
    expires.setHours(10, 0, 0, 0);
    return { type: 'dinner', expiresAt: expires };
  }
  if (h < 10) {
    // Before 10AM — check if there's a dinner session still valid from last night
    // (its expiry would be today at 10AM, so it's still within window)
    const expires = new Date(now);
    expires.setHours(10, 0, 0, 0);
    return { type: 'dinner', expiresAt: expires };
  }
  return null;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createSession = useCallback(async (type: 'lunch' | 'dinner', expiresAt: Date, dailyNotice?: string) => {
    // Clean up all old sessions and their data
    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('id');

    const sessionIds = (existingSessions || []).map((s) => s.id);

    if (sessionIds.length > 0) {
      const { data: existingTables } = await supabase
        .from('restaurant_tables')
        .select('id')
        .in('session_id', sessionIds);

      const tableIds = (existingTables || []).map((t) => t.id);

      if (tableIds.length > 0) {
        await supabase.from('chairs').delete().in('table_id', tableIds);
      }

      await Promise.all([
        supabase.from('queue_certificates').delete().in('session_id', sessionIds),
        supabase.from('queue_orders').delete().in('session_id', sessionIds),
        supabase.from('floor_return_signals').delete().in('session_id', sessionIds),
        supabase.from('restaurant_tables').delete().in('session_id', sessionIds),
      ]);

      await supabase.from('sessions').delete().in('id', sessionIds);
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({ session_type: type, is_active: true, daily_notice: dailyNotice || '', expires_at: expiresAt.toISOString() })
      .select()
      .single();

    if (error || !data) {
      toast.error('Failed to start session');
      return null;
    }

    // Initialize 120 queue orders
    const orders = Array.from({ length: 120 }, (_, i) => ({
      session_id: data.id,
      order_number: i + 1,
      status: 'waiting' as const,
      notes: [],
    }));
    await supabase.from('queue_orders').insert(orders);

    // Initialize restaurant tables and chairs
    const tableConfigs = [
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

    return data;
  }, []);

  const fetchOrCreateSession = useCallback(async () => {
    const window = getSessionWindow();

    if (!window) {
      // Outside operating hours
      setSession(null);
      setLoading(false);
      return;
    }

    // Check for existing active session of the right type that hasn't expired
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .eq('session_type', window.type)
      .gte('expires_at', new Date().toISOString())
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching session:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setSession(data);
      setLoading(false);
      return;
    }

    // No matching session — auto-create one
    const newSession = await createSession(window.type, window.expiresAt);
    if (newSession) {
      setSession(newSession);
      toast.success(`Phiên ${window.type === 'lunch' ? 'Ca trưa' : 'Ca tối'} đã tự động bắt đầu`);
    }
    setLoading(false);
  }, [createSession]);

  const startNewSession = useCallback(async (type: 'lunch' | 'dinner', dailyNotice?: string) => {
    setLoading(true);
    const window = getSessionWindow();
    const expiresAt = window?.expiresAt || (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })();
    const newSession = await createSession(type, expiresAt, dailyNotice);
    if (newSession) {
      setSession(newSession);
      toast.success(`${type === 'lunch' ? 'Ca trưa' : 'Ca tối'} đã bắt đầu!`);
    }
    setLoading(false);
  }, [createSession]);

  useEffect(() => {
    fetchOrCreateSession();
  }, [fetchOrCreateSession]);

  return { session, loading, startNewSession, refreshSession: fetchOrCreateSession };
}
