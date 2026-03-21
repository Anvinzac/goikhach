import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CertificateData {
  id: string;
  order_id: string;
  session_id: string;
  secret_code: string;
  order_number: number;
  group_size: number;
  is_used: boolean;
  browser_token: string | null;
  customer_name: string | null;
  created_at: string;
}

export interface WaitingStats {
  groupsBefore: number;
  totalPeopleWaiting: number;
  estimatedMinutes: number;
  currentWaitMinutes: number;
  orderStatus: string;
  reachedTableAt: string | null;
}

export function useCertificate(secretCode: string | undefined) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ session_type: string; daily_notice: string; started_at: string } | null>(null);
  const [waitingStats, setWaitingStats] = useState<WaitingStats>({ groupsBefore: 0, totalPeopleWaiting: 0, estimatedMinutes: 0, currentWaitMinutes: 0, orderStatus: 'waiting', reachedTableAt: null });
  const [accessState, setAccessState] = useState<'loading' | 'granted' | 'denied' | 'not_found'>('loading');

  const STORAGE_KEY = `cert_token_${secretCode}`;

  const fetchWaitingStats = useCallback(async (cert: CertificateData) => {
    // Get the order's current status
    const { data: order } = await supabase
      .from('queue_orders')
      .select('status, reached_table_at, updated_at')
      .eq('id', cert.order_id)
      .single();

    if (!order) return;

    // Get waiting groups before this order
    const { data: waitingOrders } = await supabase
      .from('queue_orders')
      .select('order_number, group_size, status')
      .eq('session_id', cert.session_id);

    const allWaiting = (waitingOrders || []).filter(o => o.status === 'waiting' && o.group_size != null);
    const groupsBefore = allWaiting.filter(o => o.order_number < cert.order_number).length;
    const totalPeopleWaiting = allWaiting.reduce((sum, o) => sum + (o.group_size || 0), 0);
    const estimatedMinutes = groupsBefore * 3;

    const certCreatedAt = new Date(cert.created_at);
    const now = new Date();
    const currentWaitMinutes = Math.floor((now.getTime() - certCreatedAt.getTime()) / 60000);

    setWaitingStats({
      groupsBefore,
      totalPeopleWaiting,
      estimatedMinutes,
      currentWaitMinutes,
      orderStatus: order.status,
      reachedTableAt: order.reached_table_at,
    });
  }, []);

  useEffect(() => {
    if (!secretCode) return;

    const init = async () => {
      // Fetch certificate
      const { data: cert, error } = await supabase
        .from('queue_certificates')
        .select('*')
        .eq('secret_code', secretCode)
        .maybeSingle();

      if (error || !cert) {
        setAccessState('not_found');
        return;
      }

      // Kiosk placeholders (group_size=0) should only be claimed via /join/:secret, not /c/:secret
      if (cert.group_size === 0) {
        setAccessState(cert.is_used ? 'denied' : 'not_found');
        return;
      }

      const storedToken = localStorage.getItem(STORAGE_KEY);

      if (!cert.is_used) {
        // First access - claim it
        const browserToken = crypto.randomUUID();
        await supabase
          .from('queue_certificates')
          .update({ is_used: true, browser_token: browserToken })
          .eq('id', cert.id);

        localStorage.setItem(STORAGE_KEY, browserToken);
        cert.is_used = true;
        cert.browser_token = browserToken;
        setCertificate(cert as CertificateData);
        setAccessState('granted');
      } else if (storedToken && storedToken === cert.browser_token) {
        // Returning visitor with valid token
        setCertificate(cert as CertificateData);
        setAccessState('granted');
      } else {
        // Already used by someone else
        setAccessState('denied');
        return;
      }

      // Fetch session info
      const { data: sess } = await supabase
        .from('sessions')
        .select('session_type, daily_notice, started_at')
        .eq('id', cert.session_id)
        .single();

      setSessionInfo(sess as any);
      fetchWaitingStats(cert as CertificateData);
    };

    init();
  }, [secretCode, STORAGE_KEY, fetchWaitingStats]);

  // Real-time updates
  useEffect(() => {
    if (!certificate) return;

    const channel = supabase
      .channel(`cert-live-${certificate.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'queue_orders',
        filter: `session_id=eq.${certificate.session_id}`,
      }, () => {
        fetchWaitingStats(certificate);
      })
      .subscribe();

    // Update current wait time every 30 seconds
    const timer = setInterval(() => {
      fetchWaitingStats(certificate);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [certificate, fetchWaitingStats]);

  const updateCustomerName = useCallback(async (name: string) => {
    if (!certificate) return;
    await supabase.from('queue_certificates').update({ customer_name: name }).eq('id', certificate.id);
    setCertificate(prev => prev ? { ...prev, customer_name: name } : null);
  }, [certificate]);

  return { certificate, sessionInfo, waitingStats, accessState, updateCustomerName };
}
