import { useState } from 'react';
import { QueueOrder } from '@/hooks/useQueueOrders';
import { GroupSizeSelector } from './GroupSizeSelector';
import { StatusCheckbox } from './StatusCheckbox';
import { NotesTags } from './NotesTags';
import { QRCodePopup } from './QRCodePopup';
import { Globe, ArrowDown, ArrowUp, Clock, Split, MessageSquare } from 'lucide-react';

function getWaitMinutes(startTime: string, endTime?: string): number {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  return Math.floor((end - start) / 60000);
}

function formatWaitTime(minutes: number): string {
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

function waitTimeColor(minutes: number): string {
  if (minutes < 10) return 'text-available';
  if (minutes <= 20) return 'text-sharing';
  return 'text-occupied';
}

const TAG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  foreigners: Globe,
  prefer_downstairs: ArrowDown,
  prefer_upstairs: ArrowUp,
  will_return: Clock,
  separately: Split,
};

const DISABLED_NUMBERS = [13];

interface QueueRowProps {
  order: QueueOrder;
  sessionId: string;
  onUpdate: (id: string, updates: Partial<QueueOrder>) => void;
  compact?: boolean;
  isNearBottom?: boolean;
  isRightColumn?: boolean;
  qrEnabled?: boolean;
  showWaitTime?: boolean;
}

export function QueueRow({ order, sessionId, onUpdate, compact, isNearBottom, isRightColumn, qrEnabled = true, showWaitTime = false }: QueueRowProps) {
  const shouldShowTime = showWaitTime || order.status === 'done';
  const waitMinutes = order.group_size ? getWaitMinutes(order.created_at, order.status === 'done' ? order.updated_at : undefined) : 0;
  const waitTimeText = order.group_size ? formatWaitTime(waitMinutes) : '';
  const waitColor = waitTimeColor(waitMinutes);
  const isDisabled = DISABLED_NUMBERS.includes(order.order_number);
  const [showPopup, setShowPopup] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleGroupSizeSelect = (size: number | null, prev: number | null) => {
    onUpdate(order.id, { group_size: size, previous_group_size: prev });
    // Show QR popup when a group size is selected (not cleared) and QR is enabled
    if (size !== null && qrEnabled) {
      setShowQR(true);
    }
  };

  const statusBg = {
    waiting: '',
    done: 'bg-available/5 border-available/20',
    cancelled: 'bg-occupied/5 border-occupied/20',
    not_found: 'bg-muted/50 border-muted-foreground/10',
  }[order.status];

  if (isDisabled) {
    return (
      <div className="flex items-center gap-1 px-1 py-0 bg-muted/30 transition-all relative h-full opacity-30 pointer-events-none">
        <span className="text-xl text-muted-foreground flex-shrink-0 w-7 text-center line-through">{order.order_number}</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1 px-1 py-0 ${statusBg} transition-all relative h-full cursor-pointer`}
        onClick={() => setShowPopup(true)}
      >
      {/* Order number - tap for not_found */}
      <span
        className="text-xl text-queue flex-shrink-0 w-7 text-center active:scale-90 transition-transform"
        onClick={(e) => { e.stopPropagation(); onUpdate(order.id, { status: 'not_found' }); }}
      >
        {order.order_number}
      </span>

        {/* Group size */}
        <GroupSizeSelector
          currentSize={order.group_size}
          previousSize={order.previous_group_size}
          onSelect={(size, prev) => { onUpdate(order.id, { group_size: size, previous_group_size: prev }); }}
          compact
        />

        {/* Status */}
        {order.group_size ? (
          <StatusCheckbox
            status={order.status}
            onChange={status => onUpdate(order.id, { status })}
          />
        ) : <div className="w-11 h-11" />}

        {/* Inline note icons or wait time */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {shouldShowTime && waitTimeText ? (
            <span className={`text-[11px] font-bold tabular-nums ${order.status === 'done' ? 'text-available' : 'text-muted-foreground'}`}>
              {waitTimeText}
            </span>
          ) : (
            <>
              {order.notes.map(n => {
                const Icon = TAG_ICONS[n];
                return Icon ? <Icon key={n} className="w-3 h-3 text-queue" /> : null;
              })}
              {order.custom_note && (
                <MessageSquare className="w-3 h-3 text-sharing" />
              )}
            </>
          )}
        </div>

        {/* Popup */}
        {showPopup && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} />
            <div className={`absolute z-50 bg-card border-2 border-border rounded-xl shadow-xl p-2 min-w-[220px] ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} ${isRightColumn ? 'right-0' : 'left-0'}`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-lg font-bold text-queue">{order.order_number}</span>
                <GroupSizeSelector
                  currentSize={order.group_size}
                  previousSize={order.previous_group_size}
                  onSelect={handleGroupSizeSelect}
                />
                {order.group_size ? (
                  <StatusCheckbox
                    status={order.status}
                    onChange={status => onUpdate(order.id, { status })}
                  />
                ) : <div className="w-11 h-11" />}
              </div>
              {order.group_size ? (
                <NotesTags
                  notes={order.notes}
                  customNote={order.custom_note}
                  onUpdate={(notes, customNote) => onUpdate(order.id, { notes, custom_note: customNote })}
                />
              ) : null}
            </div>
          </>
        )}

        {/* QR Code Popup */}
        {showQR && order.group_size && (
          <QRCodePopup
            orderId={order.id}
            sessionId={sessionId}
            orderNumber={order.order_number}
            groupSize={order.group_size}
            onClose={() => setShowQR(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 px-1 py-0 ${statusBg} transition-all overflow-visible h-full`}>
      {/* Order number - tap for not_found */}
      <span
        className="text-xl text-queue flex-shrink-0 w-7 text-center active:scale-90 transition-transform cursor-pointer"
        onClick={() => onUpdate(order.id, { status: 'not_found' })}
      >
        {order.order_number}
      </span>

      {/* Group size */}
      <div className="flex-shrink-0">
        <GroupSizeSelector
          currentSize={order.group_size}
          previousSize={order.previous_group_size}
          onSelect={handleGroupSizeSelect}
        />
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        {order.group_size ? (
          <StatusCheckbox
            status={order.status}
            onChange={status => onUpdate(order.id, { status })}
          />
        ) : <div className="w-11 h-11" />}
      </div>

      {/* Notes or wait time */}
      {order.group_size ? (
        shouldShowTime ? (
          <div className="flex-1 min-w-0 flex items-center justify-end pr-1">
            <span className={`text-sm font-bold tabular-nums ${order.status === 'done' ? 'text-available' : 'text-muted-foreground'}`}>
              {waitTimeText}
            </span>
          </div>
        ) : (
          <div className="flex-1 min-w-0 relative">
            <NotesTags
              notes={order.notes}
              customNote={order.custom_note}
              onUpdate={(notes, customNote) => onUpdate(order.id, { notes, custom_note: customNote })}
              dropUp={isNearBottom}
            />
          </div>
        )
      ) : <div className="flex-1" />}

      {/* QR Code Popup */}
      {showQR && order.group_size && (
        <QRCodePopup
          orderId={order.id}
          sessionId={sessionId}
          orderNumber={order.order_number}
          groupSize={order.group_size}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
