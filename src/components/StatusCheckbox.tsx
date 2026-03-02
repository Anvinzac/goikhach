import { useState, useRef, useCallback } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

interface StatusCheckboxProps {
  status: 'waiting' | 'done' | 'cancelled' | 'not_found';
  onChange: (status: 'waiting' | 'done' | 'cancelled' | 'not_found') => void;
}

export function StatusCheckbox({ status, onChange }: StatusCheckboxProps) {
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = useRef<number>(0);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 400);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleQuickTap = useCallback(() => {
    if (showMenu) return;
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    lastTapTime.current = now;

    if (timeSinceLastTap < 300) {
      // Double tap → cancelled
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onChange('cancelled');
      return;
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    // If already done/cancelled/not_found, toggle back to waiting
    if (status !== 'waiting') {
      onChange('waiting' as any);
      return;
    }
    onChange('done');
  }, [onChange, showMenu]);

  const statusConfig = {
    waiting: { icon: null, bg: 'border-2 border-muted-foreground/30', text: '' },
    done: { icon: <Check className="w-5 h-5" />, bg: 'bg-available text-available-foreground', text: '' },
    cancelled: { icon: <X className="w-5 h-5" />, bg: 'bg-occupied text-occupied-foreground', text: '' },
    not_found: { icon: <HelpCircle className="w-5 h-5" />, bg: 'bg-muted text-muted-foreground', text: '' },
  };

  const current = statusConfig[status];

  return (
    <div className="relative">
      <button
        onClick={handleQuickTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 touch-target ${current.bg}`}
      >
        {current.icon}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 flex gap-1 bg-card border-2 border-border rounded-xl shadow-xl p-1.5">
            <button
              onClick={() => { onChange('cancelled'); setShowMenu(false); }}
              className="w-11 h-11 rounded-full bg-occupied text-occupied-foreground flex items-center justify-center active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => { onChange('not_found'); setShowMenu(false); }}
              className="w-11 h-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center active:scale-90"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
