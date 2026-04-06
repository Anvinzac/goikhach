import { useKiosk } from '@/hooks/useKiosk';
import { PinGate } from '@/components/PinGate';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, WifiOff, CheckCircle2, Clock } from 'lucide-react';

const PUBLISHED_APP_URL = 'https://khach.quanchay.la';

function getBaseUrl() {
  if (typeof window === 'undefined') return PUBLISHED_APP_URL;
  const host = window.location.hostname;
  const isPreview = host.includes('lovableproject.com') || host.includes('preview--');
  return isPreview ? PUBLISHED_APP_URL : window.location.origin;
}

export default function Kiosk() {
  return (
    <PinGate>
      <KioskContent />
    </PinGate>
  );
}

function KioskContent() {
  const { currentOrderNumber, secretCode, sessionType, loading, noSession, allUsed } = useKiosk();

  const qrUrl = secretCode ? `${getBaseUrl()}/join/${secretCode}` : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0014] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-fuchsia-400 animate-spin" />
      </div>
    );
  }

  if (noSession) {
    return (
      <div className="min-h-screen bg-[#0a0014] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <WifiOff className="w-16 h-16 text-fuchsia-500/50 mx-auto" />
          <h1 className="text-3xl font-bold text-white/80">Chưa có phiên hoạt động</h1>
          <p className="text-fuchsia-300/60 text-lg">No active session</p>
        </div>
      </div>
    );
  }

  if (allUsed) {
    return (
      <div className="min-h-screen bg-[#0a0014] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-400/70 mx-auto" />
          <h1 className="text-3xl font-bold text-white/80">Hết số</h1>
          <p className="text-fuchsia-300/60 text-lg">All numbers have been assigned</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0014] flex flex-col items-center justify-center p-6 select-none">
      {/* Session badge */}
      <div className="mb-6">
        <span className="px-4 py-1.5 rounded-full bg-fuchsia-900/40 border border-fuchsia-500/20 text-fuchsia-300 text-sm font-medium tracking-wider uppercase">
          {sessionType === 'lunch' ? 'Trưa / Lunch' : 'Tối / Dinner'}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-white/90 text-2xl font-bold mb-2 text-center">
        Quét mã để lấy số
      </h1>
      <p className="text-fuchsia-300/50 text-base mb-8 text-center">
        Scan to get your queue number
      </p>

      {/* QR Code or Claimed state */}
      {claimed ? (
        <div className="bg-white/5 backdrop-blur-sm border border-fuchsia-500/20 p-8 rounded-2xl mb-8 text-center space-y-3 transition-all duration-500">
          <Clock className="w-12 h-12 text-amber-400/70 mx-auto animate-pulse" />
          <p className="text-white/80 font-semibold text-lg">Đang chờ xác nhận</p>
          <p className="text-fuchsia-300/50 text-sm">A customer is selecting their group size…</p>
        </div>
      ) : qrUrl ? (
        <div className="bg-white p-5 rounded-2xl shadow-2xl shadow-fuchsia-500/20 mb-8 transition-all duration-500">
          <QRCodeSVG
            value={qrUrl}
            size={280}
            level="M"
            includeMargin={false}
          />
        </div>
      ) : null}

      {/* Current number */}
      <div className="text-center space-y-2">
        <p className="text-fuchsia-400/50 text-sm uppercase tracking-widest">Số hiện tại / Current number</p>
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-violet-300 to-indigo-300 leading-none">
          {currentOrderNumber}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-12 text-fuchsia-500/30 text-xs text-center max-w-xs">
        Mỗi mã QR chỉ dùng được một lần. Vui lòng không chụp ảnh mã.
        <br />
        Each QR code is single-use. Please do not take photos.
      </div>
    </div>
  );
}
