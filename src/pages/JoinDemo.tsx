import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Dev helper: finds the latest unclaimed kiosk placeholder cert
 * and redirects to /join/:secret so you can test without scanning QR.
 */
export default function JoinDemo() {
  const [secret, setSecret] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('queue_certificates')
        .select('secret_code')
        .eq('group_size', 0)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.secret_code) {
        setSecret(data.secret_code);
      } else {
        setNotFound(true);
      }
    })();
  }, []);

  if (secret) return <Navigate to={`/join/${secret}`} replace />;

  return (
    <div className="min-h-screen bg-[#0a0014] flex items-center justify-center">
      {notFound ? (
        <p className="text-white/60 text-center">No active kiosk QR found.<br/>Start a session and open /kiosk first.</p>
      ) : (
        <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
      )}
    </div>
  );
}
