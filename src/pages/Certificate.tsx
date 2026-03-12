import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCertificate } from '@/hooks/useCertificate';
import { ShieldX, Clock, Users, User, Camera, ChevronDown, ChevronUp, CheckCircle2, Globe, Sparkles } from 'lucide-react';

type Lang = 'vi' | 'en';

const t = (vi: string, en: string, lang: Lang) => lang === 'vi' ? vi : en;

const THEMES = [
  {
    id: 'neon',
    label: 'Neon',
    emoji: '⚡',
    card: 'bg-gradient-to-br from-violet-950 via-fuchsia-950 to-indigo-950',
    border: 'border-fuchsia-500/40',
    headerBg: 'bg-gradient-to-r from-fuchsia-600/90 via-violet-600/90 to-indigo-600/90',
    headerText: 'text-white',
    accent: 'text-fuchsia-300',
    accentBg: 'bg-fuchsia-900/40 border border-fuchsia-500/20',
    number: 'text-fuchsia-200',
    pageBg: 'bg-[#0a0014]',
    labelColor: 'text-fuchsia-400/60',
    footerBg: 'bg-fuchsia-950/60',
    footerText: 'text-fuchsia-400/50',
  },
  {
    id: 'sakura',
    label: 'Sakura',
    emoji: '🌸',
    card: 'bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50',
    border: 'border-pink-200',
    headerBg: 'bg-gradient-to-r from-pink-400/90 via-rose-400/90 to-amber-300/90',
    headerText: 'text-white',
    accent: 'text-pink-800',
    accentBg: 'bg-pink-100/80 border border-pink-200/60',
    number: 'text-pink-700',
    pageBg: 'bg-gradient-to-br from-pink-100 to-rose-100',
    labelColor: 'text-pink-400',
    footerBg: 'bg-pink-50',
    footerText: 'text-pink-300',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    card: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50',
    border: 'border-sky-200',
    headerBg: 'bg-gradient-to-r from-cyan-500/90 via-sky-500/90 to-blue-600/90',
    headerText: 'text-white',
    accent: 'text-sky-800',
    accentBg: 'bg-sky-100/80 border border-sky-200/60',
    number: 'text-sky-700',
    pageBg: 'bg-gradient-to-br from-sky-100 to-cyan-100',
    labelColor: 'text-sky-400',
    footerBg: 'bg-sky-50',
    footerText: 'text-sky-300',
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🌿',
    card: 'bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50',
    border: 'border-emerald-200',
    headerBg: 'bg-gradient-to-r from-emerald-500/90 via-green-500/90 to-teal-600/90',
    headerText: 'text-white',
    accent: 'text-emerald-800',
    accentBg: 'bg-emerald-100/80 border border-emerald-200/60',
    number: 'text-emerald-700',
    pageBg: 'bg-gradient-to-br from-emerald-100 to-green-100',
    labelColor: 'text-emerald-400',
    footerBg: 'bg-emerald-50',
    footerText: 'text-emerald-300',
  },
  {
    id: 'midnight',
    label: 'Night',
    emoji: '🌙',
    card: 'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900',
    border: 'border-amber-500/30',
    headerBg: 'bg-gradient-to-r from-amber-500/90 via-yellow-500/90 to-orange-500/90',
    headerText: 'text-slate-900',
    accent: 'text-amber-300',
    accentBg: 'bg-slate-800/80 border border-amber-500/20',
    number: 'text-amber-400',
    pageBg: 'bg-slate-950',
    labelColor: 'text-slate-500',
    footerBg: 'bg-slate-800/50',
    footerText: 'text-slate-600',
  },
  {
    id: 'mono',
    label: 'Mono',
    emoji: '◾',
    card: 'bg-gradient-to-br from-zinc-50 to-stone-100',
    border: 'border-zinc-300',
    headerBg: 'bg-gradient-to-r from-zinc-800/95 via-stone-800/95 to-zinc-900/95',
    headerText: 'text-zinc-50',
    accent: 'text-zinc-700',
    accentBg: 'bg-zinc-100/80 border border-zinc-200/60',
    number: 'text-zinc-800',
    pageBg: 'bg-gradient-to-br from-zinc-200 to-stone-200',
    labelColor: 'text-zinc-400',
    footerBg: 'bg-zinc-50',
    footerText: 'text-zinc-300',
  },
];

export default function Certificate() {
  const { code } = useParams<{ code: string }>();
  const { certificate, sessionInfo, waitingStats, accessState, updateCustomerName } = useCertificate(code);
  const [theme, setTheme] = useState(THEMES[0]);
  const [lang, setLang] = useState<Lang>('vi');
  const [showTimes, setShowTimes] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [nameSubmitted, setNameSubmitted] = useState(false);

  const isDone = waitingStats.orderStatus === 'done';
  const isDark = theme.id === 'neon' || theme.id === 'midnight';

  const dayLabel = useMemo(() => {
    if (!certificate) return '';
    const d = new Date(certificate.created_at);
    return lang === 'vi'
      ? d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [certificate, lang]);

  const timeLabel = useMemo(() => {
    if (!certificate) return '';
    return new Date(certificate.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }, [certificate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleNameSubmit = useCallback(() => {
    if (customerName.trim()) {
      updateCustomerName(customerName.trim());
      setNameSubmitted(true);
      setShowPersonalize(false);
    }
  }, [customerName, updateCustomerName]);

  const toggleLang = () => setLang(l => l === 'vi' ? 'en' : 'vi');

  // Loading state
  if (accessState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessState === 'not_found') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center gap-4">
        <ShieldX className="w-16 h-16 text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-700">{t('Không tìm thấy phiếu', 'Certificate not found', lang)}</h1>
      </div>
    );
  }

  if (accessState === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8 text-center gap-4">
        <ShieldX className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-bold text-red-700">{t('Phiếu đã được sử dụng', 'Certificate already claimed', lang)}</h1>
        <p className="text-red-500 text-sm">{t('Phiếu này đã được sử dụng trên thiết bị khác.', 'This certificate has been claimed on another device.', lang)}</p>
      </div>
    );
  }

  if (!certificate || !sessionInfo) return null;

  const displayName = certificate.customer_name;

  return (
    <div className={`min-h-screen ${theme.pageBg} overflow-y-auto`}>
      <div className="p-4 pb-8 max-w-md mx-auto space-y-5">

        {/* Language toggle - floating */}
        <div className="flex justify-end">
          <button
            onClick={toggleLang}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 backdrop-blur-sm ${
              isDark ? 'bg-white/10 text-white/70' : 'bg-black/5 text-black/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>

        {/* THE CARD */}
        <div className={`rounded-3xl overflow-hidden shadow-2xl border-2 ${theme.card} ${theme.border}`}>

          {/* Header with optional photo background */}
          <div className="relative overflow-hidden">
            {photoUrl && (
              <>
                <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
              </>
            )}
            <div className={`relative ${!photoUrl ? theme.headerBg : ''} px-5 py-4`}>
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  {displayName ? (
                    <p className={`text-base font-black ${theme.headerText}`}>
                      {t(`Phiếu chờ của ${displayName}`, `Queue card for ${displayName}`, lang)}
                    </p>
                  ) : (
                    <p className={`text-sm font-bold ${theme.headerText} opacity-90`}>
                      {t('Phiếu chờ', 'Queue Card', lang)}
                    </p>
                  )}
                  <p className={`text-[10px] ${theme.headerText} opacity-60 font-medium`}>
                    Quán chay Lá – Vegetarian restaurant
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={`text-[10px] ${theme.headerText} opacity-50 font-semibold uppercase tracking-wider`}>
                    {t('số', 'no.', lang)}
                  </p>
                  <span className={`text-4xl font-black leading-none ${theme.headerText}`}>
                    {certificate.order_number}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">

            {/* Day + Time row */}
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${theme.labelColor}`}>
                  {t('Ngày', 'Date', lang)}
                </p>
                <p className={`text-sm font-bold ${theme.accent}`}>{dayLabel}</p>
              </div>
              <p className={`text-sm font-bold ${theme.accent}`}>{timeLabel}</p>
            </div>

            {/* Daily notice */}
            {sessionInfo.daily_notice && (
              <div className={`${theme.accentBg} rounded-2xl px-4 py-3`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${theme.labelColor} mb-1`}>
                  {t('Thông báo', 'Notice', lang)}
                </p>
                <p className={`text-sm font-bold ${theme.accent}`}>{sessionInfo.daily_notice}</p>
              </div>
            )}

            {/* Group size chip */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${theme.accentBg} flex items-center justify-center`}>
                <Users className={`w-5 h-5 ${theme.number}`} />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${theme.labelColor}`}>
                  {t('Số người', 'Group size', lang)}
                </p>
                <p className={`text-xl font-black ${theme.number}`}>{certificate.group_size}</p>
              </div>
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`${theme.accentBg} rounded-2xl px-4 py-3 text-center`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${theme.labelColor}`}>
                  {t('Nhóm trước', 'Before you', lang)}
                </p>
                <p className={`text-3xl font-black ${theme.number} mt-1`}>
                  {isDone ? <CheckCircle2 className={`w-8 h-8 mx-auto ${theme.number}`} /> : waitingStats.groupsBefore}
                </p>
              </div>
              <div className={`${theme.accentBg} rounded-2xl px-4 py-3 text-center`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${theme.labelColor}`}>
                  {t('Đang chờ', 'Waiting', lang)}
                </p>
                <p className={`text-3xl font-black ${theme.number} mt-1`}>
                  {isDone ? '—' : waitingStats.totalPeopleWaiting}
                </p>
              </div>
            </div>

            {/* Expandable times */}
            <button
              onClick={() => setShowTimes(!showTimes)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl ${theme.accentBg} active:scale-[0.98] transition-all`}
            >
              <span className={`text-xs font-bold ${theme.accent}`}>
                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                {t('Thời gian chờ', 'Wait times', lang)}
              </span>
              {showTimes ? <ChevronUp className={`w-4 h-4 ${theme.accent}`} /> : <ChevronDown className={`w-4 h-4 ${theme.accent}`} />}
            </button>

            {showTimes && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center px-1">
                  <p className={`text-xs font-semibold ${theme.accent}`}>
                    {isDone
                      ? t('Thời gian vào bàn', 'Reached table', lang)
                      : t('Ước tính', 'Estimated', lang)}
                  </p>
                  <span className={`text-lg font-black ${theme.number}`}>
                    {isDone
                      ? (waitingStats.reachedTableAt
                        ? new Date(waitingStats.reachedTableAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : '—')
                      : `~${waitingStats.estimatedMinutes} ${t('phút', 'min', lang)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <p className={`text-xs font-semibold ${theme.accent}`}>
                    {isDone ? t('Tổng chờ', 'Total wait', lang) : t('Đã chờ', 'Waited', lang)}
                  </p>
                  <span className={`text-lg font-black ${theme.number}`}>
                    {isDone && waitingStats.reachedTableAt
                      ? `${Math.floor((new Date(waitingStats.reachedTableAt).getTime() - new Date(certificate.created_at).getTime()) / 60000)} ${t('phút', 'min', lang)}`
                      : `${waitingStats.currentWaitMinutes} ${t('phút', 'min', lang)}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-5 py-3 ${theme.footerBg} border-t ${theme.border} flex items-center justify-between`}>
            <p className={`text-[10px] ${theme.footerText} font-medium`}>
              {t('Phiếu chờ điện tử', 'Digital Queue Card', lang)}
            </p>
            {/* Personalize button */}
            {!nameSubmitted && (
              <button
                onClick={() => setShowPersonalize(!showPersonalize)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${
                  isDark ? 'bg-white/10 text-white/50 hover:text-white/70' : 'bg-black/5 text-black/40 hover:text-black/60'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {t('Cá nhân hóa', 'Personalize', lang)}
              </button>
            )}
          </div>

          {/* Personalize panel (collapsible) */}
          {showPersonalize && !nameSubmitted && (
            <div className={`px-5 pb-5 pt-3 space-y-3 border-t ${theme.border} ${isDark ? 'bg-white/5' : 'bg-black/[0.02]'}`}>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                  <input
                    type="text"
                    placeholder={t('Tên của bạn', 'Your name', lang)}
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 ${
                      isDark
                        ? 'bg-white/10 border-white/10 text-white placeholder:text-white/30'
                        : 'bg-white border-black/10 text-black placeholder:text-black/30'
                    }`}
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
                isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'
              }`}>
                <Camera className="w-4 h-4" />
                <span className="text-xs font-semibold">{t('Thêm ảnh', 'Add Photo', lang)}</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          )}
        </div>

        {/* Theme selector */}
        <div className="space-y-3">
          <p className={`text-xs font-bold text-center ${isDark ? 'text-white/30' : 'text-black/30'}`}>
            {t('Chọn kiểu', 'Choose Style', lang)}
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {THEMES.map(th => (
              <button
                key={th.id}
                onClick={() => setTheme(th)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all active:scale-90 ${
                  theme.id === th.id
                    ? `${th.border} shadow-lg scale-105`
                    : `border-transparent ${isDark ? 'bg-white/5' : 'bg-white'} shadow-sm`
                }`}
              >
                <span className="text-lg">{th.emoji}</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-white/50' : 'text-black/50'}`}>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
