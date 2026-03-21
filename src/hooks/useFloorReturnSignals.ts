import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FloorReturnSignal {
  id: string;
  session_id: string;
  floor: string;
  table_id: string | null;
  chair_id: string | null;
  created_at: string;
}

const HIGHLIGHT_MS = 40_000;

const db = supabase as typeof supabase & {
  from: (relation: string) => any;
};

export function useFloorReturnSignals(sessionId: string | undefined, floor: string) {
  const [highlightedTableIds, setHighlightedTableIds] = useState<Set<string>>(new Set());
  const [highlightedChairIds, setHighlightedChairIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, number>>(new Map());

  const scheduleRemoval = useCallback((key: string, targetId: string, type: 'table' | 'chair', delay: number) => {
    const existingTimer = timersRef.current.get(key);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timer = window.setTimeout(() => {
      if (type === 'table') {
        setHighlightedTableIds(prev => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      } else {
        setHighlightedChairIds(prev => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      }
      timersRef.current.delete(key);
    }, delay);

    timersRef.current.set(key, timer);
  }, []);

  const applySignal = useCallback((signal: FloorReturnSignal) => {
    const age = Date.now() - new Date(signal.created_at).getTime();
    const remaining = HIGHLIGHT_MS - age;

    if (remaining <= 0) return;

    if (signal.table_id) {
      setHighlightedTableIds(prev => new Set(prev).add(signal.table_id as string));
      scheduleRemoval(`table:${signal.table_id}`, signal.table_id, 'table', remaining);
    }

    if (signal.chair_id) {
      setHighlightedChairIds(prev => new Set(prev).add(signal.chair_id as string));
      scheduleRemoval(`chair:${signal.chair_id}`, signal.chair_id, 'chair', remaining);
    }
  }, [scheduleRemoval]);

  const pingTable = useCallback(async (tableId: string) => {
    if (!sessionId) return;

    await db.from('floor_return_signals').insert({
      session_id: sessionId,
      floor,
      table_id: tableId,
      chair_id: null,
    });
  }, [floor, sessionId]);

  const pingChair = useCallback(async (chairId: string) => {
    if (!sessionId) return;

    await db.from('floor_return_signals').insert({
      session_id: sessionId,
      floor,
      table_id: null,
      chair_id: chairId,
    });
  }, [floor, sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchRecentSignals = async () => {
      const since = new Date(Date.now() - HIGHLIGHT_MS).toISOString();
      const { data } = await db
        .from('floor_return_signals')
        .select('*')
        .eq('session_id', sessionId)
        .eq('floor', floor)
        .gte('created_at', since)
        .order('created_at', { ascending: true });

      (data as FloorReturnSignal[] | null)?.forEach(applySignal);
    };

    fetchRecentSignals();

    const channel = supabase
      .channel(`floor-return-signals-${sessionId}-${floor}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'floor_return_signals', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const signal = payload.new as FloorReturnSignal;
          if (signal.floor === floor) {
            applySignal(signal);
          }
        }
      )
      .subscribe();

    return () => {
      timersRef.current.forEach(timer => window.clearTimeout(timer));
      timersRef.current.clear();
      supabase.removeChannel(channel);
    };
  }, [applySignal, floor, sessionId]);

  return {
    highlightedTableIds,
    highlightedChairIds,
    pingTable,
    pingChair,
  };
}