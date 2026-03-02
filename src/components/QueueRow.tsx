import { QueueOrder } from '@/hooks/useQueueOrders';
import { GroupSizeSelector } from './GroupSizeSelector';
import { StatusCheckbox } from './StatusCheckbox';
import { NotesTags } from './NotesTags';

interface QueueRowProps {
  order: QueueOrder;
  onUpdate: (id: string, updates: Partial<QueueOrder>) => void;
  compact?: boolean;
}

export function QueueRow({ order, onUpdate, compact }: QueueRowProps) {
  const statusBg = {
    waiting: 'bg-card',
    done: 'bg-available/5 border-available/20',
    cancelled: 'bg-occupied/5 border-occupied/20',
    not_found: 'bg-muted/50 border-muted-foreground/10',
  }[order.status];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-1.5 py-0.5 ${statusBg} transition-all relative h-full`}>
        {/* Order number */}
        <span className="text-xl text-queue flex-shrink-0 w-7 text-center">
          {order.order_number}
        </span>

        {/* Group size */}
        <GroupSizeSelector
          currentSize={order.group_size}
          previousSize={order.previous_group_size}
          onSelect={(size, prev) => onUpdate(order.id, { group_size: size, previous_group_size: prev })}
          compact
        />

        {/* Status */}
        <StatusCheckbox
          status={order.status}
          onChange={status => onUpdate(order.id, { status })}
        />

        {/* Notes badge */}
        {(order.notes.length > 0 || order.custom_note) && (
          <div className="absolute -top-1 -right-1">
            <NotesTags notes={order.notes} customNote={order.custom_note} onUpdate={() => {}} compact />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 px-1 py-0 ${statusBg} transition-all overflow-visible h-full`}>
      {/* Order number */}
      <span className="text-xl text-queue flex-shrink-0 w-7 text-center">
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
        <StatusCheckbox
          status={order.status}
          onChange={status => onUpdate(order.id, { status })}
        />
      </div>

      {/* Notes */}
      <div className="flex-1 min-w-0 relative">
        <NotesTags
          notes={order.notes}
          customNote={order.custom_note}
          onUpdate={(notes, customNote) => onUpdate(order.id, { notes, custom_note: customNote })}
        />
      </div>
    </div>
  );
}
