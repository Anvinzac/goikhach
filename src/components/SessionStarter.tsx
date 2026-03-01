import { UtensilsCrossed, Moon } from 'lucide-react';

interface SessionStarterProps {
  onStart: (type: 'lunch' | 'dinner') => void;
  loading: boolean;
}

export function SessionStarter({ onStart, loading }: SessionStarterProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-3xl font-black text-center">Start New Session</h1>
      <p className="text-muted-foreground text-center font-medium">Choose the meal service to begin</p>

      <div className="flex gap-4">
        <button
          onClick={() => onStart('lunch')}
          disabled={loading}
          className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-sharing text-sharing-foreground font-bold text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <UtensilsCrossed className="w-10 h-10" />
          Lunch
        </button>
        <button
          onClick={() => onStart('dinner')}
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
