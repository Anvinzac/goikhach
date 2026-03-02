import { useState } from 'react';
import { QueueOrder } from '@/hooks/useQueueOrders';
import { GroupSizeSelector } from './GroupSizeSelector';
import { StatusCheckbox } from './StatusCheckbox';
import { NotesTags } from './NotesTags';
import { Globe, ArrowDown, ArrowUp, Clock, Split, MessageSquare } from 'lucide-react';

const TAG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  foreigners: Globe,
  prefer_downstairs: ArrowDown,
  prefer_upstairs: ArrowUp,
  will_return: Clock,
  separately: Split,
};

interface QueueRowProps {
  order: QueueOrder;
  onUpdate: (id: string, updates: Partial<QueueOrder>) => void;
  compact?: boolean;
}

export function QueueRow({ order, onUpdate, compact }: QueueRowProps) {
  const [showPopup, setShowPopup] = useState(false);

  const statusBg = {
    waiting: 'bg-card',
    done: 'bg-available/5 border-available/20',
    cancelled: 'bg-occupied/5 border-occupied/20',
    not_found: 'bg-muted/50 border-muted-foreground/10',
  }[order.status];

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

        {/* Inline note icons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {order.notes.map(n => {
            const Icon = TAG_ICONS[n];
            return Icon ? <Icon key={n} className="w-3 h-3 text-queue" /> : null;
          })}
          {order.custom_note && (
            <MessageSquare className="w-3 h-3 text-sharing" />
          )}
        </div>

        {/* Popup */}
        {showPopup && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} />
            <div className="absolute left-0 top-full mt-1 z-50 bg-card border-2 border-border rounded-xl shadow-xl p-2 min-w-[220px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-lg font-bold text-queue">{order.order_number}</span>
                <GroupSizeSelector
                  currentSize={order.group_size}
                  previousSize={order.previous_group_size}
                  onSelect={(size, prev) => onUpdate(order.id, { group_size: size, previous_group_size: prev })}
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
          onSelect={(size, prev) => onUpdate(order.id, { group_size: size, previous_group_size: prev })}
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

      {/* Notes */}
      {order.group_size ? (
        <div className="flex-1 min-w-0 relative">
          <NotesTags
            notes={order.notes}
            customNote={order.custom_note}
            onUpdate={(notes, customNote) => onUpdate(order.id, { notes, custom_note: customNote })}
          />
        </div>
      ) : <div className="flex-1" />}
    </div>
  );
}
