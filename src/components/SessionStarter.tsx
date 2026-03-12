import { useState } from 'react';
import { UtensilsCrossed, Moon } from 'lucide-react';

interface SessionStarterProps {
  onStart: (type: 'lunch' | 'dinner', dailyNotice?: string) => void;
  loading: boolean;
}

export function SessionStarter({ onStart, loading }: SessionStarterProps) {
  const [dailyNotice, setDailyNotice] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-black text-center">Start New Session</h1>
      <p className="text-muted-foreground text-center font-medium">Choose the meal service to begin</p>

      <div className="w-full max-w-sm">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
          Thông báo hôm nay · Daily Notice (optional)
        </label>
        <input
          type="text"
          value={dailyNotice}
          onChange={e => setDailyNotice(e.target.value)}
          placeholder="e.g. Happy Valentine's Day! 🌹"
          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onStart('lunch', dailyNotice)}
          disabled={loading}
          className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-sharing text-sharing-foreground font-bold text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <UtensilsCrossed className="w-10 h-10" />
          Lunch
        </button>
        <button
          onClick={() => onStart('dinner', dailyNotice)}
          disabled={loading}
          className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-queue text-queue-foreground font-bold text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <Moon className="w-10 h-10" />
          Dinner
        </button>
      </div>
    </div>
  );
}
