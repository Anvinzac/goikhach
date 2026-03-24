import { useState, useMemo, useCallback, useEffect, useRef, type ComponentType } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useCertificate } from '@/hooks/useCertificate';
import { ShieldX, User, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ClassicCard,
  TicketStrip,
  RadialHub,
  SplitScreen,
  CardStack,
  TimelineJourney,
  THEME_PRESETS,
} from '@/components/waiting-cards';
import { type WaitingCardData, type WaitingCardProps } from '@/components/waiting-cards/types';

type Lang = 'VN' | 'EN';

const LAYOUTS: {
  id: string;
  label: string;
  emoji: string;
  component: ComponentType<WaitingCardProps>;
}[] = [
  { id: 'classic', label: 'Classic', emoji: '🎴', component: ClassicCard },
  { id: 'ticket', label: 'Ticket', emoji: '🧾', component: TicketStrip },
  { id: 'radial', label: 'Radial', emoji: '🎯', component: RadialHub },
  { id: 'split', label: 'Split', emoji: '🪟', component: SplitScreen },
  { id: 'stack', label: 'Stack', emoji: '🃏', component: CardStack },
  { id: 'timeline', label: 'Journey', emoji: '🛤', component: TimelineJourney },
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
  daily_notice: 'Hôm nay quán có món đặc biệt: Bún riêu chay',
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

  const [layoutIdx, setLayoutIdx] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [lang, setLang] = useState<Lang>('VN');
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [demoCertificate, setDemoCertificate] = useState(DEMO_CERTIFICATE);
  const [demoStatus, setDemoStatus] = useState<string>('waiting');
  const cardRef = useRef<HTMLDivElement>(null);

  const layout = LAYOUTS[layoutIdx];
  const theme = THEME_PRESETS[themeIdx];
  const isLight = theme.mode === 'light';
  const activeCert = isDemo ? demoCertificate : certificate;

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
    const weekday = lang === 'VN'
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

  const toggleLang = () => setLang(l => l === 'VN' ? 'EN' : 'VN');

  const handleExportCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `queue-card-${activeCert?.order_number || 'unknown'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  }, [activeCert]);

  const cycleStatus = () => {
    const statuses = ['waiting', 'called', 'cancelled'];
    setDemoStatus(s => statuses[(statuses.indexOf(s) + 1) % statuses.length]);
  };

  // Access control screens
  if (accessState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessState === 'not_found') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 text-center gap-4">
        <ShieldX className="w-16 h-16 text-white/30" />
        <h1 className="text-2xl font-bold text-white/70">
          {lang === 'VN' ? 'Không tìm thấy phiếu' : 'Certificate not found'}
        </h1>
      </div>
    );
  }

  if (accessState === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 text-center gap-4">
        <ShieldX className="w-16 h-16 text-red-400/50" />
        <h1 className="text-2xl font-bold text-white/70">
          {lang === 'VN' ? 'Phiếu đã được sử dụng' : 'Certificate already claimed'}
        </h1>
        <p className="text-white/30 text-sm">
          {lang === 'VN' ? 'Phiếu này đã được sử dụng trên thiết bị khác.' : 'This certificate has been claimed on another device.'}
        </p>
      </div>
    );
  }

  if (!activeCert || !sessionInfo) return null;

  const orderStatus = isDemo ? demoStatus : (waitingStats.orderStatus as string);
  const isDone = orderStatus === 'done' || orderStatus === 'called';

  // Build shared data model
  const cardData: WaitingCardData = {
    queueNumber: activeCert.order_number,
    restaurantName: 'Quán chay Lá',
    restaurantTagline: 'Vegetarian restaurant',
    partySize: activeCert.group_size,
    checkInTime: timeLabel,
    checkInDate: dayLabel,
    waitingDuration: `${waitingStats.currentWaitMinutes}'`,
    estimatedWait: isDone ? '—' : `${waitingStats.estimatedMinutes}'`,
    dailySpecial: sessionInfo.daily_notice || '',
    peopleAhead: waitingStats.groupsBefore,
    peopleWaitingTotal: waitingStats.totalPeopleWaiting,
    status: orderStatus === 'done' ? 'called' : (orderStatus as 'waiting' | 'called' | 'cancelled'),
    language: lang,
  };

  const LayoutComponent = layout.component;

  return (
    <div className={`min-h-screen ${theme.pageBg} transition-colors duration-500`} style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <div className="p-3 pb-6 max-w-md mx-auto space-y-3">

        {/* The card */}
        <div ref={cardRef} onClick={isDemo ? cycleStatus : undefined} className={isDemo ? 'cursor-pointer' : ''}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${layout.id}-${theme.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <LayoutComponent
                data={cardData}
                theme={theme}
                onToggleLanguage={toggleLang}
                onPersonalize={() => setShowPersonalize(!showPersonalize)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Personalization panel */}
        <AnimatePresence>
          {showPersonalize && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`backdrop-blur-sm rounded-2xl border p-4 space-y-2 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'}`}>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <User className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
                    <input
                      type="text"
                      placeholder={lang === 'VN' ? 'Tên của bạn' : 'Your name'}
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 ${isLight ? 'bg-black/5 border-black/10 text-black placeholder:text-black/30 focus:ring-black/20' : 'bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:ring-fuchsia-400/50'}`}
                      onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                    />
                  </div>
                  <button
                    onClick={handleNameSubmit}
                    disabled={!customerName.trim()}
                    className="px-3 py-2 rounded-xl font-bold text-sm disabled:opacity-30 active:scale-95 transition-all"
                    style={{ background: theme.primary, color: isLight ? '#fff' : '#fff' }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export button */}
        <button
          onClick={handleExportCard}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${isLight ? 'bg-black/8 text-black/40 hover:text-black/60' : 'bg-white/10 text-white/50 hover:text-white/70'}`}
        >
          <Download className="w-3.5 h-3.5" />
          {lang === 'VN' ? 'Lưu ảnh phiếu chờ' : 'Save card as image'}
        </button>

        {/* ─── LAYOUT SELECTOR ─── */}
        <div className="space-y-1.5">
          <p className={`text-[10px] font-bold text-center ${isLight ? 'text-black/25' : 'text-white/20'}`}>
            {lang === 'VN' ? 'Bố cục' : 'Layout'}
          </p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {LAYOUTS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setLayoutIdx(i)}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border transition-all active:scale-90 ${
                  layoutIdx === i
                    ? isLight ? 'border-black/20 shadow-lg scale-105 border-2 bg-black/8' : 'border-white/30 shadow-lg scale-105 border-2 bg-white/10'
                    : isLight ? 'border-transparent bg-black/4 shadow-sm' : 'border-transparent bg-white/5 shadow-sm'
                }`}
              >
                <span className="text-base">{l.emoji}</span>
                <span className={`text-[9px] font-bold ${isLight ? 'text-black/40' : 'text-white/40'}`}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── THEME / COLOR SELECTOR ─── */}
        <div className="space-y-1.5">
          <p className={`text-[10px] font-bold text-center ${isLight ? 'text-black/25' : 'text-white/20'}`}>
            {lang === 'VN' ? 'Màu sắc' : 'Color'}
          </p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {THEME_PRESETS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setThemeIdx(i)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border transition-all active:scale-90 ${
                  themeIdx === i
                    ? isLight ? 'border-black/20 shadow-lg scale-105 border-2 bg-black/8' : 'border-white/30 shadow-lg scale-105 border-2 bg-white/10'
                    : isLight ? 'border-transparent bg-black/4 shadow-sm' : 'border-transparent bg-white/5 shadow-sm'
                }`}
              >
                <span className="text-sm">{t.emoji}</span>
                <span className={`text-[8px] font-bold ${isLight ? 'text-black/40' : 'text-white/40'}`}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isDemo && (
          <p className={`text-center text-[10px] font-bold ${isLight ? 'text-black/20' : 'text-white/20'}`}>
            Demo — tap card to cycle status
          </p>
        )}
      </div>
    </div>
  );
}
