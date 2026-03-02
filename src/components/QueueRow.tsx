import { useState } from 'react';
import { QueueOrder } from '@/hooks/useQueueOrders';
import { GroupSizeSelector } from './GroupSizeSelector';
import { StatusCheckbox } from './StatusCheckbox';
import { NotesTags } from './NotesTags';
import { Globe, ArrowDown, ArrowUp, Clock, Split, MessageSquare } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

const NOTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
  const [popoverOpen, setPopoverOpen] = useState(false);

  const statusBg = {
    waiting: 'bg-card',
    done: 'bg-available/5 border-available/20',
    cancelled: 'bg-occupied/5 border-occupied/20',
    not_found: 'bg-muted/50 border-muted-foreground/10',
  }[order.status];

  if (compact) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className={`w-full h-full flex flex-col items-center justify-center gap-0.5 px-1 py-0.5 ${statusBg} transition-all active:scale-95`}>
            {/* Order number */}
            <span className="text-lg font-semibold text-queue leading-none">
              {order.order_number}
            </span>
            {/* Note icons row */}
            {(order.notes.length > 0 || order.custom_note) && (
              <div className="flex items-center gap-0.5 flex-wrap justify-center">
                {order.notes.map(n => {
                  const Icon = NOTE_ICONS[n];
                  if (!Icon) return null;
                  return <Icon key={n} className="w-3 h-3 text-queue/70" />;
                })}
                {order.custom_note && (
                  <span className="text-[9px] leading-tight px-1 rounded bg-sharing/15 text-sharing truncate max-w-[50px]">
                    {order.custom_note}
                  </span>
                )}
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" side="top" align="center">
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-queue">#{order.order_number}</span>
              <StatusCheckbox
                status={order.status}
                onChange={status => onUpdate(order.id, { status })}
              />
            </div>
            {/* Group size */}
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Group size</span>
              <GroupSizeSelector
                currentSize={order.group_size}
                previousSize={order.previous_group_size}
                onSelect={(size, prev) => onUpdate(order.id, { group_size: size, previous_group_size: prev })}
              />
            </div>
            {/* Notes */}
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Notes</span>
              <NotesTags
                notes={order.notes}
                customNote={order.custom_note}
                onUpdate={(notes, customNote) => onUpdate(order.id, { notes, custom_note: customNote })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
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
