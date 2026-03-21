import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QRCodePopupProps {
  orderId: string;
  sessionId: string;
  orderNumber: number;
  groupSize: number;
  onClose: () => void;
}

const PUBLISHED_APP_URL = 'https://goikhach.lovable.app';

function getCertificateBaseUrl() {
  if (typeof window === 'undefined') return PUBLISHED_APP_URL;
  const host = window.location.hostname;
  const isPreviewHost = host.includes('lovableproject.com') || host.includes('id-preview--') || host.includes('preview--');
  return isPreviewHost ? PUBLISHED_APP_URL : window.location.origin;
}

function generateSecretCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function QRCodePopup({ orderId, sessionId, orderNumber, groupSize, onClose }: QRCodePopupProps) {
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [secretCode, setSecretCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createCertificate = async () => {
      // Check if a staff-created certificate already exists (skip kiosk placeholders with group_size=0)
      const { data: existing } = await supabase
        .from('queue_certificates')
        .select('secret_code')
        .eq('order_id', orderId)
        .gt('group_size', 0)
        .maybeSingle();

      if (existing) {
        setSecretCode(existing.secret_code);
        const url = `${getCertificateBaseUrl()}/c/${existing.secret_code}`;
        setCertificateUrl(url);
        setLoading(false);
        return;
      }

      // Invalidate any kiosk placeholders for this order before creating staff cert
      await supabase
        .from('queue_certificates')
        .update({ is_used: true })
        .eq('order_id', orderId)
        .eq('group_size', 0)
        .eq('is_used', false);

      const code = generateSecretCode();
      const { error } = await supabase.from('queue_certificates').insert({
        order_id: orderId,
        session_id: sessionId,
        secret_code: code,
        order_number: orderNumber,
        group_size: groupSize,
      });

      if (error) {
        console.error('Failed to create certificate:', error);
        setLoading(false);
        return;
      }

      setSecretCode(code);
      const url = `${getCertificateBaseUrl()}/c/${code}`;
      setCertificateUrl(url);
      setLoading(false);
    };

    createCertificate();
  }, [orderId, sessionId, orderNumber, groupSize]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-card rounded-2xl shadow-2xl p-6 max-w-[320px] w-full border-2 border-border"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-queue" />
              <span className="font-bold text-lg">Phiếu chờ / Queue Card</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center active:scale-90">
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-queue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : certificateUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG
                  value={certificateUrl}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-black text-queue">#{orderNumber}</span>
                  <span className="text-2xl font-bold text-muted-foreground">×{groupSize}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quét mã để nhận phiếu chờ
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  Scan to get your waiting card
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg px-3 py-1.5 w-full text-center">
                <span className="text-[10px] text-muted-foreground font-mono tracking-wider">{secretCode}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Failed to generate QR code</p>
          )}
        </div>
      </div>
    </>
  );
}
