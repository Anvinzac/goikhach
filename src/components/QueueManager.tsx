import { useState, useRef } from 'react';
import { QueueOrder } from '@/hooks/useQueueOrders';
import { QueueRow } from './QueueRow';
import { LayoutGrid, List, RotateCcw, QrCode, Timer } from 'lucide-react';

interface QueueManagerProps {
  sessionId: string;
  sessionType: string;
  onResetPressStart: () => void;
  onResetPressEnd: () => void;
  onRefresh: () => void;
  estimatedMinutes?: number;
  orders: QueueOrder[];
  updateOrder: (id: string, updates: Partial<QueueOrder>) => void;
  qrEnabled: boolean;
  onToggleQr: () => void;
}

export function QueueManager({ sessionId, sessionType, onResetPressStart, onResetPressEnd, onRefresh, estimatedMinutes = 0, orders, updateOrder, qrEnabled, onToggleQr }: QueueManagerProps) {
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [showWaitTime, setShowWaitTime] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLunchSession = (() => {
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    return (h > 10 || (h === 10 && m >= 30)) && h < 15;
  })();
  const sessionLabel = isLunchSession ? 'Ca trưa' : 'Ca tối';

  const pageSize = viewMode === 'full' ? 10 : 20;
  const totalPages = Math.ceil(orders.length / pageSize);
  const pageOrders = orders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const pageStates = Array.from({ length: totalPages }, (_, i) => {
    const start = i * pageSize;
    const end = Math.min((i + 1) * pageSize, orders.length);
    const hasAssignedNumbers = orders.slice(start, end).some(order => order.group_size !== null);

    return {
      index: i,
      isCurrent: i === currentPage,
      hasAssignedNumbers,
      isExpanded: i < 4 || hasAssignedNumbers,
    };
  });
  const expandedPageCount = pageStates.filter(page => page.isExpanded).length;
  const compactPageCount = pageStates.length - expandedPageCount;
  const paginationWidthPercent = totalPages > 0
    ? Math.min(85, Math.max(60, 60 + Math.max(0, expandedPageCount - 4) * 2.5))
    : 60;
  const compactDotWidth = 6;
  const paginationGap = 4;
  const expandedSlotWidth = expandedPageCount > 0
    ? `calc((100% - ${compactPageCount * compactDotWidth + Math.max(0, totalPages - 1) * paginationGap}px) / ${expandedPageCount})`
    : undefined;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (direction === 'left' && currentPage < totalPages - 1) {
      setSlideDir('left');
      setCurrentPage(p => p + 1);
      setTimeout(() => setSlideDir(null), 250);
    } else if (direction === 'right' && currentPage > 0) {
      setSlideDir('right');
      setCurrentPage(p => p - 1);
      setTimeout(() => setSlideDir(null), 250);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Merged header */}
      <div className="flex items-center justify-between px-1 h-8 bg-card border-b border-border flex-shrink-0">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-2 [font-family:'Be_Vietnam_Pro',sans-serif]">
          <span className="font-black text-sm text-queue">🍽</span>
          <span className="truncate font-bold text-sm leading-none">{sessionLabel}</span>
          {estimatedMinutes > 0 && (
            <span className="shrink-0 text-[11px] font-semibold text-muted-foreground tabular-nums leading-none">~{estimatedMinutes} phút</span>
          )}
          <button
            onClick={onToggleQr}
            className={`w-7 h-7 rounded flex items-center justify-center transition-all active:scale-90 ${
              qrEnabled ? 'bg-queue text-queue-foreground' : 'bg-muted text-muted-foreground opacity-40'
            }`}
            title={qrEnabled ? 'QR enabled' : 'QR disabled'}
          >
            <QrCode className="w-3.5 h-3.5" />
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
            onClick={() => setShowWaitTime(v => !v)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all active:scale-90 ${
              showWaitTime ? 'bg-queue text-queue-foreground' : 'bg-muted'
            }`}
            title={showWaitTime ? 'Hide wait times' : 'Show wait times'}
          >
            <Timer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRefresh}
            onMouseDown={onResetPressStart}
            onMouseUp={onResetPressEnd}
            onMouseLeave={onResetPressEnd}
            onTouchStart={onResetPressStart}
            onTouchEnd={onResetPressEnd}
            onTouchCancel={onResetPressEnd}
            className="w-8 h-8 rounded flex items-center justify-center bg-occupied/15 text-occupied active:bg-occupied active:text-occupied-foreground transition-all"
            title="Chạm để tải lại, giữ để reset"
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
        <div
          key={currentPage}
          className={`h-full ${
            slideDir === 'left' ? 'animate-slide-in-from-right' :
            slideDir === 'right' ? 'animate-slide-in-from-left' :
            ''
          }`}
        >
        {viewMode === 'full' ? (
          <div className="flex flex-col h-full" style={{ gap: '0', paddingTop: '0', paddingBottom: '0' }}>
            {pageOrders.map((order, i) => (
              <div key={order.id} className={`flex-1 min-h-0 ${i % 2 === 1 ? 'bg-muted/30' : ''}`} style={{ borderBottom: '1px solid', borderColor: i % 2 === 0 ? 'hsl(var(--border))' : 'hsl(var(--muted))', marginTop: '-1px' }}>
                <QueueRow order={order} sessionId={sessionId} onUpdate={updateOrder} isNearBottom={i >= pageOrders.length - 4} qrEnabled={qrEnabled} showWaitTime={showWaitTime} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-10 grid-flow-col auto-rows-fr h-full">
            {pageOrders.map((order, i) => {
              const rowIndex = i % 10;
              const isBottom = rowIndex >= 6;
              const isRightCol = i >= 10;
              return (
              <div key={order.id} className={`${i % 2 === 1 ? 'bg-muted/30' : ''}`} style={{ borderBottom: '1px solid', borderColor: i % 2 === 0 ? 'hsl(var(--border))' : 'hsl(var(--muted))' }}>
                <QueueRow order={order} sessionId={sessionId} onUpdate={updateOrder} compact isNearBottom={isBottom} isRightColumn={isRightCol} qrEnabled={qrEnabled} showWaitTime={showWaitTime} />
              </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Page dots - minimal */}
      {totalPages > 1 && (
        <div className="flex justify-center py-1 border-t border-border flex-shrink-0">
          <div
            className="flex min-w-0 items-center gap-1 px-2 transition-[width] duration-200 ease-out"
            style={{ width: `${paginationWidthPercent}%`, maxWidth: '85%' }}
          >
            {pageStates.map(({ index, isCurrent, hasAssignedNumbers, isExpanded }) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`group relative shrink-0 rounded-full transition-all duration-200 active:scale-95 ${isCurrent ? 'ring-2 ring-background ring-offset-1 ring-offset-queue/35' : ''}`}
                style={{
                  width: isExpanded ? expandedSlotWidth : `${compactDotWidth}px`,
                }}
                aria-label={`Go to page ${index + 1}`}
              >
                <span
                  className={`mx-auto block transition-all duration-200 ${
                    isExpanded
                      ? `h-2.5 w-full rounded-full ${hasAssignedNumbers ? 'bg-queue' : 'bg-muted-foreground/30'}`
                      : `h-1.5 w-1.5 rounded-full ${hasAssignedNumbers ? 'bg-queue' : 'bg-muted-foreground/20'}`
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
