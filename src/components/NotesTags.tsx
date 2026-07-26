import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Globe, ArrowDown, ArrowUp, Clock, Split, MessageSquare, ChevronDown, QrCode } from 'lucide-react';

const TAG_OPTIONS = [
  { value: 'foreigners', icon: Globe, label: 'Khách NN' },
  { value: 'prefer_downstairs', icon: ArrowDown, label: 'Tầng dưới' },
  { value: 'prefer_upstairs', icon: ArrowUp, label: 'Tầng trên' },
  { value: 'will_return', icon: Clock, label: 'Quay lại' },
  { value: 'separately', icon: Split, label: 'Bàn riêng' },
] as const;

interface NotesTagsProps {
  notes: string[];
  customNote: string | null;
  onUpdate: (notes: string[], customNote: string | null) => void;
  compact?: boolean;
  dropUp?: boolean;
  onShowQR?: () => void;
}

export function NotesTags({ notes, customNote, onUpdate, compact, dropUp, onShowQR }: NotesTagsProps) {
  const [open, setOpen] = useState(false);
  const [tempNote, setTempNote] = useState(customNote || '');
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasNotes = notes.length > 0 || !!customNote;

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const right = Math.max(6, window.innerWidth - rect.right);
      setMenuPosition(
        dropUp
          ? { bottom: Math.max(6, window.innerHeight - rect.top + 4), right }
          : { top: Math.max(6, rect.bottom + 4), right }
      );
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('orientationchange', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [dropUp, open]);

  const closeAndSave = () => {
    setOpen(false);
    onUpdate(notes, tempNote || null);
  };

  const toggleTag = (value: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    const newNotes = notes.includes(value)
      ? notes.filter(n => n !== value)
      : [...notes, value];
    onUpdate(newNotes, customNote);
  };

  if (compact) {
    return hasNotes ? (
      <div className="relative">
        <div className="w-5 h-5 rounded-full bg-sharing flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-sharing-foreground" />
        </div>
      </div>
    ) : null;
  }

  return (
    <div ref={containerRef} className="flex-1 min-w-0" {...(open ? { 'data-popup-open': '' } : {})}>
      {/* Tags display */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-wrap gap-1 items-center min-h-[32px] w-full rounded-lg px-1.5 py-1 bg-muted/50 hover:bg-muted transition-colors active:scale-[0.98] [font-family:'Be_Vietnam_Pro',sans-serif]"
      >
        {notes.map(n => {
          const tag = TAG_OPTIONS.find(t => t.value === n);
          if (!tag) return null;
          const Icon = tag.icon;
          return (
            <span key={n} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-queue/10 text-queue text-[11px] font-medium leading-tight">
              <Icon className="w-3 h-3" />
              <span>{tag.label}</span>
            </span>
          );
        })}
        {customNote && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sharing/10 text-sharing text-[11px] font-medium leading-tight max-w-full">
            <MessageSquare className="w-3 h-3 flex-shrink-0" />
            <span className="break-words text-left">{customNote}</span>
          </span>
        )}
        {!hasNotes && <ChevronDown className="w-4 h-4 text-muted-foreground mx-auto" />}
      </button>

      {/* Dropdown */}
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <button
            type="button"
            aria-label="Đóng"
            onClick={closeAndSave}
            className="fixed inset-0 z-[80] bg-transparent cursor-default"
          />
          <div
            className="fixed z-[90] bg-card border-2 border-border rounded-xl shadow-xl p-3 min-w-[200px]"
            style={menuPosition || { top: 6, right: 6 }}
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {TAG_OPTIONS.map(tag => {
                const Icon = tag.icon;
                const active = notes.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 [font-family:'Be_Vietnam_Pro',sans-serif]
                      ${active ? 'bg-queue text-queue-foreground shadow-md' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs leading-tight">{tag.label}</span>
                  </button>
                );
              })}
              {onShowQR && (
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(20);
                    setOpen(false);
                    onShowQR();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 bg-sharing text-sharing-foreground shadow-md [font-family:'Be_Vietnam_Pro',sans-serif]"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs leading-tight">QR</span>
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Custom note..."
              value={tempNote}
              onChange={e => setTempNote(e.target.value)}
              onBlur={() => onUpdate(notes, tempNote || null)}
              className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-primary [font-family:'Be_Vietnam_Pro',sans-serif]"
            />
          </div>
        </>
        , document.body
      )}
    </div>
  );
}
