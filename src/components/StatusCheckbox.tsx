import { useState, useRef, useCallback } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

interface StatusCheckboxProps {
  status: 'waiting' | 'done' | 'cancelled' | 'not_found';
  onChange: (status: 'waiting' | 'done' | 'cancelled' | 'not_found') => void;
}

export function StatusCheckbox({ status, onChange }: StatusCheckboxProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = useRef<number>(0);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onChange('not_found');
    }, 400);
  }, [onChange]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleQuickTap = useCallback(() => {
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
    // If not waiting, toggle back to waiting; otherwise mark done
    if (status !== 'waiting') {
      onChange('waiting');
      return;
    }
    onChange('done');
  }, [onChange, status]);

  const statusConfig = {
    waiting: { icon: null, bg: 'border-2 border-muted-foreground/30', text: '' },
    done: { icon: <Check className="w-5 h-5" />, bg: 'bg-done text-done-foreground', text: '' },
    cancelled: { icon: <X className="w-5 h-5" />, bg: 'bg-occupied text-occupied-foreground', text: '' },
    not_found: { icon: <HelpCircle className="w-5 h-5 text-orange-500" />, bg: 'bg-notfound', text: '' },
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
    </div>
  );
}

