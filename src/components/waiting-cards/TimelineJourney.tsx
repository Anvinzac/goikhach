import { motion } from 'framer-motion';
import { Users, Globe, Sparkles, Clock, MapPin, Bell } from 'lucide-react';
import { type WaitingCardProps, labels } from './types';
import { ThemedStatusBadge } from './ThemedParts';

const nodeReveal = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: 0.3 + i * 0.2, duration: 0.4, type: 'spring', stiffness: 200, damping: 20 },
  }),
};

const lineGrow = {
  hidden: { scaleY: 0 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: { delay: 0.2 + i * 0.2, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const contentSlide = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.4 + i * 0.2, duration: 0.4, ease: 'easeOut' },
  }),
};

type NodeStatus = 'done' | 'active' | 'pending';

export default function TimelineJourney({ data, theme, onToggleLanguage, onPersonalize }: WaitingCardProps) {
  const l = labels[data.language];
  const isDone = data.status === 'called';
  const isCancelled = data.status === 'cancelled';
  const btnStyle = { color: theme.primaryDim, background: theme.primaryFaint, border: `1px solid ${theme.surfaceBorder}` };

  const stages: { icon: React.ReactNode; label: string; detail: string; status: NodeStatus }[] = [
    { icon: <MapPin className="w-3.5 h-3.5" />, label: l.checkIn, detail: `${data.checkInTime} · ${data.checkInDate}`, status: 'done' },
    { icon: <Clock className="w-3.5 h-3.5" />, label: l.waiting, detail: `${data.partySize} ${l.partySize} · ${l.waited} ${data.waitingDuration}`, status: isDone ? 'done' : isCancelled ? 'done' : 'active' },
    { icon: <Users className="w-3.5 h-3.5" />, label: data.language === 'VN' ? 'Vị trí hiện tại' : 'Current position', detail: isDone ? '✓' : `${data.peopleAhead} ${data.language === 'VN' ? 'nhóm trước bạn' : 'groups ahead'}`, status: isDone ? 'done' : isCancelled ? 'pending' : 'active' },
    { icon: <Bell className="w-3.5 h-3.5" />, label: data.language === 'VN' ? 'Được gọi' : 'Called', detail: isDone ? l.called : `${l.estimated} ${data.estimatedWait}`, status: isDone ? 'active' : 'pending' },
  ];

  // Node colors derived from theme
  const nodeColors = (s: NodeStatus) => {
    if (s === 'done') return { bg: theme.surface, border: theme.primaryDim, text: theme.primaryLight, glow: theme.glow };
    if (s === 'active') return { bg: `${theme.primary}18`, border: `${theme.primary}80`, text: theme.primary, glow: `${theme.primary}30` };
    return { bg: theme.primaryFaint, border: theme.surfaceBorder, text: theme.primaryFaint, glow: 'transparent' };
  };

  return (
    <motion.div
      className="relative w-full mx-auto overflow-hidden rounded-3xl border"
      style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
      initial="hidden" animate="visible"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${theme.glow}40, transparent 70%)` }} />

      {/* Header */}
      <motion.div className="px-5 pt-5 pb-3 flex items-start justify-between" custom={0} variants={contentSlide}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: theme.primaryDim }}>{data.restaurantName}</p>
          <p className="text-[8px] mt-0.5" style={{ color: theme.primaryFaint }}>{data.restaurantTagline}</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] uppercase tracking-[0.3em] font-bold" style={{ color: theme.primaryDim }}>{l.queueNumber}</p>
          <motion.span
            className="text-4xl font-black leading-none"
            style={
              theme.numberGradient !== 'none'
                ? { background: theme.numberGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: theme.numberGlow }
                : { color: theme.primaryLight, filter: theme.numberGlow }
            }
            animate={{ scale: [1, 1.03, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          >
            {data.queueNumber}
          </motion.span>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="px-5 py-3">
        {stages.map((stage, i) => {
          const colors = nodeColors(stage.status);
          const isLast = i === stages.length - 1;
          const pendingIdx = stages.findIndex(s => s.status === 'pending');
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center" style={{ width: 28 }}>
                <motion.div
                  className="relative w-7 h-7 rounded-full flex items-center justify-center border-2 z-10"
                  style={{ background: colors.bg, borderColor: colors.border, color: colors.text, boxShadow: `0 0 12px ${colors.glow}` }}
                  custom={i} variants={nodeReveal}
                  animate={stage.status === 'active' ? { boxShadow: [`0 0 0 0 ${colors.glow}`, `0 0 0 10px transparent`, `0 0 0 0 ${colors.glow}`], transition: { duration: 2, repeat: Infinity } } : {}}
                >
                  {stage.icon}
                </motion.div>
                {!isLast && (
                  <motion.div
                    className="w-px flex-1 origin-top"
                    style={{ background: i < (pendingIdx === -1 ? stages.length : pendingIdx) ? `linear-gradient(180deg, ${theme.primaryDim}, ${theme.surfaceBorder})` : theme.surfaceBorder, minHeight: 32 }}
                    custom={i} variants={lineGrow}
                  />
                )}
              </div>

              <motion.div className={`flex-1 ${isLast ? 'pb-0' : 'pb-4'}`} custom={i} variants={contentSlide}>
                <p className="text-xs font-bold leading-none mt-1" style={{ color: colors.text }}>{stage.label}</p>
                <p className="text-[10px] font-medium mt-1" style={{ color: stage.status === 'pending' ? theme.primaryFaint : theme.primaryDim }}>{stage.detail}</p>

                {stage.status === 'active' && i === 2 && !isDone && (
                  <motion.div
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                    style={{ background: `${theme.primary}12`, borderColor: `${theme.primary}30` }}
                    animate={{ borderColor: [`${theme.primary}30`, `${theme.primary}60`, `${theme.primary}30`], transition: { duration: 2, repeat: Infinity } }}
                  >
                    <span className="text-2xl font-black" style={{ color: theme.primary }}>#{data.queueNumber}</span>
                    <span className="text-[9px] font-bold" style={{ color: theme.primaryDim }}>{data.language === 'VN' ? 'bạn ở đây' : "you're here"}</span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <motion.div className="mx-5 mb-3 grid grid-cols-2 gap-2" custom={4} variants={contentSlide}>
        <div className="rounded-xl px-3 py-2 text-center border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }}>
          <p className="text-[7px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{l.totalWaiting}</p>
          <p className="text-lg font-black" style={{ color: theme.primaryLight }}>{data.peopleWaitingTotal} <span className="text-[9px] font-bold opacity-50">{l.people}</span></p>
        </div>
        <div className="rounded-xl px-3 py-2 text-center border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }}>
          <p className="text-[7px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{l.estimated}</p>
          <p className="text-lg font-black" style={{ color: theme.primaryLight }}>{isDone ? '—' : data.estimatedWait}</p>
        </div>
      </motion.div>

      {/* Daily special */}
      {data.dailySpecial && (
        <motion.div className="mx-5 mb-3 rounded-xl px-3 py-2 border" style={{ background: theme.surface, borderColor: theme.surfaceBorder }} custom={5} variants={contentSlide}>
          <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: theme.primaryDim }}>{l.dailySpecial}</p>
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: theme.primaryLight }}>{data.dailySpecial}</p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: theme.surfaceBorder }} custom={6} variants={contentSlide}>
        <ThemedStatusBadge status={data.status} language={data.language} theme={theme} />
        <div className="flex items-center gap-1.5">
          {onToggleLanguage && (
            <motion.button onClick={onToggleLanguage} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={btnStyle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Globe className="w-3 h-3" />{data.language === 'VN' ? 'EN' : 'VI'}
            </motion.button>
          )}
          {onPersonalize && (
            <motion.button onClick={onPersonalize} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={btnStyle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Sparkles className="w-3 h-3" />{l.personalize}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
