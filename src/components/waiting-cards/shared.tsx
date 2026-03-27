import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Globe, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { fadeInUp, staggerContainer, hoverScale, tapPress, statusPulse } from './animations';
import { labels, type WaitingCardData } from './types';
import { type ReactNode } from 'react';

// ─── CardContainer ───────────────────────────────────────
export function CardContainer({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={`relative w-full mx-auto overflow-hidden ${className}`}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      whileHover={hoverScale}
      whileTap={tapPress}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── HeaderSection ───────────────────────────────────────
export function HeaderSection({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      variants={fadeInUp}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── QueueNumber ─────────────────────────────────────────
export function QueueNumber({
  number,
  label,
  className = '',
  glowColor,
  style,
}: {
  number: number;
  label: string;
  className?: string;
  glowColor?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div className={`text-center ${className}`} variants={fadeInUp}>
      <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.5em] mb-1">{label}</p>
      <div className="relative inline-block">
        {glowColor && (
          <span
            className="absolute inset-0 text-8xl font-black blur-xl opacity-30"
            aria-hidden="true"
            style={{ color: glowColor }}
          >
            {number}
          </span>
        )}
        <motion.span
          className="relative text-8xl font-black leading-none"
          style={style}
          animate={{
            scale: [1, 1.02, 1],
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {number}
        </motion.span>
      </div>
    </motion.div>
  );
}

// ─── PartyInfo ───────────────────────────────────────────
export function PartyInfo({
  partySize,
  language,
  className = '',
  iconClassName = '',
  numberClassName = '',
  labelClassName = '',
}: {
  partySize: number;
  language: 'VN' | 'EN';
  className?: string;
  iconClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
}) {
  const l = labels[language];
  return (
    <motion.div className={`flex items-center gap-2 ${className}`} variants={fadeInUp}>
      <Users className={`w-5 h-5 ${iconClassName}`} />
      <span className={`text-3xl font-black ${numberClassName}`}>{partySize}</span>
      <span className={`text-xs font-semibold ${labelClassName}`}>{l.partySize}</span>
    </motion.div>
  );
}

// ─── TimeInfo ────────────────────────────────────────────
export function TimeInfo({
  time,
  date,
  label,
  className = '',
  timeClassName = '',
  dateClassName = '',
}: {
  time: string;
  date: string;
  label: string;
  className?: string;
  timeClassName?: string;
  dateClassName?: string;
}) {
  return (
    <motion.div className={`text-right ${className}`} variants={fadeInUp}>
      <p className={`text-sm font-bold leading-none ${timeClassName}`}>
        <span className="text-[10px] font-medium opacity-60">{label} </span>
        {time}
      </p>
      <p className={`text-[10px] font-medium ${dateClassName}`}>{date}</p>
    </motion.div>
  );
}

// ─── DailySpecialBanner ──────────────────────────────────
export function DailySpecialBanner({
  text,
  className = '',
  textClassName = '',
  deco,
  style,
}: {
  text: string;
  className?: string;
  textClassName?: string;
  deco?: ReactNode;
  style?: React.CSSProperties;
}) {
  if (!text) return null;
  return (
    <motion.div className={`rounded-2xl px-4 py-2.5 relative overflow-hidden ${className}`} variants={fadeInUp} style={style}>
      {deco && <span className="absolute top-1 right-2 text-2xl opacity-20">{deco}</span>}
      <p className={`text-xs font-bold ${textClassName}`}>{text}</p>
    </motion.div>
  );
}

// ─── QueueStats ──────────────────────────────────────────
export function QueueStats({
  data,
  isDone,
  className = '',
  tileClassName = '',
  labelClassName = '',
  valueClassName = '',
  tileStyle,
}: {
  data: WaitingCardData;
  isDone: boolean;
  className?: string;
  tileClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  tileStyle?: React.CSSProperties;
}) {
  const l = labels[data.language];
  const stats = [
    { label: l.ahead, value: isDone ? '✓' : String(data.peopleAhead) },
    { label: l.estimated, value: isDone ? '—' : data.estimatedWait },
    { label: l.waited, value: data.waitingDuration },
  ];
  return (
    <motion.div className={`grid grid-cols-3 gap-2 ${className}`} variants={fadeInUp}>
      {stats.map((s, i) => (
        <motion.div
          key={i}
          className={`rounded-2xl px-2 py-3 text-center ${tileClassName}`}
          style={tileStyle}
          variants={fadeInUp}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          <p className={`text-[8px] uppercase tracking-wider font-bold ${labelClassName}`}>{s.label}</p>
          <p className={`text-3xl font-black mt-1 ${valueClassName}`}>{s.value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── WaitInfo ────────────────────────────────────────────
export function WaitInfo({
  data,
  className = '',
  labelClassName = '',
  valueClassName = '',
}: {
  data: WaitingCardData;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  const l = labels[data.language];
  return (
    <motion.div className={`flex justify-between items-center ${className}`} variants={fadeInUp}>
      <p className={`text-xs font-semibold ${labelClassName}`}>{l.totalWaiting}</p>
      <span className={`text-base font-black ${valueClassName}`}>
        {data.peopleWaitingTotal} {l.people}
      </span>
    </motion.div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────
export function StatusBadge({
  status,
  language,
  className = '',
}: {
  status: 'waiting' | 'called' | 'cancelled' | 'expired';
  language: 'VN' | 'EN';
  className?: string;
}) {
  const l = labels[language];
  const configs = {
    waiting: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      label: l.waiting,
      colors: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    called: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: l.called,
      colors: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    cancelled: {
      icon: <XCircle className="w-3 h-3" />,
      label: l.cancelled,
      colors: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
    expired: {
      icon: <Clock className="w-3 h-3" />,
      label: l.expired,
      colors: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    },
  };
  const cfg = configs[status];
  return (
    <motion.div
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${cfg.colors} ${className}`}
      animate={statusPulse[status]}
    >
      {cfg.icon}
      <AnimatePresence mode="wait">
        <motion.span
          key={`${status}-${language}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {cfg.label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── FooterActions ───────────────────────────────────────
export function FooterActions({
  status,
  language,
  onToggleLanguage,
  onPersonalize,
  className = '',
  buttonClassName = '',
}: {
  status: 'waiting' | 'called' | 'cancelled' | 'expired';
  language: 'VN' | 'EN';
  onToggleLanguage?: () => void;
  onPersonalize?: () => void;
  className?: string;
  buttonClassName?: string;
}) {
  const l = labels[language];
  return (
    <motion.div className={`flex items-center justify-between ${className}`} variants={fadeInUp}>
      <StatusBadge status={status} language={language} />
      <div className="flex items-center gap-1.5">
        {onToggleLanguage && (
          <motion.button
            onClick={onToggleLanguage}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${buttonClassName}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="w-3 h-3" />
            {language === 'VN' ? 'EN' : 'VI'}
          </motion.button>
        )}
        {onPersonalize && (
          <motion.button
            onClick={onPersonalize}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${buttonClassName}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-3 h-3" />
            {l.personalize}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
