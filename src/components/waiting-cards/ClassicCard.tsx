import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';
import { type WaitingCardProps, labels } from './types';
import { ThemedNumber, ThemedActions } from './ThemedParts';
import { fadeInUp, staggerContainer, shimmer, gradientShift } from './animations';

export default function ClassicCard({ data, theme, onToggleLanguage, onPersonalize }: WaitingCardProps) {
  const l = labels[data.language];
  const isDone = data.status === 'called';

  return (
    <motion.div
      className="relative w-full mx-auto overflow-hidden rounded-3xl border-2"
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
        boxShadow: `0 0 60px ${theme.glow}, 0 0 120px ${theme.glow}40`,
      }}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.primary}30, transparent)`,
          backgroundSize: '200% 100%',
        }}
        animate={gradientShift}
      />

      {/* Header */}
      <motion.div className="relative px-5 pt-5 pb-8" variants={fadeInUp}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: theme.primaryDim }}>
            {data.restaurantName}
          </p>
          <span className="text-[9px] font-medium" style={{ color: theme.primaryFaint }}>
            {data.restaurantTagline}
          </span>
        </div>

        <ThemedNumber number={data.queueNumber} label={l.queueNumber} theme={theme} />

        {/* Shimmer separator */}
        <div className="relative h-px mt-4 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}30, transparent)` }} />
          <motion.div
            className="absolute inset-y-0 w-20"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}80, transparent)` }}
            animate={shimmer}
          />
        </div>
      </motion.div>

      {/* Body */}
      <div className="relative px-4 py-3 space-y-3">
        {/* Party + Time */}
        <motion.div className="flex items-center justify-between" variants={fadeInUp}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: theme.primaryDim }} />
            <span className="text-3xl font-black" style={{ color: theme.primaryLight }}>{data.partySize}</span>
            <span className="text-xs font-semibold" style={{ color: theme.primaryDim }}>{l.partySize}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold leading-none" style={{ color: theme.primaryLight }}>
              <span className="text-[10px] font-medium opacity-60" style={{ color: theme.primaryDim }}>{l.checkIn} </span>
              {data.checkInTime}
            </p>
            <p className="text-[10px] font-medium" style={{ color: theme.primaryDim }}>{data.checkInDate}</p>
          </div>
        </motion.div>

        {/* Daily special */}
        {data.dailySpecial && (
          <motion.div
            className="rounded-2xl px-4 py-2.5 relative overflow-hidden border"
            style={{ background: theme.surface, borderColor: theme.surfaceBorder }}
            variants={fadeInUp}
          >
            <p className="text-xs font-bold" style={{ color: theme.primaryLight }}>{data.dailySpecial}</p>
          </motion.div>
        )}

        {/* Stats grid */}
        <motion.div className="grid grid-cols-3 gap-2" variants={fadeInUp}>
          {[
            { label: l.ahead, value: isDone ? '✓' : String(data.peopleAhead) },
            { label: l.estimated, value: isDone ? '—' : data.estimatedWait },
            { label: l.waited, value: data.waitingDuration },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="rounded-2xl px-2 py-3 text-center border"
              style={{ background: theme.surface, borderColor: theme.surfaceBorder }}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{s.label}</p>
              <p className="text-3xl font-black mt-1" style={{ color: theme.primaryLight }}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Total waiting */}
        <motion.div className="flex justify-between items-center px-1" variants={fadeInUp}>
          <p className="text-xs font-semibold" style={{ color: theme.primaryLight }}>{l.totalWaiting}</p>
          <span className="text-base font-black" style={{ color: theme.primaryLight }}>
            {data.peopleWaitingTotal} {l.people}
          </span>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t" style={{ borderColor: theme.surfaceBorder, background: theme.primaryFaint }}>
        <ThemedActions
          status={data.status}
          language={data.language}
          theme={theme}
          onToggleLanguage={onToggleLanguage}
          onPersonalize={onPersonalize}
        />
      </div>
    </motion.div>
  );
}
