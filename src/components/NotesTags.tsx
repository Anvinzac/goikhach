import { useState } from 'react';
import { Globe, ArrowDown, ArrowUp, Clock, Split, MessageSquare, ChevronDown } from 'lucide-react';

const TAG_OPTIONS = [
  { value: 'foreigners', icon: Globe, label: 'F' },
  { value: 'prefer_downstairs', icon: ArrowDown, label: '↓' },
  { value: 'prefer_upstairs', icon: ArrowUp, label: '↑' },
  { value: 'will_return', icon: Clock, label: '⟳' },
  { value: 'separately', icon: Split, label: '⇋' },
] as const;

interface NotesTagsProps {
  notes: string[];
  customNote: string | null;
  onUpdate: (notes: string[], customNote: string | null) => void;
  compact?: boolean;
}

export function NotesTags({ notes, customNote, onUpdate, compact }: NotesTagsProps) {
  const [open, setOpen] = useState(false);
  const [tempNote, setTempNote] = useState(customNote || '');

  const hasNotes = notes.length > 0 || !!customNote;

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
    <div className="flex-1 min-w-0">
      {/* Tags display */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-wrap gap-1 items-center min-h-[32px] w-full rounded-lg px-1.5 py-0.5 bg-muted/50 hover:bg-muted transition-colors active:scale-[0.98]"
      >
        {notes.map(n => {
          const tag = TAG_OPTIONS.find(t => t.value === n);
          if (!tag) return null;
          const Icon = tag.icon;
          return (
            <span key={n} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-queue/10 text-queue text-xs font-semibold">
              <Icon className="w-3 h-3" />
            </span>
          );
        })}
        {customNote && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sharing/10 text-sharing text-xs font-semibold truncate max-w-[60px]">
            <MessageSquare className="w-3 h-3 flex-shrink-0" />
          </span>
        )}
        {!hasNotes && <ChevronDown className="w-4 h-4 text-muted-foreground mx-auto" />}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); onUpdate(notes, tempNote || null); }} />
          <div className="absolute right-0 mt-1 z-50 bg-card border-2 border-border rounded-xl shadow-xl p-3 min-w-[200px]">
            <div className="flex flex-wrap gap-2 mb-3">
              {TAG_OPTIONS.map(tag => {
                const Icon = tag.icon;
                const active = notes.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95
                      ${active ? 'bg-queue text-queue-foreground shadow-md' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{tag.value.replace(/_/g, ' ')}</span>
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Custom note..."
              value={tempNote}
              onChange={e => setTempNote(e.target.value)}
              onBlur={() => onUpdate(notes, tempNote || null)}
              className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </>
      )}
    </div>
  );
}
