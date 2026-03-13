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

    // Double-tap: only for 1 & 2, and only when already selected
    if ((size === 1 || size === 2) && currentSize === size && last.size === size && now - last.time < 400) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onToggleDedicated?.();
      lastTapRef.current = { time: 0, size: 0 };
      return;
    }

    lastTapRef.current = { time: now, size };
    handleSelect(size);
  };

  const showDedicatedBadge = dedicated && (currentSize === 1 || currentSize === 2);

  if (compact) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-bold text-lg flex-shrink-0">
        {currentSize ? (
          <span className="text-queue flex items-baseline justify-center">
            {currentSize}
            {showDedicatedBadge && (
              <span className="text-[11px] font-normal text-sharing ml-px" style={{ verticalAlign: 'sub' }}>đ</span>
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
        const isDedicated = dedicated && isSelected && (n === 1 || n === 2);
        return (
          <button
            key={n}
            onClick={() => handleTap(n)}
            className={`w-8 h-8 rounded-lg border-2 font-semibold transition-all active:scale-90 overflow-visible
              ${isSelected
                ? isDedicated
                  ? 'border-sharing text-white shadow-md text-lg'
                  : 'bg-queue border-queue text-queue-foreground shadow-md text-lg'
                : isFilled
                  ? 'bg-queue/10 border-queue/15'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            style={isDedicated ? {
              background: 'linear-gradient(135deg, hsl(var(--sharing)), hsl(var(--sharing-end)))',
            } : undefined}
          >
            {isSelected ? (
              <span className="flex items-baseline justify-center">
                {n}
                {isDedicated && (
                  <span className="text-[10px] font-normal ml-px" style={{ verticalAlign: 'sub' }}>đ</span>
                )}
              </span>
            ) : previousSize === n ? (
              <span className="line-through text-muted-foreground opacity-60 text-xs">{n}</span>
            ) : ''}
          </button>
        );
      })}

      {/* 5+ button */}
      <button
        onClick={() => setShowLargeMenu(!showLargeMenu)}
        className={`w-7 h-7 rounded-md border-2 font-semibold text-sm transition-all active:scale-90 flex-shrink-0
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
