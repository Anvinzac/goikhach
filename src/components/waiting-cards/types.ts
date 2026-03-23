export type WaitingCardData = {
  queueNumber: number;
  restaurantName: string;
  restaurantTagline: string;
  partySize: number;
  checkInTime: string;
  checkInDate: string;
  waitingDuration: string;
  estimatedWait: string;
  dailySpecial: string;
  peopleAhead: number;
  peopleWaitingTotal: number;
  status: 'waiting' | 'called' | 'cancelled';
  language: 'VN' | 'EN';
};

// ─── Color token system for theme × layout separation ───
export type ThemeColors = {
  id: string;
  label: string;
  emoji: string;
  /** Page background (Tailwind class) */
  pageBg: string;
  /** Card/container background (CSS value) */
  cardBg: string;
  /** Card outer border color */
  cardBorder: string;
  /** Primary color — used for numbers, highlights */
  primary: string;
  /** Lighter primary — used for text on dark */
  primaryLight: string;
  /** Dimmed primary — used for labels, tracking text */
  primaryDim: string;
  /** Very faint primary — used for ultra-subtle elements */
  primaryFaint: string;
  /** Surface/tile background */
  surface: string;
  /** Surface border */
  surfaceBorder: string;
  /** Glow color for shadows & effects */
  glow: string;
  /** CSS gradient for the queue number text */
  numberGradient: string;
  /** Number text-shadow / glow filter */
  numberGlow: string;
};

export const THEME_PRESETS: ThemeColors[] = [
  {
    id: 'neon',
    label: 'Neon',
    emoji: '⚡',
    pageBg: 'bg-[#0a0014]',
    cardBg: 'linear-gradient(135deg, #0a0020 0%, #1a0030 40%, #0d0025 100%)',
    cardBorder: 'rgba(192,38,211,0.35)',
    primary: '#c026d3',
    primaryLight: '#e879f9',
    primaryDim: 'rgba(192,38,211,0.5)',
    primaryFaint: 'rgba(192,38,211,0.12)',
    surface: 'rgba(192,38,211,0.08)',
    surfaceBorder: 'rgba(192,38,211,0.18)',
    glow: 'rgba(192,38,211,0.25)',
    numberGradient: 'linear-gradient(180deg, #e879f9, #a855f7, #6366f1)',
    numberGlow: 'drop-shadow(0 0 30px rgba(192,38,211,0.5))',
  },
  {
    id: 'zen',
    label: 'Zen',
    emoji: '🧊',
    pageBg: 'bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255,255,255,0.18)',
    primary: '#a78bfa',
    primaryLight: 'rgba(255,255,255,0.9)',
    primaryDim: 'rgba(255,255,255,0.4)',
    primaryFaint: 'rgba(255,255,255,0.08)',
    surface: 'rgba(255,255,255,0.05)',
    surfaceBorder: 'rgba(255,255,255,0.1)',
    glow: 'rgba(167,139,250,0.2)',
    numberGradient: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
    numberGlow: 'drop-shadow(0 4px 20px rgba(255,255,255,0.15))',
  },
  {
    id: 'gold',
    label: 'Gold',
    emoji: '✦',
    pageBg: 'bg-[#0c0a09]',
    cardBg: 'linear-gradient(160deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%)',
    cardBorder: 'rgba(217,175,87,0.35)',
    primary: '#d9af57',
    primaryLight: '#fef3c7',
    primaryDim: 'rgba(217,175,87,0.5)',
    primaryFaint: 'rgba(217,175,87,0.1)',
    surface: 'rgba(217,175,87,0.06)',
    surfaceBorder: 'rgba(217,175,87,0.15)',
    glow: 'rgba(217,175,87,0.2)',
    numberGradient: 'linear-gradient(180deg, #fef3c7, #d9af57, #b8860b)',
    numberGlow: 'drop-shadow(0 0 20px rgba(217,175,87,0.3))',
  },
  {
    id: 'holo',
    label: 'Holo',
    emoji: '🔮',
    pageBg: 'bg-[#020617]',
    cardBg: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #020617 100%)',
    cardBorder: 'rgba(56,189,248,0.25)',
    primary: '#38bdf8',
    primaryLight: '#7dd3fc',
    primaryDim: 'rgba(56,189,248,0.5)',
    primaryFaint: 'rgba(56,189,248,0.08)',
    surface: 'rgba(56,189,248,0.05)',
    surfaceBorder: 'rgba(56,189,248,0.12)',
    glow: 'rgba(56,189,248,0.2)',
    numberGradient: 'linear-gradient(135deg, #38bdf8, #818cf8, #a78bfa, #38bdf8)',
    numberGlow: 'drop-shadow(0 0 25px rgba(56,189,248,0.4))',
  },
  {
    id: 'amoled',
    label: 'AMOLED',
    emoji: '◾',
    pageBg: 'bg-black',
    cardBg: '#000000',
    cardBorder: 'rgba(255,255,255,0.06)',
    primary: 'rgba(255,255,255,0.85)',
    primaryLight: 'rgba(255,255,255,0.92)',
    primaryDim: 'rgba(255,255,255,0.3)',
    primaryFaint: 'rgba(255,255,255,0.04)',
    surface: 'rgba(255,255,255,0.03)',
    surfaceBorder: 'rgba(255,255,255,0.06)',
    glow: 'rgba(139,92,246,0.08)',
    numberGradient: 'none',
    numberGlow: 'drop-shadow(0 0 40px rgba(255,255,255,0.06))',
  },
  {
    id: 'matrix',
    label: 'Matrix',
    emoji: '🟢',
    pageBg: 'bg-[#050a05]',
    cardBg: '#0a0f0a',
    cardBorder: 'rgba(0,255,157,0.15)',
    primary: '#00ff9d',
    primaryLight: '#00ff9d',
    primaryDim: 'rgba(0,255,157,0.5)',
    primaryFaint: 'rgba(0,255,157,0.06)',
    surface: 'rgba(0,255,157,0.05)',
    surfaceBorder: 'rgba(0,255,157,0.1)',
    glow: 'rgba(0,255,157,0.2)',
    numberGradient: 'none',
    numberGlow: 'drop-shadow(0 0 30px rgba(0,255,157,0.3))',
  },
  {
    id: 'cosmic',
    label: 'Cosmic',
    emoji: '🌌',
    pageBg: 'bg-[#0f172a]',
    cardBg: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    cardBorder: 'rgba(139,92,246,0.2)',
    primary: '#a78bfa',
    primaryLight: '#c4b5fd',
    primaryDim: 'rgba(167,139,250,0.5)',
    primaryFaint: 'rgba(139,92,246,0.08)',
    surface: 'rgba(139,92,246,0.06)',
    surfaceBorder: 'rgba(139,92,246,0.12)',
    glow: 'rgba(139,92,246,0.25)',
    numberGradient: 'linear-gradient(180deg, #e0d4ff, #a78bfa, #7c3aed)',
    numberGlow: 'drop-shadow(0 0 30px rgba(139,92,246,0.4))',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    pageBg: 'bg-[#0d0808]',
    cardBg: 'linear-gradient(160deg, #1a0a0a 0%, #1c0f08 50%, #0d0808 100%)',
    cardBorder: 'rgba(249,115,22,0.25)',
    primary: '#f97316',
    primaryLight: '#fdba74',
    primaryDim: 'rgba(249,115,22,0.5)',
    primaryFaint: 'rgba(249,115,22,0.08)',
    surface: 'rgba(249,115,22,0.05)',
    surfaceBorder: 'rgba(249,115,22,0.12)',
    glow: 'rgba(249,115,22,0.2)',
    numberGradient: 'linear-gradient(180deg, #fde68a, #f97316, #c2410c)',
    numberGlow: 'drop-shadow(0 0 25px rgba(249,115,22,0.35))',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    pageBg: 'bg-[#0a1628]',
    cardBg: 'linear-gradient(145deg, #0a1628 0%, #0c1e3a 50%, #0a1628 100%)',
    cardBorder: 'rgba(6,182,212,0.2)',
    primary: '#06b6d4',
    primaryLight: '#67e8f9',
    primaryDim: 'rgba(6,182,212,0.5)',
    primaryFaint: 'rgba(6,182,212,0.08)',
    surface: 'rgba(6,182,212,0.05)',
    surfaceBorder: 'rgba(6,182,212,0.12)',
    glow: 'rgba(6,182,212,0.2)',
    numberGradient: 'linear-gradient(180deg, #a5f3fc, #06b6d4, #0e7490)',
    numberGlow: 'drop-shadow(0 0 25px rgba(6,182,212,0.35))',
  },
  {
    id: 'sakura',
    label: 'Sakura',
    emoji: '🌸',
    pageBg: 'bg-[#0c0015]',
    cardBg: 'linear-gradient(170deg, #0c0015 0%, #1a0025 50%, #0c0015 100%)',
    cardBorder: 'rgba(236,72,153,0.2)',
    primary: '#ec4899',
    primaryLight: '#f9a8d4',
    primaryDim: 'rgba(236,72,153,0.5)',
    primaryFaint: 'rgba(236,72,153,0.08)',
    surface: 'rgba(236,72,153,0.05)',
    surfaceBorder: 'rgba(236,72,153,0.12)',
    glow: 'rgba(236,72,153,0.2)',
    numberGradient: 'linear-gradient(180deg, #fbcfe8, #ec4899, #be185d)',
    numberGlow: 'drop-shadow(0 0 25px rgba(236,72,153,0.35))',
  },
];

export type WaitingCardProps = {
  data: WaitingCardData;
  theme: ThemeColors;
  onToggleLanguage?: () => void;
  onPersonalize?: () => void;
};

export const labels = {
  VN: {
    queueNumber: 'Số',
    partySize: 'người',
    checkIn: 'từ lúc',
    ahead: 'Trước bạn',
    estimated: 'Ước tính',
    waited: 'Đã chờ',
    totalWaiting: 'Tổng đang chờ',
    waiting: 'Đang chờ',
    called: 'Được gọi',
    cancelled: 'Đã huỷ',
    dailySpecial: 'Hôm nay',
    personalize: 'Cá nhân hóa',
    minutes: 'phút',
    groups: 'nhóm',
    people: 'người',
  },
  EN: {
    queueNumber: 'No.',
    partySize: 'pax',
    checkIn: 'since',
    ahead: 'Before you',
    estimated: 'Estimated',
    waited: 'Waited',
    totalWaiting: 'Total waiting',
    waiting: 'Waiting',
    called: 'Called',
    cancelled: 'Cancelled',
    dailySpecial: 'Today',
    personalize: 'Personalize',
    minutes: 'min',
    groups: 'groups',
    people: 'pax',
  },
} as const;
