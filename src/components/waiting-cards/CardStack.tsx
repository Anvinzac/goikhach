import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';
import { type WaitingCardProps, labels } from './types';
import { ThemedNumber, ThemedActions } from './ThemedParts';

const stackReveal = {
  hidden: { opacity: 0, y: 40, rotateX: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
  }),
};

export default function CardStack({ data, theme, onToggleLanguage, onPersonalize }: WaitingCardProps) {
  const l = labels[data.language];
  const isDone = data.status === 'called';

  return (
    <motion.div className="relative w-full mx-auto" style={{ perspective: 1000 }} initial="hidden" animate="visible">
      {/* BACK LAYER: Container + Restaurant */}
      <motion.div
        className="relative rounded-3xl overflow-hidden border p-4"
        style={{ background: theme.cardBg, borderColor: theme.cardBorder, transformStyle: 'preserve-3d' }}
        custom={0} variants={stackReveal}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        {/* Rotating conic glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{ background: `conic-gradient(from 180deg, ${theme.glow}, ${theme.primary}20, ${theme.glow}60, ${theme.primary}10)`, filter: 'blur(40px)' }}
          animate={{ rotate: [0, 360], transition: { duration: 20, repeat: Infinity, ease: 'linear' } }}
        />

        <div className="relative text-center mb-3">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: theme.primaryDim }}>{data.restaurantName}</p>
          <p className="text-[8px] mt-0.5" style={{ color: theme.primaryFaint }}>{data.restaurantTagline}</p>
        </div>

        {/* MIDDLE LAYER: Stats */}
        <motion.div
          className="relative rounded-2xl overflow-hidden border p-3 mb-3"
          style={{
            background: theme.surface,
            borderColor: theme.surfaceBorder,
            backdropFilter: 'blur(8px)',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(20px)',
          }}
          custom={1} variants={stackReveal}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: theme.primaryDim }} />
              <span className="text-xl font-black" style={{ color: theme.primaryLight }}>{data.partySize}</span>
              <span className="text-[10px] font-bold" style={{ color: theme.primaryDim }}>{l.partySize}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold" style={{ color: theme.primaryLight }}>
                <span className="text-[9px] font-medium opacity-60">{l.checkIn} </span>{data.checkInTime}
              </p>
              <p className="text-[9px]" style={{ color: theme.primaryFaint }}>{data.checkInDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: l.ahead, value: isDone ? '✓' : String(data.peopleAhead) },
              { label: l.estimated, value: isDone ? '—' : data.estimatedWait },
              { label: l.waited, value: data.waitingDuration },
            ].map((s, i) => (
              <div key={i} className="rounded-xl px-2 py-2 text-center border" style={{ background: theme.primaryFaint, borderColor: theme.surfaceBorder }}>
                <p className="text-[7px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{s.label}</p>
                <p className="text-xl font-black mt-0.5" style={{ color: theme.primaryLight }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-semibold" style={{ color: theme.primaryDim }}>{l.totalWaiting}</p>
            <span className="text-sm font-black" style={{ color: theme.primaryLight }}>{data.peopleWaitingTotal} {l.people}</span>
          </div>
        </motion.div>

        {/* Daily special */}
        {data.dailySpecial && (
          <motion.div className="rounded-xl px-3 py-2 mb-3 border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }} custom={2} variants={stackReveal}>
            <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{l.dailySpecial}</p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: theme.primaryLight }}>{data.dailySpecial}</p>
          </motion.div>
        )}

        {/* FRONT LAYER: Number + Status */}
        <motion.div
          className="relative rounded-2xl overflow-hidden border"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
            backdropFilter: 'blur(12px)',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(40px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${theme.glow}30`,
          }}
          custom={3} variants={stackReveal}
          whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 30%, ${theme.glow}, transparent 60%)` }} />

          <div className="relative px-4 py-4 text-center">
            <ThemedNumber number={data.queueNumber} label={l.queueNumber} theme={theme} size="medium" />
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-t" style={{ borderColor: theme.surfaceBorder }}>
            <ThemedActions status={data.status} language={data.language} theme={theme} onToggleLanguage={onToggleLanguage} onPersonalize={onPersonalize} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
