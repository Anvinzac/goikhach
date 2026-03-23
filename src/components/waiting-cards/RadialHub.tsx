import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';
import { type WaitingCardProps, labels } from './types';
import { ThemedNumber, ThemedActions } from './ThemedParts';
import { glowPulse } from './animations';

const orbitSpin = {
  rotate: 360,
  transition: { duration: 30, repeat: Infinity, ease: 'linear' as const },
};

const haloBreath = {
  scale: [1, 1.08, 1],
  opacity: [0.15, 0.25, 0.15],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.2 + i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function RadialHub({ data, theme, onToggleLanguage, onPersonalize }: WaitingCardProps) {
  const l = labels[data.language];
  const isDone = data.status === 'called';

  return (
    <motion.div className="relative w-full mx-auto overflow-hidden" initial="hidden" animate="visible">
      <div
        className="relative rounded-[32px] overflow-hidden border p-5"
        style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
      >
        {/* Top: Restaurant */}
        <motion.div className="text-center mb-2" custom={0} variants={fadeUp}>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: theme.primaryDim }}>{data.restaurantName}</p>
          <p className="text-[9px]" style={{ color: theme.primaryFaint }}>{data.restaurantTagline}</p>
        </motion.div>

        {/* Central hub */}
        <div className="relative flex items-center justify-center my-4" style={{ minHeight: 220 }}>
          {/* Rotating orbit ring */}
          <motion.div
            className="absolute w-52 h-52 rounded-full pointer-events-none"
            style={{ border: `1px dashed ${theme.surfaceBorder}` }}
            animate={orbitSpin}
          >
            {[0, 90, 180, 270].map((deg) => (
              <div
                key={deg}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ background: theme.primaryDim, top: '50%', left: '50%', transform: `rotate(${deg}deg) translateX(104px) translateY(-50%)` }}
              />
            ))}
          </motion.div>

          {/* Halo glow */}
          <motion.div
            className="absolute w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 70%)` }}
            animate={haloBreath}
          />

          {/* Center number */}
          <motion.div className="relative text-center z-10" custom={1} variants={fadeUp}>
            <ThemedNumber number={data.queueNumber} label={l.queueNumber} theme={theme} />
          </motion.div>

          {/* Left orbital: Party size */}
          <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 text-center" custom={2} variants={fadeUp}>
            <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }}>
              <Users className="w-3.5 h-3.5 mb-0.5" style={{ color: theme.primaryDim }} />
              <span className="text-lg font-black" style={{ color: theme.primaryLight }}>{data.partySize}</span>
              <span className="text-[7px] font-bold" style={{ color: theme.primaryDim }}>{l.partySize}</span>
            </div>
          </motion.div>

          {/* Right orbital: Wait time */}
          <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 text-center" custom={3} variants={fadeUp}>
            <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }}>
              <Clock className="w-3.5 h-3.5 mb-0.5" style={{ color: theme.primaryDim }} />
              <span className="text-lg font-black" style={{ color: theme.primaryLight }}>{isDone ? '—' : data.estimatedWait}</span>
              <span className="text-[7px] font-bold" style={{ color: theme.primaryDim }}>{l.estimated}</span>
            </div>
          </motion.div>
        </div>

        {/* Check-in */}
        <motion.div className="text-center mb-3" custom={4} variants={fadeUp}>
          <p className="text-[10px] font-medium" style={{ color: theme.primaryDim }}>
            {l.checkIn} {data.checkInTime} — {data.checkInDate}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-2 mb-3" custom={5} variants={fadeUp}>
          {[
            { label: l.ahead, value: isDone ? '✓' : String(data.peopleAhead) },
            { label: l.waited, value: data.waitingDuration },
            { label: l.totalWaiting, value: `${data.peopleWaitingTotal}` },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl px-2 py-2.5 text-center border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }}>
              <p className="text-[7px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{s.label}</p>
              <p className="text-xl font-black mt-0.5" style={{ color: theme.primaryLight }}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Daily special */}
        {data.dailySpecial && (
          <motion.div className="rounded-2xl px-3 py-2 mb-3 border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }} custom={6} variants={fadeUp}>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: theme.primaryDim }}>{l.dailySpecial}</p>
            <p className="text-xs font-semibold" style={{ color: theme.primaryLight }}>{data.dailySpecial}</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div custom={7} variants={fadeUp}>
          <ThemedActions status={data.status} language={data.language} theme={theme} onToggleLanguage={onToggleLanguage} onPersonalize={onPersonalize} />
        </motion.div>
      </div>
    </motion.div>
  );
}
