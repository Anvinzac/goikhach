import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Users, Loader2, ShieldX, XCircle, ArrowDown, ArrowUp, Clock, Star, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
type JoinState = 'loading' | 'ready' | 'submitting' | 'expired' | 'not_found' | 'error';

function generateSecretCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function JoinQueue() {
  const { secret } = useParams<{ secret: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<JoinState>('loading');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [sessionType, setSessionType] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; scale: number; rotation: number }[]>([]);
  const heartIdRef = useRef(0);
  const [certId, setCertId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (!secret) return;

    const init = async () => {
      // Look up the certificate by secret_code
      const { data: cert, error } = await supabase
        .from('queue_certificates')
        .select('*')
        .eq('secret_code', secret)
        .maybeSingle();

      if (error || !cert) {
        setState('not_found');
        return;
      }

      // group_size=0 means kiosk pending placeholder
      // is_used=true with group_size=0 means expired (kiosk advanced past it)
      // group_size>0 means already claimed
      if (cert.group_size > 0) {
        // Already claimed — redirect to the certificate view (normal flow)
        const storedToken = localStorage.getItem(`cert_token_${secret}`);
        if (storedToken && storedToken === cert.browser_token) {
          navigate(`/c/${secret}`, { replace: true });
        } else {
          setState('expired');
        }
        return;
      }

      if (cert.is_used && cert.group_size === 0) {
        // Kiosk already advanced past this code
        setState('expired');
        return;
      }

      // group_size=0 and is_used=false → ready for customer to claim
      // Verify session is still active
      const { data: session } = await supabase
        .from('sessions')
        .select('session_type, is_active')
        .eq('id', cert.session_id)
        .single();

      if (!session || !session.is_active) {
        setState('expired');
        return;
      }

      setCertId(cert.id);
      setOrderId(cert.order_id);
      setSessionId(cert.session_id);
      setOrderNumber(cert.order_number);
      setSessionType(session.session_type);
      setState('ready');

      // Mark as claimed so kiosk hides the QR
      await supabase
        .from('queue_certificates')
        .update({ claimed_at: new Date().toISOString() })
        .eq('id', cert.id)
        .eq('group_size', 0)
        .eq('is_used', false);
    };

    init();
  }, [secret, navigate]);

  // Clear claimed_at when user leaves (cancel/close tab)
  useEffect(() => {
    if (!certId || state !== 'ready') return;

    const clearClaim = () => {
      // Use sendBeacon for reliability on tab close
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/queue_certificates?id=eq.${certId}&group_size=eq.0&is_used=eq.false`;
      const body = JSON.stringify({ claimed_at: null });
      const headers = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Prefer': 'return=minimal',
      };
      
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        // sendBeacon only supports POST, so fall back to fetch
        fetch(url, { method: 'PATCH', headers, body, keepalive: true }).catch(() => {});
      } else {
        fetch(url, { method: 'PATCH', headers, body, keepalive: true }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', clearClaim);
    window.addEventListener('pagehide', clearClaim);

    return () => {
      window.removeEventListener('beforeunload', clearClaim);
      window.removeEventListener('pagehide', clearClaim);
      // Also clear when component unmounts (e.g., navigating away)
      clearClaim();
    };
  }, [certId, state]);

  // Watch for cert invalidation while form is open (race condition protection)
  useEffect(() => {
    if (!certId || state !== 'ready') return;

    const channel = supabase
      .channel(`join-watch-${certId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queue_certificates', filter: `id=eq.${certId}` },
        (payload) => {
          const updated = payload.new as any;
          // If placeholder was invalidated (is_used set to true while still group_size=0)
          if (updated.is_used && updated.group_size === 0) {
            setState('expired');
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [certId, state]);

  // Continuous heart emission while size 2 is selected
  useEffect(() => {
    if (selectedSize !== 2) {
      setHearts([]);
      return;
    }
    const emit = () => {
      const batch = Array.from({ length: 3 }, () => ({
        id: ++heartIdRef.current,
        x: Math.random() * 50 - 25,
        y: -(Math.random() * 40 + 15),
        scale: 0.4 + Math.random() * 0.6,
        rotation: Math.random() * 50 - 25,
      }));
      setHearts(prev => [...prev.slice(-15), ...batch]); // cap at ~18
    };
    emit(); // first burst immediately
    const interval = setInterval(emit, 800);
    return () => clearInterval(interval);
  }, [selectedSize]);

    if (!selectedSize || !certId || !sessionId || !orderNumber || !secret) return;
    setState('submitting');

    try {
      // 1. Update queue_order FIRST (idempotent — only if not already assigned by staff)
      const now = new Date().toISOString();
      const notesForDb = selectedNotes.length > 0 ? selectedNotes : [];
      await supabase
        .from('queue_orders')
        .update({
          group_size: selectedSize,
          registered_at: now,
          updated_at: now,
          notes: notesForDb,
        })
        .eq('id', orderId)
        .is('group_size', null);

      // 2. Try claiming the kiosk placeholder cert
      const browserToken = crypto.randomUUID();
      const { data: claimed } = await supabase
        .from('queue_certificates')
        .update({
          group_size: selectedSize,
          is_used: true,
          browser_token: browserToken,
        })
        .eq('id', certId)
        .eq('group_size', 0)
        .eq('is_used', false)
        .select()
        .maybeSingle();

      if (claimed) {
        // Normal success path
        localStorage.setItem(`cert_token_${secret}`, browserToken);
        navigate(`/c/${secret}`, { replace: true });
        return;
      }

      // 3. Placeholder was invalidated (kiosk advanced or staff assigned).
      //    The queue_order already has group_size from step 1.
      //    Create a fresh cert so customer still gets their waiting card.
      const newSecret = generateSecretCode();
      const newToken = crypto.randomUUID();
      const { data: newCert, error: insertErr } = await supabase
        .from('queue_certificates')
        .insert({
          order_id: orderId,
          session_id: sessionId,
          secret_code: newSecret,
          order_number: orderNumber,
          group_size: selectedSize,
          is_used: true,
          browser_token: newToken,
        })
        .select('secret_code')
        .single();

      if (insertErr || !newCert) {
        setState('error');
        return;
      }

      localStorage.setItem(`cert_token_${newCert.secret_code}`, newToken);
      navigate(`/c/${newCert.secret_code}`, { replace: true });
    } catch (err) {
      console.error('Join queue error:', err);
      setState('error');
    }
  }, [selectedSize, certId, sessionId, orderNumber, orderId, secret, navigate]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-indigo-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
      </div>
    );
  }

  if (state === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-indigo-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <ShieldX className="w-14 h-14 text-red-400/70 mx-auto" />
          <h1 className="text-2xl font-bold text-white/80">Mã không hợp lệ</h1>
          <p className="text-fuchsia-300/50">Invalid QR code</p>
        </div>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-indigo-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <XCircle className="w-14 h-14 text-amber-400/70 mx-auto" />
          <h1 className="text-2xl font-bold text-white/80">Mã đã hết hạn</h1>
          <p className="text-fuchsia-300/50 max-w-xs mx-auto">
            Mã QR này đã hết hạn. Vui lòng quét mã mới tại quầy.
          </p>
          <p className="text-fuchsia-300/30 text-sm">
            This QR code has expired. Please scan the new one at the kiosk.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-indigo-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <XCircle className="w-14 h-14 text-red-400/70 mx-auto" />
          <h1 className="text-2xl font-bold text-white/80">Đã xảy ra lỗi</h1>
          <p className="text-fuchsia-300/50">Something went wrong. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-indigo-950 flex flex-col items-center justify-center p-6">
      {/* Session badge */}
      <div className="mb-6">
        <span className="px-3 py-1 rounded-full bg-fuchsia-900/40 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-medium tracking-wider uppercase">
          {sessionType === 'lunch' ? 'Trưa / Lunch' : 'Tối / Dinner'}
        </span>
      </div>

      {/* Order number */}
      <div className="text-center mb-8">
        <p className="text-fuchsia-400/50 text-sm uppercase tracking-widest mb-2">Số của bạn / Your number</p>
        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-violet-300 to-indigo-300 leading-none">
          {orderNumber}
        </div>
      </div>

      {/* Group size selection */}
      <div className="w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-fuchsia-500/20 p-6 space-y-5">
          <div className="flex items-center gap-2 text-fuchsia-200">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Số người / Group size</span>
          </div>

          {/* Size buttons 1-4 (tall square) */}
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => {
                  setSelectedSize(n);
                }}
                className={`aspect-square rounded-xl font-bold text-2xl transition-all active:scale-90 relative overflow-visible
                  ${selectedSize === n
                    ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/30 scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/10'
                  }`}
              >
                {n}
                {n === 2 && (
                  <AnimatePresence>
                    {hearts.map(h => (
                      <motion.span
                        key={h.id}
                        initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.3 }}
                        animate={{
                          opacity: 0,
                          x: h.x,
                          y: h.y,
                          scale: h.scale,
                          rotate: h.rotation,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <Heart className="w-3.5 h-3.5 fill-pink-300 text-pink-300" />
                      </motion.span>
                    ))}
                  </AnimatePresence>
                )}
              </button>
            ))}
          </div>

          {/* Size buttons 5-8 (shorter) */}
          <div className="grid grid-cols-4 gap-3">
            {[5, 6, 7, 8].map(n => (
              <button
                key={n}
                onClick={() => setSelectedSize(n)}
                className={`h-11 rounded-xl font-bold text-lg transition-all active:scale-90
                  ${selectedSize === n
                    ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/30 scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/10'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Size buttons 9-10, 11, 12+ (shorter) */}
          <div className="grid grid-cols-4 gap-3">
            {[9, 10, 11].map(n => (
              <button
                key={n}
                onClick={() => setSelectedSize(n)}
                className={`h-11 rounded-xl font-bold text-lg transition-all active:scale-90
                  ${selectedSize === n
                    ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/30 scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/10'
                  }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setSelectedSize(12)}
              className={`h-11 rounded-xl font-bold text-lg transition-all active:scale-90
                ${selectedSize !== null && selectedSize >= 12
                  ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/30 scale-105'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/10'
                }`}
            >
              12+
            </button>
          </div>

          {/* Special notes */}
          {selectedSize && (
            <div className="space-y-2 pt-1">
              <p className="text-fuchsia-300/60 text-xs font-medium">Ghi chú / Notes</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'dedicated', label: 'Bàn riêng', labelEn: 'Private table', icon: Star },
                  { key: 'prefer_downstairs', label: 'Tầng dưới', labelEn: 'Downstairs', icon: ArrowDown },
                  { key: 'prefer_upstairs', label: 'Tầng trên', labelEn: 'Upstairs', icon: ArrowUp },
                  { key: 'will_return', label: 'Quay lại sau', labelEn: 'Will return', icon: Clock },
                ].map(({ key, label, labelEn, icon: Icon }) => {
                  const isActive = selectedNotes.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedNotes(prev =>
                        isActive ? prev.filter(n => n !== key) : [...prev, key]
                      )}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95
                        ${isActive
                          ? 'bg-fuchsia-600/30 text-fuchsia-200 border border-fuchsia-400/40'
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedSize || state === 'submitting'}
            className={`w-full h-14 rounded-xl font-bold text-lg transition-all
              ${selectedSize
                ? 'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/30 active:scale-95'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
          >
            {state === 'submitting' ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <>Xác nhận / Confirm</>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-fuchsia-500/30 text-xs text-center">
        Chọn số người trong nhóm và nhấn xác nhận để nhận phiếu chờ.
        <br />
        Select your group size and confirm to receive your waiting card.
      </p>
    </div>
  );
}
