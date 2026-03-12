import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCertificate } from '@/hooks/useCertificate';
import { ShieldX, Clock, Users, User, Camera, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

const THEMES = [
  { id: 'classic', label: 'Classic', emoji: '🏛️', bg: 'bg-gradient-to-br from-amber-50 to-orange-50', border: 'border-amber-200', accent: 'text-amber-800', accentBg: 'bg-amber-100', number: 'text-amber-700', headerBg: 'bg-gradient-to-r from-amber-700 to-amber-900', headerText: 'text-amber-50' },
  { id: 'modern', label: 'Modern', emoji: '◼️', bg: 'bg-gradient-to-br from-zinc-50 to-slate-100', border: 'border-zinc-300', accent: 'text-zinc-800', accentBg: 'bg-zinc-100', number: 'text-zinc-900', headerBg: 'bg-gradient-to-r from-zinc-800 to-zinc-950', headerText: 'text-zinc-50' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', bg: 'bg-gradient-to-br from-sky-50 to-cyan-50', border: 'border-sky-200', accent: 'text-sky-800', accentBg: 'bg-sky-100', number: 'text-sky-700', headerBg: 'bg-gradient-to-r from-sky-600 to-indigo-700', headerText: 'text-sky-50' },
  { id: 'sakura', label: 'Sakura', emoji: '🌸', bg: 'bg-gradient-to-br from-pink-50 to-rose-50', border: 'border-pink-200', accent: 'text-pink-800', accentBg: 'bg-pink-100', number: 'text-pink-700', headerBg: 'bg-gradient-to-r from-pink-500 to-rose-600', headerText: 'text-pink-50' },
  { id: 'forest', label: 'Forest', emoji: '🌿', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', border: 'border-emerald-200', accent: 'text-emerald-800', accentBg: 'bg-emerald-100', number: 'text-emerald-700', headerBg: 'bg-gradient-to-r from-emerald-700 to-teal-800', headerText: 'text-emerald-50' },
  { id: 'night', label: 'Night', emoji: '🌙', bg: 'bg-gradient-to-br from-slate-800 to-slate-900', border: 'border-amber-500/30', accent: 'text-amber-300', accentBg: 'bg-slate-700', number: 'text-amber-400', headerBg: 'bg-gradient-to-r from-amber-600 to-yellow-700', headerText: 'text-slate-900' },
];

export default function Certificate() {
  const { code } = useParams<{ code: string }>();
  const { certificate, sessionInfo, waitingStats, accessState, updateCustomerName } = useCertificate(code);
  const [theme, setTheme] = useState(THEMES[0]);
  const [showTimes, setShowTimes] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [nameSubmitted, setNameSubmitted] = useState(false);

  const isDone = waitingStats.orderStatus === 'done';
  const isNightTheme = theme.id === 'night';

  const dayLabel = useMemo(() => {
    if (!certificate) return '';
    const d = new Date(certificate.created_at);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [certificate]);

  const timeLabel = useMemo(() => {
    if (!certificate) return '';
    const d = new Date(certificate.created_at);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }, [certificate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleNameSubmit = () => {
    if (customerName.trim()) {
      updateCustomerName(customerName.trim());
      setNameSubmitted(true);
    }
  };

  if (accessState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessState === 'not_found') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center gap-4">
        <ShieldX className="w-16 h-16 text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-700">Không tìm thấy phiếu</h1>
        <p className="text-slate-500">Certificate not found</p>
      </div>
    );
  }

  if (accessState === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8 text-center gap-4">
        <ShieldX className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-bold text-red-700">Phiếu đã được sử dụng</h1>
        <p className="text-red-500">This certificate has already been claimed by another device.</p>
        <p className="text-sm text-red-400">Phiếu này đã được sử dụng trên thiết bị khác.</p>
      </div>
    );
  }

  if (!certificate || !sessionInfo) return null;

  return (
    <div className={`min-h-screen p-4 ${isNightTheme ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
      {/* The Card */}
      <div className={`max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 ${theme.bg} ${theme.border}`}>
        {/* Header */}
        <div className={`${theme.headerBg} ${theme.headerText} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">Phiếu chờ · Queue Card</p>
              <p className="text-[10px] opacity-60 mt-0.5 capitalize">{sessionInfo.session_type} Service</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black leading-none">#{certificate.order_number}</span>
            </div>
          </div>
        </div>

        {/* Photo + Name area */}
        {(photoUrl || nameSubmitted) && (
          <div className="px-6 pt-5 flex items-center gap-4">
            {photoUrl && (
              <img src={photoUrl} alt="Photo" className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white" />
            )}
            <div>
              {certificate.customer_name && (
                <p className={`text-lg font-bold ${theme.accent}`}>{certificate.customer_name}</p>
              )}
              <p className={`text-xs ${isNightTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                {certificate.group_size} {certificate.group_size === 1 ? 'người · person' : 'người · people'}
              </p>
            </div>
          </div>
        )}

        {/* Main info */}
        <div className="px-6 py-5 space-y-4">
          {/* Day */}
          <div className="space-y-0.5">
            <p className={`text-[10px] uppercase tracking-widest font-semibold ${isNightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Ngày · Day</p>
            <p className={`text-sm font-semibold ${theme.accent}`}>{dayLabel}</p>
          </div>

          {/* Daily notice */}
          {sessionInfo.daily_notice && (
            <div className={`${theme.accentBg} rounded-xl px-4 py-3`}>
              <p className={`text-[10px] uppercase tracking-widest font-semibold ${isNightTheme ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Thông báo · Notice</p>
              <p className={`text-sm font-bold ${theme.accent}`}>{sessionInfo.daily_notice}</p>
            </div>
          )}

          {/* Time generated */}
          <div className="space-y-0.5">
            <p className={`text-[10px] uppercase tracking-widest font-semibold ${isNightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Thời gian · Time</p>
            <p className={`text-sm font-semibold ${theme.accent}`}>{timeLabel}</p>
          </div>

          {/* Group size (when no photo/name) */}
          {!photoUrl && !nameSubmitted && (
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${theme.accentBg} flex items-center justify-center`}>
                <Users className={`w-6 h-6 ${theme.number}`} />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${isNightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Số người · Group Size</p>
                <p className={`text-2xl font-black ${theme.number}`}>{certificate.group_size}</p>
              </div>
            </div>
          )}

          {/* Real-time stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`${theme.accentBg} rounded-xl px-4 py-3 text-center`}>
              <p className={`text-[10px] uppercase tracking-widest font-semibold ${isNightTheme ? 'text-slate-400' : 'text-slate-500'}`}>Nhóm trước</p>
              <p className={`text-[10px] ${isNightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Groups before</p>
              <p className={`text-3xl font-black ${theme.number} mt-1`}>
                {isDone ? <CheckCircle2 className={`w-8 h-8 mx-auto ${theme.number}`} /> : waitingStats.groupsBefore}
              </p>
            </div>
            <div className={`${theme.accentBg} rounded-xl px-4 py-3 text-center`}>
              <p className={`text-[10px] uppercase tracking-widest font-semibold ${isNightTheme ? 'text-slate-400' : 'text-slate-500'}`}>Đang chờ</p>
              <p className={`text-[10px] ${isNightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Total waiting</p>
              <p className={`text-3xl font-black ${theme.number} mt-1`}>
                {isDone ? '—' : `${waitingStats.totalPeopleWaiting}`}
              </p>
            </div>
          </div>

          {/* Expandable time section */}
          <button
            onClick={() => setShowTimes(!showTimes)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl ${theme.accentBg} active:scale-[0.98] transition-all`}
          >
            <span className={`text-xs font-bold ${theme.accent}`}>
              <Clock className="w-3.5 h-3.5 inline mr-1.5" />
              Thời gian chờ · Wait Times
            </span>
            {showTimes ? <ChevronUp className={`w-4 h-4 ${theme.accent}`} /> : <ChevronDown className={`w-4 h-4 ${theme.accent}`} />}
          </button>

          {showTimes && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <div className={`flex justify-between items-center px-1`}>
                <div>
                  <p className={`text-xs font-semibold ${theme.accent}`}>
                    {isDone ? 'Thời gian vào bàn · Reaching table' : 'Thời gian chờ ước tính · Estimated wait'}
                  </p>
                </div>
                <span className={`text-lg font-black ${theme.number}`}>
                  {isDone
                    ? (waitingStats.reachedTableAt
                      ? new Date(waitingStats.reachedTableAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '—')
                    : `~${waitingStats.estimatedMinutes} phút`
                  }
                </span>
              </div>
              <div className={`flex justify-between items-center px-1`}>
                <div>
                  <p className={`text-xs font-semibold ${theme.accent}`}>
                    {isDone ? 'Tổng thời gian chờ · Total wait' : 'Đã chờ · Current wait'}
                  </p>
                </div>
                <span className={`text-lg font-black ${theme.number}`}>
                  {isDone && waitingStats.reachedTableAt
                    ? `${Math.floor((new Date(waitingStats.reachedTableAt).getTime() - new Date(certificate.created_at).getTime()) / 60000)} phút`
                    : `${waitingStats.currentWaitMinutes} phút`
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Personalization area */}
        {!nameSubmitted && (
          <div className={`px-6 pb-5 space-y-3`}>
            <p className={`text-[10px] uppercase tracking-widest font-semibold ${isNightTheme ? 'text-slate-500' : 'text-slate-400'}`}>
              Cá nhân hóa · Personalize (optional)
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isNightTheme ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Tên / Name"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium ${
                    isNightTheme
                      ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600'
                      : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                  onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                />
              </div>
              <button
                onClick={handleNameSubmit}
                disabled={!customerName.trim()}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm ${theme.headerBg} ${theme.headerText} disabled:opacity-30 active:scale-95 transition-all`}
              >
                OK
              </button>
            </div>
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer active:scale-[0.98] transition-all ${
              isNightTheme ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}>
              <Camera className="w-4 h-4" />
              <span className="text-xs font-semibold">Thêm ảnh · Add Photo</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        )}

        {/* Footer */}
        <div className={`px-6 py-3 ${isNightTheme ? 'bg-slate-800/50' : 'bg-slate-50'} border-t ${theme.border}`}>
          <p className={`text-[10px] text-center ${isNightTheme ? 'text-slate-600' : 'text-slate-400'} font-medium`}>
            Phiếu chờ điện tử · Digital Queue Certificate
          </p>
        </div>
      </div>

      {/* Theme selector */}
      <div className="max-w-md mx-auto mt-6">
        <p className={`text-xs font-bold mb-3 text-center ${isNightTheme ? 'text-slate-500' : 'text-slate-500'}`}>
          Chọn kiểu · Choose Style
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all active:scale-90 ${
                theme.id === t.id
                  ? `${t.border} shadow-lg scale-105`
                  : `border-transparent ${isNightTheme ? 'bg-slate-800' : 'bg-white'} shadow-sm`
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <span className={`text-[10px] font-bold ${isNightTheme ? 'text-slate-400' : 'text-slate-600'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
