import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';
import { type WaitingCardProps, labels } from './types';
import { ThemedActions } from './ThemedParts';
import { staggerContainer } from './animations';

const thermalFlicker = {
  opacity: [1, 0.92, 1, 0.96, 1, 0.94, 1],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
};

const printReveal = {
  hidden: { opacity: 0, y: -8, scaleY: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scaleY: 1,
    transition: { delay: i * 0.12, duration: 0.3 },
  }),
};

export default function TicketStrip({ data, theme, onToggleLanguage, onPersonalize }: WaitingCardProps) {
  const l = labels[data.language];
  const isDone = data.status === 'called';

  const DottedLine = () => (
    <div
      className="w-full h-px my-2"
      style={{ backgroundImage: `repeating-linear-gradient(90deg, ${theme.surfaceBorder} 0px, ${theme.surfaceBorder} 4px, transparent 4px, transparent 10px)` }}
    />
  );

  const TearEdge = () => (
    <svg viewBox="0 0 400 12" className="w-full h-3" preserveAspectRatio="none">
      <path
        d={Array.from({ length: 25 }, (_, i) => `${i === 0 ? 'M' : 'L'}${i * 16},${i % 2 === 0 ? 0 : 12}`).join(' ') + ' L400,0'}
        fill="none" stroke={theme.surfaceBorder} strokeWidth="1"
      />
    </svg>
  );

  return (
    <motion.div className="relative w-full max-w-smmx-auto" variants={staggerContainer} initial="hidden" animate="visible">
      <div
        className="absolute inset-0 rounded-lg opacity-20 blur-xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${theme.glow}, transparent 70%)` }}
      />

      <motion.div
        className="relative rounded-lg overflow-hidden border"
        style={{ background: theme.cardBg, borderColor: theme.cardBorder, fontFamily: "'Be Vietnam Pro', 'Courier New', monospace" }}
        animate={thermalFlicker}
      >
        {/* Header */}
        <motion.div className="px-4 pt-4 pb-2 text-center" custom={0} variants={printReveal}>
          <p className="text-[9px] uppercase tracking-[0.5em] font-bold" style={{ color: theme.primaryDim }}>{data.restaurantName}</p>
          <p className="text-[8px] mt-0.5" style={{ color: theme.primaryFaint }}>{data.restaurantTagline}</p>
        </motion.div>

        <DottedLine />

        {/* Queue number */}
        <motion.div className="relative px-4 py-4 text-center" custom={1} variants={printReveal}>
          <span className="absolute inset-0 flex items-center justify-center text-[120px] font-black pointer-events-none select-none" style={{ color: theme.primaryFaint }}>
            {data.queueNumber}
          </span>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-1" style={{ color: theme.primaryDim }}>{l.queueNumber}</p>
          <motion.span
            className="relative text-7xl font-black leading-none block"
            style={{ color: theme.primary, textShadow: `0 0 30px ${theme.glow}` }}
            animate={{ scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          >
            {data.queueNumber}
          </motion.span>
        </motion.div>

        <TearEdge />

        {/* Receipt items */}
        <motion.div className="px-4 py-2 space-y-1.5" custom={2} variants={printReveal}>
          <Row label={l.partySize} value={`${data.partySize}`} icon={<Users className="w-3 h-3" />} theme={theme} />
          <Row label={l.checkIn} value={data.checkInTime} icon={<Clock className="w-3 h-3" />} theme={theme} />
          <div className="flex justify-end">
            <span className="text-[10px]" style={{ color: theme.primaryFaint }}>{data.checkInDate}</span>
          </div>
        </motion.div>

        <DottedLine />

        {/* Stats */}
        <motion.div className="px-4 py-2 space-y-1.5" custom={3} variants={printReveal}>
          <Row label={l.ahead} value={isDone ? '✓' : String(data.peopleAhead)} theme={theme} highlight />
          <Row label={l.estimated} value={isDone ? '—' : data.estimatedWait} theme={theme} highlight />
          <Row label={l.waited} value={data.waitingDuration} theme={theme} />
          <Row label={l.totalWaiting} value={`${data.peopleWaitingTotal} ${l.people}`} theme={theme} />
        </motion.div>

        <DottedLine />

        {/* Daily special */}
        {data.dailySpecial && (
          <motion.div className="px-4 py-2" custom={4} variants={printReveal}>
            <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: theme.primaryDim }}>{l.dailySpecial}</p>
            <p className="text-xs font-semibold" style={{ color: theme.primaryLight }}>{data.dailySpecial}</p>
          </motion.div>
        )}

        <TearEdge />

        {/* Footer */}
        <motion.div className="px-4 py-3" custom={5} variants={printReveal}>
          <ThemedActions status={data.status} language={data.language} theme={theme} onToggleLanguage={onToggleLanguage} onPersonalize={onPersonalize} />
        </motion.div>

        <div className="px-4 pb-3 text-center">
          <p className="text-[7px] uppercase tracking-[0.3em]" style={{ color: theme.primaryFaint }}>
            #{String(data.queueNumber).padStart(4, '0')} — {data.checkInDate}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value, icon, theme, highlight }: {
  label: string; value: string; icon?: React.ReactNode;
  theme: WaitingCardProps['theme']; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: theme.primaryDim }}>
        {icon}{label}
      </span>
      <span className="text-sm font-bold" style={{ color: highlight ? theme.primary : theme.primaryLight }}>{value}</span>
    </div>
  );
}
