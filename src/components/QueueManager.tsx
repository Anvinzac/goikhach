import { useState, useRef } from 'react';
import { useQueueOrders } from '@/hooks/useQueueOrders';
import { QueueRow } from './QueueRow';
import { LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';

interface QueueManagerProps {
  sessionId: string;
}

export function QueueManager({ sessionId }: QueueManagerProps) {
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSwipe('right')}
            disabled={currentPage === 0}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted disabled:opacity-30 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-black text-lg tabular-nums">
            {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, orders.length)}
          </span>
          <button
            onClick={() => handleSwipe('left')}
            disabled={currentPage === totalPages - 1}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted disabled:opacity-30 active:scale-90 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex bg-muted rounded-xl p-1">
          <button
            onClick={() => { setViewMode('full'); setCurrentPage(0); }}
            className={`p-2 rounded-lg transition-all ${viewMode === 'full' ? 'bg-card shadow-sm' : ''}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setViewMode('compact'); setCurrentPage(0); }}
            className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-card shadow-sm' : ''}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
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
          <div className="flex flex-col gap-2">
            {pageOrders.map(order => (
              <QueueRow key={order.id} order={order} onUpdate={updateOrder} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {pageOrders.map(order => (
              <QueueRow key={order.id} order={order} onUpdate={updateOrder} compact />
            ))}
          </div>
        )}
      </div>

      {/* Page dots */}
      <div className="flex justify-center gap-1.5 py-2 border-t border-border">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentPage ? 'bg-queue w-6' : 'bg-muted-foreground/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
