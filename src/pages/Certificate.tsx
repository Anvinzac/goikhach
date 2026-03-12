import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useCertificate } from '@/hooks/useCertificate';
import { ShieldX, Users, User, Camera, CheckCircle2, Globe, Sparkles } from 'lucide-react';

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
    deco: ['✦', '⟡', '◈'],
    decoColor: 'text-fuchsia-500/20',
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
    deco: ['❀', '✿', '⚘'],
    decoColor: 'text-pink-200',
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
    deco: ['〰', '≋', '∿'],
    decoColor: 'text-sky-200',
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
    deco: ['❧', '⌬', '✧'],
    decoColor: 'text-emerald-200',
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
    deco: ['★', '☽', '✧'],
    decoColor: 'text-amber-500/20',
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
    deco: ['▪', '●', '▫'],
    decoColor: 'text-zinc-300',
  },
];

const LAYOUTS = [
  { id: 'classic', label: '🎴', name: 'Classic' },
  { id: 'ticket', label: '🎫', name: 'Ticket' },
  { id: 'poster', label: '🎨', name: 'Poster' },
];

const DEMO_CERTIFICATE = {
  id: 'demo',
  order_id: 'demo-order',
  session_id: 'demo-session',
  secret_code: 'demo',
  order_number: 7,
  group_size: 3,
  is_used: true,
  browser_token: 'demo',
  customer_name: null as string | null,
  created_at: new Date().toISOString(),
};

const DEMO_SESSION = {
  session_type: 'lunch',
  daily_notice: 'Hôm nay quán có món đặc biệt: Bún riêu chay 🍜',
  started_at: new Date().toISOString(),
};

const DEMO_STATS = {
  groupsBefore: 3,
  totalPeopleWaiting: 12,
  estimatedMinutes: 9,
  currentWaitMinutes: 5,
  orderStatus: 'waiting',
  reachedTableAt: null,
};

// Floating decorations component
function ThemeDecorations({ theme, isDark }: { theme: typeof THEMES[0]; isDark: boolean }) {
  const positions = [
    'top-2 left-3', 'top-8 right-4', 'bottom-12 left-6', 'bottom-4 right-8',
    'top-1/3 left-1', 'top-2/3 right-2', 'bottom-1/3 left-10',
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {positions.map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} ${theme.decoColor} text-lg animate-pulse`}
          style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2 + i * 0.3}s` }}
        >
          {theme.deco[i % theme.deco.length]}
        </span>
      ))}
    </div>
  );
}

export default function Certificate() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const isDemo = location.pathname === '/c/demo';

  const hook = useCertificate(isDemo ? undefined : code);

  const certificate = isDemo ? DEMO_CERTIFICATE : hook.certificate;
  const sessionInfo = isDemo ? DEMO_SESSION : hook.sessionInfo;
  const waitingStats = isDemo ? DEMO_STATS : hook.waitingStats;
  const accessState = isDemo ? 'granted' : hook.accessState;
  const updateCustomerName = hook.updateCustomerName;

  const [theme, setTheme] = useState(THEMES[0]);
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [lang, setLang] = useState<Lang>('vi');
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [demoCertificate, setDemoCertificate] = useState(DEMO_CERTIFICATE);

  const activeCert = isDemo ? demoCertificate : certificate;

  const isDone = waitingStats.orderStatus === 'done';
  const isDark = theme.id === 'neon' || theme.id === 'midnight';

  useEffect(() => {
    document.documentElement.classList.add('certificate-page');
    document.body.classList.add('certificate-page');
    const root = document.getElementById('root');
    if (root) root.classList.add('certificate-page');
    return () => {
      document.documentElement.classList.remove('certificate-page');
      document.body.classList.remove('certificate-page');
      if (root) root.classList.remove('certificate-page');
    };
  }, []);

  const dayLabel = useMemo(() => {
    if (!activeCert) return '';
    const d = new Date(activeCert.created_at);
    const weekday = lang === 'vi'
      ? d.toLocaleDateString('vi-VN', { weekday: 'long' })
      : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${weekday}, ${dd}/${mm}`;
  }, [activeCert, lang]);

  const timeLabel = useMemo(() => {
    if (!activeCert) return '';
    return new Date(activeCert.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }, [activeCert]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleNameSubmit = useCallback(() => {
    if (customerName.trim()) {
      if (isDemo) {
        setDemoCertificate(prev => ({ ...prev, customer_name: customerName.trim() }));
      } else {
        updateCustomerName(customerName.trim());
      }
      setShowPersonalize(false);
    }
  }, [customerName, updateCustomerName, isDemo]);

  const toggleLang = () => setLang(l => l === 'vi' ? 'en' : 'vi');

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

  if (!activeCert || !sessionInfo) return null;

  const displayName = activeCert.customer_name;

  // --- LAYOUT: TICKET (horizontal stub feel) ---
  const renderTicketLayout = () => (
    <div className={`rounded-2xl overflow-hidden shadow-2xl border-2 ${theme.card} ${theme.border} relative`}>
      <ThemeDecorations theme={theme} isDark={isDark} />

      {/* Ticket top: giant number + stub */}
      <div className="relative overflow-hidden">
        {photoUrl && (
          <>
            <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          </>
        )}
        <div className={`relative ${!photoUrl ? theme.headerBg : ''} px-4 py-4 flex items-center gap-3`}>
          {/* Giant number circle */}
          <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'} flex flex-col items-center justify-center flex-shrink-0 backdrop-blur-sm`}>
            <span className={`text-[10px] font-semibold ${theme.headerText} opacity-50`}>{t('số', 'no.', lang)}</span>
            <span className={`text-3xl font-black leading-none ${theme.headerText}`}>{activeCert.order_number}</span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={`text-lg font-extrabold leading-tight ${theme.headerText}`}>
              {displayName ? t(`Phiếu chờ của ${displayName}`, `${displayName}'s card`, lang) : t('Phiếu chờ', 'Queue Card', lang)}
            </p>
            <p className={`text-[10px] ${theme.headerText} opacity-40 font-medium mt-0.5`}>
              Quán chay Lá – Vegetarian restaurant
            </p>
          </div>
          {/* Lang */}
          <button onClick={toggleLang} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm flex-shrink-0 ${isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-white/70'}`}>
            <Globe className="w-3 h-3" />{lang === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>
      </div>

      {/* Perforated line */}
      <div className="flex items-center px-2">
        <div className={`flex-1 border-t-2 border-dashed ${theme.border}`} />
        <span className={`px-2 text-lg ${theme.decoColor}`}>{theme.deco[0]}</span>
        <div className={`flex-1 border-t-2 border-dashed ${theme.border}`} />
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Inline: group + time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${theme.number}`} />
            <span className={`text-xl font-black ${theme.number}`}>{activeCert.group_size}</span>
            <span className={`text-xs font-semibold ${theme.labelColor}`}>{t('người', 'pax', lang)}</span>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${theme.accent} leading-none`}>{timeLabel}</p>
            <p className={`text-[10px] ${theme.labelColor} font-medium`}>{dayLabel}</p>
          </div>
        </div>

        {sessionInfo.daily_notice && (
          <div className={`${theme.accentBg} rounded-xl px-3 py-2`}>
            <p className={`text-xs font-bold ${theme.accent}`}>{sessionInfo.daily_notice}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`${theme.accentBg} rounded-xl px-3 py-2 text-center`}>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${theme.labelColor}`}>{t('Nhóm trước', 'Before you', lang)}</p>
            <p className={`text-2xl font-black ${theme.number} mt-0.5`}>{isDone ? <CheckCircle2 className={`w-6 h-6 mx-auto ${theme.number}`} /> : waitingStats.groupsBefore}</p>
          </div>
          <div className={`${theme.accentBg} rounded-xl px-3 py-2 text-center`}>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${theme.labelColor}`}>{t('Đang chờ', 'Waiting', lang)}</p>
            <p className={`text-2xl font-black ${theme.number} mt-0.5`}>{isDone ? '—' : waitingStats.totalPeopleWaiting}</p>
          </div>
        </div>

        {/* Wait times — always visible */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <p className={`text-xs font-semibold ${theme.accent}`}>
              {isDone ? t('Thời gian vào bàn', 'Reached table', lang) : t('Ước tính', 'Estimated', lang)}
            </p>
            <span className={`text-base font-black ${theme.number}`}>
              {isDone
                ? (waitingStats.reachedTableAt ? new Date(waitingStats.reachedTableAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—')
                : `~${waitingStats.estimatedMinutes} ${t('phút', 'min', lang)}`}
            </span>
          </div>
          <div className="flex justify-between items-center px-1">
            <p className={`text-xs font-semibold ${theme.accent}`}>
              {isDone ? t('Tổng chờ', 'Total wait', lang) : t('Đã chờ', 'Waited', lang)}
            </p>
            <span className={`text-base font-black ${theme.number}`}>
              {isDone && waitingStats.reachedTableAt
                ? `${Math.floor((new Date(waitingStats.reachedTableAt).getTime() - new Date(activeCert.created_at).getTime()) / 60000)} ${t('phút', 'min', lang)}`
                : `${waitingStats.currentWaitMinutes} ${t('phút', 'min', lang)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with personalize */}
      <div className={`px-4 py-2 ${theme.footerBg} border-t ${theme.border} flex items-center justify-between`}>
        <p className={`text-[10px] ${theme.footerText} font-medium`}>{t('Phiếu chờ điện tử', 'Digital Queue Card', lang)}</p>
        <button onClick={() => setShowPersonalize(!showPersonalize)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${isDark ? 'bg-white/10 text-white/50 hover:text-white/70' : 'bg-black/5 text-black/40 hover:text-black/60'}`}>
          <Sparkles className="w-3 h-3" />{t('Cá nhân hóa', 'Personalize', lang)}
        </button>
      </div>

      {showPersonalize && renderPersonalizePanel()}
    </div>
  );

  // --- LAYOUT: POSTER (big dramatic) ---
  const renderPosterLayout = () => (
    <div className={`rounded-3xl overflow-hidden shadow-2xl border-2 ${theme.card} ${theme.border} relative`}>
      <ThemeDecorations theme={theme} isDark={isDark} />

      {/* Dramatic hero: massive number */}
      <div className="relative overflow-hidden">
        {photoUrl && (
          <>
            <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
          </>
        )}
        <div className={`relative ${!photoUrl ? theme.headerBg : ''} px-4 pt-6 pb-4 text-center`}>
          {/* Lang top right */}
          <button onClick={toggleLang} className={`absolute top-2 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-white/70'}`}>
            <Globe className="w-3 h-3" />{lang === 'vi' ? 'EN' : 'VI'}
          </button>

          <p className={`text-[10px] ${theme.headerText} opacity-40 font-semibold uppercase tracking-[0.3em]`}>{t('số', 'no.', lang)}</p>
          <span className={`text-7xl font-black leading-none ${theme.headerText} drop-shadow-lg`} style={{ textShadow: isDark ? '0 0 40px rgba(255,255,255,0.15)' : '0 4px 20px rgba(0,0,0,0.1)' }}>
            {activeCert.order_number}
          </span>
          <p className={`text-lg font-extrabold ${theme.headerText} mt-2`}>
            {displayName ? t(`Phiếu chờ của ${displayName}`, `${displayName}'s card`, lang) : t('Phiếu chờ', 'Queue Card', lang)}
          </p>
          <p className={`text-[10px] ${theme.headerText} opacity-40 font-medium`}>
            Quán chay Lá – Vegetarian restaurant
          </p>
        </div>
      </div>

      {/* Dramatic stats row */}
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${theme.number}`} />
            <span className={`text-xl font-black ${theme.number}`}>{activeCert.group_size}</span>
            <span className={`text-xs font-semibold ${theme.labelColor}`}>{t('người', 'pax', lang)}</span>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${theme.accent} leading-none`}>{timeLabel}</p>
            <p className={`text-[10px] ${theme.labelColor} font-medium`}>{dayLabel}</p>
          </div>
        </div>

        {sessionInfo.daily_notice && (
          <div className={`${theme.accentBg} rounded-xl px-3 py-2`}>
            <p className={`text-xs font-bold ${theme.accent}`}>{sessionInfo.daily_notice}</p>
          </div>
        )}

        {/* Big dramatic stat circles */}
        <div className="flex gap-3 justify-center py-2">
          <div className={`w-24 h-24 rounded-full ${theme.accentBg} flex flex-col items-center justify-center`}>
            <p className={`text-[9px] uppercase tracking-wider font-semibold ${theme.labelColor}`}>{t('Nhóm trước', 'Before', lang)}</p>
            <p className={`text-3xl font-black ${theme.number}`}>{isDone ? '✓' : waitingStats.groupsBefore}</p>
          </div>
          <div className={`w-24 h-24 rounded-full ${theme.accentBg} flex flex-col items-center justify-center`}>
            <p className={`text-[9px] uppercase tracking-wider font-semibold ${theme.labelColor}`}>{t('Ước tính', 'Est.', lang)}</p>
            <p className={`text-3xl font-black ${theme.number}`}>{isDone ? '—' : `${waitingStats.estimatedMinutes}'`}</p>
          </div>
          <div className={`w-24 h-24 rounded-full ${theme.accentBg} flex flex-col items-center justify-center`}>
            <p className={`text-[9px] uppercase tracking-wider font-semibold ${theme.labelColor}`}>{t('Đã chờ', 'Waited', lang)}</p>
            <p className={`text-3xl font-black ${theme.number}`}>{`${waitingStats.currentWaitMinutes}'`}</p>
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <p className={`text-xs font-semibold ${theme.accent}`}>{t('Tổng đang chờ', 'Total waiting', lang)}</p>
          <span className={`text-base font-black ${theme.number}`}>{waitingStats.totalPeopleWaiting} {t('người', 'pax', lang)}</span>
        </div>
      </div>

      <div className={`px-4 py-2 ${theme.footerBg} border-t ${theme.border} flex items-center justify-between`}>
        <p className={`text-[10px] ${theme.footerText} font-medium`}>{t('Phiếu chờ điện tử', 'Digital Queue Card', lang)}</p>
        <button onClick={() => setShowPersonalize(!showPersonalize)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${isDark ? 'bg-white/10 text-white/50 hover:text-white/70' : 'bg-black/5 text-black/40 hover:text-black/60'}`}>
          <Sparkles className="w-3 h-3" />{t('Cá nhân hóa', 'Personalize', lang)}
        </button>
      </div>

      {showPersonalize && renderPersonalizePanel()}
    </div>
  );

  // --- LAYOUT: CLASSIC ---
  const renderClassicLayout = () => (
    <div className={`rounded-2xl overflow-hidden shadow-2xl border ${theme.card} ${theme.border} relative`}>
      <ThemeDecorations theme={theme} isDark={isDark} />

      {/* Header */}
      <div className="relative overflow-hidden">
        {photoUrl && (
          <>
            <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          </>
        )}
        <div className={`relative ${!photoUrl ? theme.headerBg : ''} px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-lg font-extrabold leading-tight ${theme.headerText}`}>
                {displayName ? t(`Phiếu chờ của ${displayName}`, `${displayName}'s queue card`, lang) : t('Phiếu chờ', 'Queue Card', lang)}
              </p>
              <p className={`text-[10px] ${theme.headerText} opacity-50 font-medium mt-0.5`}>
                Quán chay Lá – Vegetarian restaurant
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <button onClick={toggleLang} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-white/70'}`}>
                <Globe className="w-3 h-3" />{lang === 'vi' ? 'EN' : 'VI'}
              </button>
              <div className="text-right">
                <p className={`text-[10px] ${theme.headerText} opacity-40 font-semibold`}>{t('số', 'no.', lang)}</p>
                <span className={`text-4xl font-black leading-none ${theme.headerText}`}>{activeCert.order_number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${theme.accentBg} flex items-center justify-center`}>
              <Users className={`w-4 h-4 ${theme.number}`} />
            </div>
            <div>
              <p className={`text-xl font-black ${theme.number} leading-none`}>{activeCert.group_size} <span className={`text-xs font-semibold ${theme.labelColor}`}>{t('người', 'pax', lang)}</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${theme.accent} leading-none`}>{timeLabel}</p>
            <p className={`text-[10px] ${theme.labelColor} font-medium`}>{dayLabel}</p>
          </div>
        </div>

        {sessionInfo.daily_notice && (
          <div className={`${theme.accentBg} rounded-xl px-3 py-2`}>
            <p className={`text-xs font-bold ${theme.accent}`}>{sessionInfo.daily_notice}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className={`${theme.accentBg} rounded-xl px-3 py-2.5 text-center`}>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${theme.labelColor}`}>{t('Nhóm trước', 'Before you', lang)}</p>
            <p className={`text-2xl font-black ${theme.number} mt-0.5`}>{isDone ? <CheckCircle2 className={`w-6 h-6 mx-auto ${theme.number}`} /> : waitingStats.groupsBefore}</p>
          </div>
          <div className={`${theme.accentBg} rounded-xl px-3 py-2.5 text-center`}>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${theme.labelColor}`}>{t('Đang chờ', 'Waiting', lang)}</p>
            <p className={`text-2xl font-black ${theme.number} mt-0.5`}>{isDone ? '—' : waitingStats.totalPeopleWaiting}</p>
          </div>
        </div>

        {/* Wait times — always visible */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <p className={`text-xs font-semibold ${theme.accent}`}>
              {isDone ? t('Thời gian vào bàn', 'Reached table', lang) : t('Ước tính', 'Estimated', lang)}
            </p>
            <span className={`text-base font-black ${theme.number}`}>
              {isDone
                ? (waitingStats.reachedTableAt ? new Date(waitingStats.reachedTableAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—')
                : `~${waitingStats.estimatedMinutes} ${t('phút', 'min', lang)}`}
            </span>
          </div>
          <div className="flex justify-between items-center px-1">
            <p className={`text-xs font-semibold ${theme.accent}`}>
              {isDone ? t('Tổng chờ', 'Total wait', lang) : t('Đã chờ', 'Waited', lang)}
            </p>
            <span className={`text-base font-black ${theme.number}`}>
              {isDone && waitingStats.reachedTableAt
                ? `${Math.floor((new Date(waitingStats.reachedTableAt).getTime() - new Date(activeCert.created_at).getTime()) / 60000)} ${t('phút', 'min', lang)}`
                : `${waitingStats.currentWaitMinutes} ${t('phút', 'min', lang)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-4 py-2 ${theme.footerBg} border-t ${theme.border} flex items-center justify-between`}>
        <p className={`text-[10px] ${theme.footerText} font-medium`}>{t('Phiếu chờ điện tử', 'Digital Queue Card', lang)}</p>
        <button onClick={() => setShowPersonalize(!showPersonalize)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${isDark ? 'bg-white/10 text-white/50 hover:text-white/70' : 'bg-black/5 text-black/40 hover:text-black/60'}`}>
          <Sparkles className="w-3 h-3" />{t('Cá nhân hóa', 'Personalize', lang)}
        </button>
      </div>

      {showPersonalize && renderPersonalizePanel()}
    </div>
  );

  const renderPersonalizePanel = () => (
    <div className={`px-4 pb-4 pt-2 space-y-2 border-t ${theme.border} ${isDark ? 'bg-white/5' : 'bg-black/[0.02]'}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <User className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
          <input
            type="text"
            placeholder={t('Tên của bạn', 'Your name', lang)}
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 ${
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
          className={`px-3 py-2 rounded-xl font-bold text-sm ${theme.headerBg} ${theme.headerText} disabled:opacity-30 active:scale-95 transition-all`}
        >
          OK
        </button>
      </div>
      <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed cursor-pointer active:scale-[0.98] transition-all ${
        isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'
      }`}>
        <Camera className="w-4 h-4" />
        <span className="text-xs font-semibold">{photoUrl ? t('Đổi ảnh', 'Change Photo', lang) : t('Thêm ảnh', 'Add Photo', lang)}</span>
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
      </label>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.pageBg}`} style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <div className="p-3 pb-6 max-w-md mx-auto space-y-3">

        {/* THE CARD — layout-dependent */}
        {layout.id === 'ticket' ? renderTicketLayout() : layout.id === 'poster' ? renderPosterLayout() : renderClassicLayout()}

        {/* Customization row 1: Theme */}
        <div className="space-y-1.5">
          <p className={`text-[10px] font-bold text-center ${isDark ? 'text-white/20' : 'text-black/20'}`}>
            {t('Chọn kiểu', 'Style', lang)}
          </p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {THEMES.map(th => (
              <button
                key={th.id}
                onClick={() => setTheme(th)}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border transition-all active:scale-90 ${
                  theme.id === th.id
                    ? `${th.border} shadow-lg scale-105 border-2`
                    : `border-transparent ${isDark ? 'bg-white/5' : 'bg-white/80'} shadow-sm`
                }`}
              >
                <span className="text-base">{th.emoji}</span>
                <span className={`text-[9px] font-bold ${isDark ? 'text-white/40' : 'text-black/40'}`}>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Customization row 2: Layout */}
        <div className="space-y-1.5">
          <p className={`text-[10px] font-bold text-center ${isDark ? 'text-white/20' : 'text-black/20'}`}>
            {t('Bố cục', 'Layout', lang)}
          </p>
          <div className="flex gap-2 justify-center">
            {LAYOUTS.map(l => (
              <button
                key={l.id}
                onClick={() => setLayout(l)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all active:scale-90 ${
                  layout.id === l.id
                    ? `${theme.border} shadow-lg border-2 ${isDark ? 'bg-white/10' : 'bg-white'}`
                    : `border-transparent ${isDark ? 'bg-white/5' : 'bg-white/80'} shadow-sm`
                }`}
              >
                <span className="text-sm">{l.label}</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-white/40' : 'text-black/40'}`}>{l.name}</span>
              </button>
            ))}
          </div>
        </div>

        {isDemo && (
          <p className={`text-center text-[10px] font-bold ${isDark ? 'text-white/20' : 'text-black/20'}`}>
            ✦ Demo preview ✦
          </p>
        )}

      </div>
    </div>
  );
}
