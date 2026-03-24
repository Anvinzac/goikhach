import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { type ThemeColors, labels } from './types';

// ─── Themed Status Badge ─────────────────────────────────
export function ThemedStatusBadge({
  status,
  language,
  theme,
}: {
  status: 'waiting' | 'called' | 'cancelled';
  language: 'VN' | 'EN';
  theme: ThemeColors;
}) {
  const l = labels[language];
  const configs = {
    waiting: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: l.waiting, color: '#fbbf24' },
    called: { icon: <CheckCircle2 className="w-3 h-3" />, label: l.called, color: theme.primary },
    cancelled: { icon: <XCircle className="w-3 h-3" />, label: l.cancelled, color: '#ef4444' },
  };
  const c = configs[status];
  return (
    <motion.div
      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
      style={{ color: c.color, background: `${c.color}10`, border: `1px solid ${c.color}30` }}
      animate={
        status === 'waiting'
          ? {
              boxShadow: [`0 0 0 0 ${c.color}00`, `0 0 0 8px ${c.color}15`, `0 0 0 0 ${c.color}00`],
              transition: { duration: 2, repeat: Infinity },
            }
          : {}
      }
    >
      {c.icon}
      <AnimatePresence mode="wait">
        <motion.span
          key={`${status}-${language}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {c.label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Themed Footer Actions ───────────────────────────────
export function ThemedActions({
  status,
  language,
  theme,
  onToggleLanguage,
  onPersonalize,
}: {
  status: 'waiting' | 'called' | 'cancelled';
  language: 'VN' | 'EN';
  theme: ThemeColors;
  onToggleLanguage?: () => void;
  onPersonalize?: () => void;
}) {
  const l = labels[language];
  const btnStyle = {
    color: theme.primaryDim,
    background: theme.primaryFaint,
    border: `1px solid ${theme.surfaceBorder}`,
  };
  return (
    <div className="flex items-center justify-between">
      <ThemedStatusBadge status={status} language={language} theme={theme} />
      <div className="flex items-center gap-3">
        {onToggleLanguage && (
          <motion.button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
            style={btnStyle}
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
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
            style={btnStyle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-3 h-3" />
            {l.personalize}
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ─── Themed Queue Number ─────────────────────────────────
export function ThemedNumber({
  number,
  label,
  theme,
  size = 'large',
}: {
  number: number;
  label: string;
  theme: ThemeColors;
  size?: 'large' | 'medium' | 'small';
}) {
  const sizeClass = size === 'large' ? 'text-8xl' : size === 'medium' ? 'text-7xl' : 'text-4xl';
  const hasGradient = theme.numberGradient !== 'none';
  return (
    <div className="text-center">
      <p className="text-[10px] opacity-50 font-bold uppercase tracking-[0.5em] mb-1" style={{ color: theme.primaryDim }}>
        {label}
      </p>
      <div className="relative inline-block">
        {/* Glow behind */}
        <span
          className={`absolute inset-0 ${sizeClass} font-black blur-xl opacity-30 pointer-events-none`}
          aria-hidden="true"
          style={{ color: theme.primary }}
        >
          {number}
        </span>
        <motion.span
          className={`relative ${sizeClass} font-black leading-none`}
          style={
            hasGradient
              ? {
                  background: theme.numberGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: theme.numberGlow,
                }
              : { color: theme.primaryLight, filter: theme.numberGlow }
          }
          animate={{ scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          {number}
        </motion.span>
      </div>
    </div>
  );
}
