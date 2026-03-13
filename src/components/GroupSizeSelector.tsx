import { useState, useRef } from 'react';

interface GroupSizeSelectorProps {
  currentSize: number | null;
  previousSize: number | null;
  onSelect: (size: number | null, prevSize: number | null) => void;
  compact?: boolean;
  dedicated?: boolean;
  onToggleDedicated?: () => void;
}

export function GroupSizeSelector({ currentSize, previousSize, onSelect, compact, dedicated, onToggleDedicated }: GroupSizeSelectorProps) {
  const [showLargeMenu, setShowLargeMenu] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const lastTapRef = useRef<{ time: number; size: number }>({ time: 0, size: 0 });

  const handleSelect = (size: number) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
    if (currentSize === size) {
      onSelect(null as unknown as number, currentSize);
    } else {
      onSelect(size, currentSize);
    }
    setShowLargeMenu(false);
  };

  const handleTap = (size: number) => {
    const now = Date.now();
    const last = lastTapRef.current;

    // Double-tap detection for sizes 1 and 2
    if ((size === 1 || size === 2) && last.size === size && now - last.time < 350) {
      // Double tap detected
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      // If size is already selected, just toggle dedicated
      if (currentSize === size) {
        onToggleDedicated?.();
      } else {
        // Select the size first, then toggle dedicated
        onSelect(size, currentSize);
        setTimeout(() => onToggleDedicated?.(), 50);
      }
      lastTapRef.current = { time: 0, size: 0 };
      return;
    }

    lastTapRef.current = { time: now, size };

    // Delay single tap to wait for potential double tap
    if (size === 1 || size === 2) {
      setTimeout(() => {
        if (lastTapRef.current.time === now) {
          handleSelect(size);
        }
      }, 350);
    } else {
      handleSelect(size);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-bold text-lg">
        {currentSize ? (
          <span className="text-queue relative">
            {currentSize}
            {dedicated && (currentSize === 1 || currentSize === 2) && (
              <sup className="text-[9px] font-black text-sharing absolute -top-1 -right-2.5">đ</sup>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">–</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-1">
      {[1, 2, 3, 4].map(n => {
        const isSelected = currentSize === n;
        const isFilled = currentSize !== null && n < currentSize;
        const showDedicated = dedicated && isSelected && (n === 1 || n === 2);
        return (
          <button
            key={n}
            onClick={() => handleTap(n)}
            className={`w-8 h-8 rounded-lg border-2 font-semibold transition-all active:scale-90 relative
              ${isSelected
                ? showDedicated
                  ? 'border-sharing text-sharing-foreground shadow-md text-lg'
                  : 'bg-queue border-queue text-queue-foreground shadow-md text-lg'
                : isFilled
                  ? 'bg-queue/10 border-queue/15'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            style={showDedicated ? {
              background: 'linear-gradient(135deg, hsl(var(--sharing)), hsl(var(--sharing-end)))',
            } : undefined}
          >
            <span className="flex items-center justify-center">
              {isSelected ? (
                <>
                  {n}
                  {showDedicated && (
                    <sup className="text-[8px] font-black absolute -top-0.5 -right-0.5 text-white">đ</sup>
                  )}
                </>
              ) : previousSize === n ? (
                <span className="line-through text-muted-foreground opacity-60 text-xs">{n}</span>
              ) : ''}
            </span>
          </button>
        );
      })}

      {/* 5+ button */}
      <button
        onClick={() => setShowLargeMenu(!showLargeMenu)}
        className={`w-8 h-8 rounded-lg border-2 font-semibold text-base transition-all active:scale-90
          ${currentSize && currentSize >= 5
            ? 'bg-queue border-queue text-queue-foreground shadow-md'
            : currentSize && currentSize > 4
              ? 'bg-queue/20 border-queue/30 text-queue/70'
              : 'border-border bg-card hover:border-primary/30'
          }`}
      >
        {currentSize && currentSize >= 5 ? currentSize : <span className="text-muted-foreground/40">5<span className="text-[10px]">+</span></span>}
      </button>

      {showLargeMenu && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-card border-2 border-border rounded-xl shadow-xl p-2 flex flex-col gap-1 min-w-[52px]">
          {[5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              onClick={() => handleSelect(n)}
              className={`w-full h-10 rounded-lg font-bold text-lg transition-all active:scale-95
                ${currentSize === n ? 'bg-queue text-queue-foreground' : 'hover:bg-muted'}`}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            placeholder="##"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && customInput) {
                handleSelect(parseInt(customInput));
                setCustomInput('');
              }
            }}
            className="w-full h-10 rounded-lg border border-border text-center font-bold text-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
}
