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

const TAG_LABELS: Record<string, string> = {
  foreigners: 'Khách NN',
  prefer_downstairs: 'Tầng dưới',
  prefer_upstairs: 'Tầng trên',
  will_return: 'Quay lại',
  separately: 'Tách bàn',
  dedicated: 'Bàn riêng',
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
  const registrationTime = order.registered_at ?? order.updated_at;
  const waitMinutes = order.group_size ? getWaitMinutes(registrationTime, order.status === 'done' ? order.reached_table_at ?? undefined : undefined) : 0;
  const waitTimeText = order.group_size ? formatWaitTime(waitMinutes) : '';
  const waitColor = waitTimeColor(waitMinutes);
  const isDisabled = DISABLED_NUMBERS.includes(order.order_number);
  const [showPopup, setShowPopup] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const isDedicated = order.notes.includes('dedicated');
  const isCircled = order.notes.includes('circled') && order.status === 'waiting';
  const visibleNotes = order.notes.filter(note => note !== 'circled');
  const hiddenNotes = order.notes.filter(note => note === 'circled');

  const toggleDedicated = () => {
    const newNotes = isDedicated
      ? order.notes.filter(n => n !== 'dedicated')
      : [...order.notes, 'dedicated'];
    onUpdate(order.id, { notes: newNotes });
  };

  const toggleCircled = () => {
    const newNotes = order.notes.includes('circled')
      ? order.notes.filter(n => n !== 'circled')
      : [...order.notes, 'circled'];
    onUpdate(order.id, { notes: newNotes });
  };

  const handleGroupSizeSelect = (size: number | null, prev: number | null) => {
    onUpdate(order.id, { group_size: size, previous_group_size: prev });
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
        className={`flex items-center gap-1 px-1 py-px ${statusBg} transition-all relative h-full min-h-0 cursor-pointer`}
        onClick={() => setShowPopup(true)}
      >
      {/* Order number - tap to toggle dashed circle */}
      <span
        className={`text-xl text-queue flex-shrink-0 w-7 text-center active:scale-90 transition-all ${
          isCircled ? 'border border-dashed border-muted-foreground rounded-full' : ''
        }`}
        onClick={(e) => { e.stopPropagation(); toggleCircled(); }}
      >
        {order.order_number}
      </span>

        {/* Group size */}
        <GroupSizeSelector
          currentSize={order.group_size}
          previousSize={order.previous_group_size}
          onSelect={(size, prev) => { onUpdate(order.id, { group_size: size, previous_group_size: prev }); }}
          compact
          dedicated={isDedicated}
          onToggleDedicated={toggleDedicated}
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
            <span className={`text-[11px] font-medium tabular-nums ${waitColor}`}>
              {waitTimeText}
            </span>
          ) : (
            <>
              {order.notes.map(n => {
                const label = TAG_LABELS[n];
                const Icon = TAG_ICONS[n];
                if (!label || n === 'circled') return null;
                return (
                  <span key={n} className="inline-flex items-center gap-1 rounded-md bg-queue/10 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-queue break-words">
                    {Icon ? <Icon className="w-2.5 h-2.5 flex-shrink-0" /> : null}
                    <span>{label}</span>
                  </span>
                );
              })}
              {order.custom_note ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-sharing/10 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-sharing break-words">
                  <MessageSquare className="w-2.5 h-2.5 flex-shrink-0" />
                  <span>{order.custom_note}</span>
                </span>
              ) : null}
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
                  dedicated={isDedicated}
                  onToggleDedicated={toggleDedicated}
                  preferDropUp={isNearBottom}
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
                  notes={visibleNotes}
                  customNote={order.custom_note}
                  onUpdate={(notes, customNote) => onUpdate(order.id, { notes: [...hiddenNotes, ...notes], custom_note: customNote })}
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
    <div className={`flex items-center gap-1 px-1 py-px ${statusBg} transition-all overflow-visible h-full min-h-0`}>
      {/* Order number - tap to toggle dashed circle */}
      <span
        className={`text-xl text-queue flex-shrink-0 w-7 text-center active:scale-90 transition-all cursor-pointer ${
          isCircled ? 'border border-dashed border-muted-foreground rounded-full' : ''
        }`}
        onClick={toggleCircled}
      >
        {order.order_number}
      </span>

      {/* Group size */}
      <div className="flex-shrink-0">
        <GroupSizeSelector
          currentSize={order.group_size}
          previousSize={order.previous_group_size}
          onSelect={handleGroupSizeSelect}
          dedicated={isDedicated}
          onToggleDedicated={toggleDedicated}
          preferDropUp={isNearBottom}
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
            <span className={`text-xs font-medium tabular-nums ${waitColor}`}>
              {waitTimeText}
            </span>
          </div>
        ) : (
          <div className="flex-1 min-w-0 relative">
            <NotesTags
              notes={visibleNotes}
              customNote={order.custom_note}
              onUpdate={(notes, customNote) => onUpdate(order.id, { notes: [...hiddenNotes, ...notes], custom_note: customNote })}
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
