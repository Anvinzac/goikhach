import { useState, useRef } from 'react';
import { useQueueOrders } from '@/hooks/useQueueOrders';
import { QueueRow } from './QueueRow';
import { LayoutGrid, List, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface QueueManagerProps {
  sessionId: string;
  sessionType: string;
  onReset: () => void;
}

export function QueueManager({ sessionId, sessionType, onReset }: QueueManagerProps) {
  const { orders, updateOrder } = useQueueOrders(sessionId);
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pageSize = viewMode === 'full' ? 10 : 20;
  const totalPages = Math.ceil(orders.length / pageSize);
  const pageOrders = orders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (direction === 'left' && currentPage < totalPages - 1) {
      setCurrentPage(p => p + 1);
    } else if (direction === 'right' && currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Merged header */}
      <div className="flex items-center justify-between px-1 h-8 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="font-black text-sm text-queue">🍽</span>
          <span className="font-bold text-xs capitalize">{sessionType}</span>
          <button
            onClick={() => handleSwipe('right')}
            disabled={currentPage === 0}
            className="w-8 h-8 rounded flex items-center justify-center bg-muted disabled:opacity-30 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-black text-xs tabular-nums">
            {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, orders.length)}
          </span>
          <button
            onClick={() => handleSwipe('left')}
            disabled={currentPage === totalPages - 1}
            className="w-8 h-8 rounded flex items-center justify-center bg-muted disabled:opacity-30 active:scale-90 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <div className="flex bg-muted rounded p-0.5 gap-0.5">
            <button
              onClick={() => { setViewMode('full'); setCurrentPage(0); }}
              className={`px-2 py-1 rounded transition-all ${viewMode === 'full' ? 'bg-card shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setViewMode('compact'); setCurrentPage(0); }}
              className={`px-2 py-1 rounded transition-all ${viewMode === 'compact' ? 'bg-card shadow-sm' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onMouseDown={onReset}
            onTouchStart={onReset}
            className="w-8 h-8 rounded flex items-center justify-center bg-muted active:bg-occupied active:text-occupied-foreground transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Queue list - no padding, fill height */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden px-0.5"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          scrollRef.current?.setAttribute('data-start-x', String(touch.clientX));
        }}
        onTouchEnd={(e) => {
          const startX = Number(scrollRef.current?.getAttribute('data-start-x') || 0);
          const endX = e.changedTouches[0].clientX;
          const diff = startX - endX;
          if (Math.abs(diff) > 80) {
            handleSwipe(diff > 0 ? 'left' : 'right');
          }
        }}
      >
        {viewMode === 'full' ? (
          <div className="flex flex-col h-full">
            {pageOrders.map((order, i) => (
              <div key={order.id} className="flex-1 min-h-0" style={{ borderBottom: '1px solid', borderColor: i % 2 === 0 ? 'hsl(var(--border))' : 'hsl(var(--muted))' }}>
                <QueueRow order={order} onUpdate={updateOrder} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-10 grid-flow-col auto-rows-fr h-full">
            {pageOrders.map((order, i) => (
              <div key={order.id} style={{ borderBottom: '1px solid', borderColor: i % 2 === 0 ? 'hsl(var(--border))' : 'hsl(var(--muted))' }}>
                <QueueRow order={order} onUpdate={updateOrder} compact />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Page dots - minimal */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 py-0.5 border-t border-border flex-shrink-0">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-queue w-5' : 'bg-muted-foreground/20'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
