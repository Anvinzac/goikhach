import { useState } from 'react';

interface GroupSizeSelectorProps {
  currentSize: number | null;
  previousSize: number | null;
  onSelect: (size: number, prevSize: number | null) => void;
  compact?: boolean;
}

export function GroupSizeSelector({ currentSize, previousSize, onSelect, compact }: GroupSizeSelectorProps) {
  const [showLargeMenu, setShowLargeMenu] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const handleSelect = (size: number) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
    onSelect(size, currentSize);
    setShowLargeMenu(false);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-bold text-lg">
        {currentSize ? (
          <span className="text-queue">{currentSize}</span>
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
        return (
          <button
            key={n}
            onClick={() => handleSelect(n)}
            className={`w-8 h-8 rounded-lg border-2 font-semibold transition-all active:scale-90
              ${isSelected
                ? 'bg-queue border-queue text-queue-foreground shadow-md text-lg'
                : isFilled
                  ? 'bg-queue/10 border-queue/15'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
          >
            {isSelected ? n : previousSize === n ? (
              <span className="line-through text-muted-foreground opacity-60 text-xs">{n}</span>
            ) : ''}
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
        {currentSize && currentSize >= 5 ? currentSize : '5+'}
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
