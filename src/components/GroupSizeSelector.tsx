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
    <div className="relative flex items-center h-[80%]">
      {[1, 2, 3, 4].map(n => (
        <button
          key={n}
          onClick={() => handleSelect(n)}
          className={`h-full aspect-square flex items-center justify-center font-bold text-base transition-all active:scale-90
            ${currentSize === n
              ? 'text-queue-foreground bg-queue rounded-md'
              : previousSize === n
                ? 'text-muted-foreground/40 line-through'
                : 'text-muted-foreground/60'
            }`}
        >
          {n}
        </button>
      ))}

      {/* 5+ button */}
      <button
        onClick={() => setShowLargeMenu(!showLargeMenu)}
        className={`h-full aspect-square flex items-center justify-center font-bold text-xs transition-all active:scale-90
          ${currentSize && currentSize >= 5
            ? 'text-queue-foreground bg-queue rounded-md'
            : 'text-muted-foreground/60'
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
