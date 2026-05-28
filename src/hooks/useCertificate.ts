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
  pin_code: string | null;
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
  const [accessState, setAccessState] = useState<'loading' | 'granted' | 'needs_pin' | 'denied' | 'not_found'>('loading');

  const STORAGE_KEY = `cert_token_${secretCode}`;

  // Filter the daily notice so a customer never sees their own number (or higher)
  // referenced as "about to be called". Max displayed value is cert.order_number - 2.
  const filterNoticeForCert = useCallback((notice: string | null | undefined, customerNumber: number): string => {
    if (!notice) return '';
    const numbers = Array.from(notice.matchAll(/\d+/g)).map(m => parseInt(m[0], 10));
    if (numbers.length === 0) return notice;
    const maxAllowed = customerNumber - 2;
    const visible = numbers.filter(n => n <= maxAllowed);
    if (visible.length === 0) return '';
    if (visible.length === numbers.length) return notice;
    // Rebuild: keep prefix/suffix wrapper, replace number list with the filtered set
    return notice.replace(/(\d+)(\s*,\s*\d+)*/, visible.join(', '));
  }, []);

  const fetchSessionAndStats = useCallback(async (cert: CertificateData) => {
    const { data: sess } = await supabase
      .from('sessions')
      .select('session_type, daily_notice, started_at')
      .eq('id', cert.session_id)
      .single();
    if (sess) {
      setSessionInfo({
        ...(sess as any),
        daily_notice: filterNoticeForCert((sess as any).daily_notice, cert.order_number),
      });
    }

    // Fetch waiting stats
    const { data: order } = await supabase
      .from('queue_orders')
      .select('status, reached_table_at, updated_at')
      .eq('id', cert.order_id)
      .single();

    if (!order) {
      setWaitingStats(prev => ({ ...prev, orderStatus: 'expired' }));
      return;
    }

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
  }, [filterNoticeForCert]);

  useEffect(() => {
    if (!secretCode) return;

    const init = async () => {
      const { data: cert, error } = await supabase
        .from('queue_certificates')
        .select('*')
        .eq('secret_code', secretCode)
        .maybeSingle();

      if (error || !cert) {
        setAccessState('not_found');
        return;
      }

      if (cert.group_size === 0) {
        setAccessState(cert.is_used ? 'denied' : 'not_found');
        return;
      }

      const storedToken = localStorage.getItem(STORAGE_KEY);
      let granted = false;

      if (!cert.is_used) {
        // First access — claim it
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
        granted = true;
      } else if (storedToken && storedToken === cert.browser_token) {
        // Returning visitor with valid token
        setCertificate(cert as CertificateData);
        setAccessState('granted');
        granted = true;
      } else if (cert.pin_code) {
        // Has PIN set — visitor can enter PIN to view
        setCertificate(cert as CertificateData);
        setAccessState('needs_pin');
      } else {
        // Already used, no PIN — denied
        setAccessState('denied');
        return;
      }

      if (granted) {
        fetchSessionAndStats(cert as CertificateData);
      }
    };

    init();
  }, [secretCode, STORAGE_KEY, fetchSessionAndStats]);

  const verifyPin = useCallback(async (pin: string) => {
    if (!certificate) return false;
    if (certificate.pin_code === pin) {
      setAccessState('granted');
      fetchSessionAndStats(certificate);
      return true;
    }
    return false;
  }, [certificate, fetchSessionAndStats]);

  const setupPin = useCallback(async (pin: string) => {
    if (!certificate) return false;
    const { error } = await supabase
      .from('queue_certificates')
      .update({ pin_code: pin })
      .eq('id', certificate.id);
    if (error) return false;
    setCertificate(prev => prev ? { ...prev, pin_code: pin } : null);
    return true;
  }, [certificate]);

  // Real-time updates for queue orders AND session notice
  useEffect(() => {
    if (!certificate || accessState !== 'granted') return;

    const channel = supabase
      .channel(`cert-live-${certificate.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'queue_orders',
        filter: `session_id=eq.${certificate.session_id}`,
      }, () => {
        fetchSessionAndStats(certificate);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${certificate.session_id}`,
      }, (payload) => {
        const updated = payload.new as any;
        setSessionInfo(prev => prev ? { ...prev, daily_notice: filterNoticeForCert(updated.daily_notice, certificate.order_number) } : prev);
      })
      .subscribe();

    const timer = setInterval(() => {
      fetchSessionAndStats(certificate);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [certificate, accessState, fetchSessionAndStats, filterNoticeForCert]);

  const updateCustomerName = useCallback(async (name: string) => {
    if (!certificate) return;
    await supabase.from('queue_certificates').update({ customer_name: name }).eq('id', certificate.id);
    setCertificate(prev => prev ? { ...prev, customer_name: name } : null);
  }, [certificate]);

  return { certificate, sessionInfo, waitingStats, accessState, updateCustomerName, setupPin, verifyPin };
}
