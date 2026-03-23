import { motion } from 'framer-motion';
import { Users, Clock, Globe, Sparkles } from 'lucide-react';
import { type WaitingCardProps, labels } from './types';
import { ThemedNumber, ThemedStatusBadge } from './ThemedParts';

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function SplitScreen({ data, theme, onToggleLanguage, onPersonalize }: WaitingCardProps) {
  const l = labels[data.language];
  const isDone = data.status === 'called';
  const btnStyle = { color: theme.primaryDim, background: theme.primaryFaint, border: `1px solid ${theme.surfaceBorder}` };

  return (
    <motion.div
      className="relative w-full mx-auto overflow-hidden rounded-3xl border"
      style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
      initial="hidden"
      animate="visible"
    >
      <div className="flex min-h-[400px]">
        {/* LEFT 58%: Visual / Number */}
        <motion.div
          className="relative overflow-hidden flex items-center justify-center"
          style={{ width: '58%' }}
          variants={slideInLeft}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 30% 40%, ${theme.glow}, transparent 60%)` }} />

          {/* Giant watermark */}
          <span
            className="absolute text-[200px] font-black pointer-events-none select-none leading-none"
            style={{ color: theme.primaryFaint, top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)' }}
          >
            {data.queueNumber}
          </span>

          <div className="relative text-center z-10 px-4">
            <ThemedNumber number={data.queueNumber} label={l.queueNumber} theme={theme} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold mt-4" style={{ color: theme.primaryDim }}>{data.restaurantName}</p>
            <p className="text-[8px] mt-0.5" style={{ color: theme.primaryFaint }}>{data.restaurantTagline}</p>
            <div className="mt-6">
              <ThemedStatusBadge status={data.status} language={data.language} theme={theme} />
            </div>
          </div>

          {/* Vertical separator */}
          <div className="absolute right-0 top-4 bottom-4 w-px" style={{ background: `linear-gradient(180deg, transparent, ${theme.cardBorder}, transparent)` }} />
        </motion.div>

        {/* RIGHT 42%: Data */}
        <div className="flex-1 flex flex-col justify-between py-4 px-3" style={{ width: '42%' }}>
          <div className="space-y-3">
            <motion.div custom={0} variants={slideInRight}>
              <DataBlock icon={<Users className="w-3.5 h-3.5" />} label={l.partySize} value={String(data.partySize)} theme={theme} large />
            </motion.div>
            <motion.div custom={1} variants={slideInRight}>
              <DataBlock icon={<Clock className="w-3.5 h-3.5" />} label={l.checkIn} value={data.checkInTime} sub={data.checkInDate} theme={theme} />
            </motion.div>
            <motion.div className="h-px mx-1" style={{ background: theme.surfaceBorder }} custom={2} variants={slideInRight} />
            <motion.div className="space-y-2" custom={3} variants={slideInRight}>
              <DataBlock label={l.ahead} value={isDone ? '✓' : String(data.peopleAhead)} theme={theme} highlight />
              <DataBlock label={l.estimated} value={isDone ? '—' : data.estimatedWait} theme={theme} highlight />
              <DataBlock label={l.waited} value={data.waitingDuration} theme={theme} />
              <DataBlock label={l.totalWaiting} value={`${data.peopleWaitingTotal} ${l.people}`} theme={theme} />
            </motion.div>
          </div>

          {data.dailySpecial && (
            <motion.div className="mt-3 rounded-xl px-2.5 py-2 border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }} custom={4} variants={slideInRight}>
              <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{l.dailySpecial}</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: theme.primaryLight }}>{data.dailySpecial}</p>
            </motion.div>
          )}

          <motion.div className="flex items-center gap-1.5 mt-3" custom={5} variants={slideInRight}>
            {onToggleLanguage && (
              <motion.button onClick={onToggleLanguage} className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold" style={btnStyle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Globe className="w-2.5 h-2.5" />{data.language === 'VN' ? 'EN' : 'VI'}
              </motion.button>
            )}
            {onPersonalize && (
              <motion.button onClick={onPersonalize} className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold" style={btnStyle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Sparkles className="w-2.5 h-2.5" />{l.personalize}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function DataBlock({ icon, label, value, sub, large, highlight, theme }: {
  icon?: React.ReactNode; label: string; value: string; sub?: string;
  large?: boolean; highlight?: boolean; theme: WaitingCardProps['theme'];
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span style={{ color: theme.primaryDim }}>{icon}</span>}
        <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{label}</span>
      </div>
      <p className={`font-black leading-none ${large ? 'text-2xl' : 'text-base'}`} style={{ color: highlight ? theme.primary : theme.primaryLight }}>{value}</p>
      {sub && <p className="text-[9px] mt-0.5" style={{ color: theme.primaryFaint }}>{sub}</p>}
    </div>
  );
}
