import { useState, useMemo, useEffect, useRef } from 'react';
import { useFloorPlan, RestaurantTable, Chair } from '@/hooks/useFloorPlan';
import { useQueueOrders, QueueOrder } from '@/hooks/useQueueOrders';
import { Timer, Plus, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FloorPlanViewProps {
  sessionId: string;
  floor: 'ground' | 'first';
}

function ChairIcon({ chair, onToggle }: { chair: Chair; onToggle: (id: string, occupied: boolean) => void }) {
  return (
    <button
      onClick={() => onToggle(chair.id, !chair.is_occupied)}
      className={`w-8 h-5 rounded-md transition-all active:scale-90 shadow-sm
        ${chair.is_occupied ? 'bg-occupied' : 'bg-available'}`}
    />
  );
}

function TableUnit({
  table,
  tableChairs,
  showTime,
  onChairToggle,
  onTableTap,
  onExpand,
  isHighlighted,
}: {
  table: RestaurantTable;
  tableChairs: Chair[];
  showTime: boolean;
  onChairToggle: (id: string, occupied: boolean) => void;
  onTableTap: (table: RestaurantTable) => void;
  onExpand: (tableId: string, newSize: number) => void;
  isHighlighted?: boolean;
}) {
  const isBig = table.table_type === 'big';
  const topChairs = tableChairs.filter((_, i) => i < (isBig ? 2 : 1));
  const bottomChairs = tableChairs.filter((_, i) => i >= (isBig ? 2 : 1));

  const tableBg = {
    available: 'bg-available/20 border-available',
    occupied: 'bg-occupied/20 border-occupied',
    sharing: 'bg-sharing/20 border-sharing',
  }[table.status];

  const currentChairCount = tableChairs.length;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Top chairs */}
      <div className="flex gap-1 justify-center">
        {topChairs.map(c => (
          <ChairIcon key={c.id} chair={c} onToggle={onChairToggle} />
        ))}
      </div>

      {/* Table */}
      <button
        onClick={() => onTableTap(table)}
        className={`${isBig ? 'w-20 h-12' : 'w-14 h-10'} rounded-xl border-2 ${tableBg} flex items-center justify-center transition-all active:scale-95 relative ${isHighlighted ? 'animate-pulse-available ring-2 ring-available' : ''}`}
      >
        {showTime && table.occupied_at && (
          <span className="text-[10px] font-bold text-foreground">
            {formatDistanceToNow(new Date(table.occupied_at), { addSuffix: false })}
          </span>
        )}
        {table.is_expandable && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            {currentChairCount < 6 && (
              <button
                onClick={(e) => { e.stopPropagation(); onExpand(table.id, currentChairCount + 1); }}
                className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            {currentChairCount > 4 && (
              <button
                onClick={(e) => { e.stopPropagation(); onExpand(table.id, currentChairCount - 1); }}
                className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </button>

      {/* Bottom chairs */}
      <div className="flex gap-1 justify-center">
        {bottomChairs.map(c => (
          <ChairIcon key={c.id} chair={c} onToggle={onChairToggle} />
        ))}
      </div>
    </div>
  );
}

export function FloorPlanView({ sessionId, floor }: FloorPlanViewProps) {
  const { tables, chairs, toggleChair, updateTableStatus, setTableMappedOrder, expandTable } = useFloorPlan(sessionId, floor);
  const { orders } = useQueueOrders(sessionId);
  const [showTime, setShowTime] = useState(false);
  const [actionSheet, setActionSheet] = useState<{ table: RestaurantTable } | null>(null);
  const [highlightedTables, setHighlightedTables] = useState<Set<string>>(new Set());
  const prevStatuses = useRef<Record<string, string>>({});

  // Track table status changes and highlight newly available ones
  useEffect(() => {
    const prev = prevStatuses.current;
    const newHighlights = new Set(highlightedTables);
    tables.forEach(t => {
      if (prev[t.id] && prev[t.id] !== 'available' && t.status === 'available') {
        newHighlights.add(t.id);
        setTimeout(() => {
          setHighlightedTables(s => { const n = new Set(s); n.delete(t.id); return n; });
        }, 15000);
      }
      prev[t.id] = t.status;
    });
    if (newHighlights.size !== highlightedTables.size) {
      setHighlightedTables(newHighlights);
    }
  }, [tables]);

  const recentDone = useMemo(() =>
    orders.filter(o => o.status === 'done').slice(-10),
    [orders]
  );

  const columns = useMemo(() => {
    const cols: Record<number, RestaurantTable[]> = {};
    tables.forEach(t => {
      if (!cols[t.column_position]) cols[t.column_position] = [];
      cols[t.column_position].push(t);
    });
    return Object.entries(cols).sort(([a], [b]) => Number(a) - Number(b));
  }, [tables]);

  const handleChairToggle = async (chairId: string, occupied: boolean) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    await toggleChair(chairId, occupied);
    // Update parent table status with fresh DB data
    const chair = chairs.find(c => c.id === chairId);
    if (chair) {
      await updateTableStatus(chair.table_id);
    }
  };

  const handleTableTap = (table: RestaurantTable) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
    if (recentDone.length > 0) {
      setActionSheet({ table });
    }
  };

  const handleAssignOrder = async (table: RestaurantTable, order: QueueOrder) => {
    await setTableMappedOrder(table.id, order.id);
    // Mark all chairs as occupied
    const tableChairs = chairs.filter(c => c.table_id === table.id);
    for (const chair of tableChairs) {
      await toggleChair(chair.id, true, order.id);
    }
    await updateTableStatus(table.id);
    setActionSheet(null);
  };

  // columnLabels removed - no longer needed

  return (
    <div className="flex flex-col h-full">
      {/* Header with embedded legend */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">{floor === 'ground' ? 'Ground' : '1st Floor'}</h2>
          <div className="flex gap-2 text-[10px] font-semibold">
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-available" />Avail</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-occupied" />Occ</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-sharing" />Share</span>
          </div>
        </div>
        <button
          onClick={() => setShowTime(!showTime)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90
            ${showTime ? 'bg-queue text-queue-foreground' : 'bg-muted'}`}
        >
          <Timer className="w-4 h-4" />
        </button>
      </div>

      {/* Floor plan */}
      <div className="flex-1 overflow-hidden px-1 py-2">
        {(() => {
          // Build a row-aligned grid: each row has one table per column
          const maxRows = Math.max(...columns.map(([, col]) => col.length));
          return (
            <div
              className="h-full gap-x-1"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                gridTemplateRows: `repeat(${maxRows}, 1fr)`,
              }}
            >
              {Array.from({ length: maxRows }).map((_, rowIdx) =>
                columns.map(([colIdx, colTables]) => {
                  const table = colTables[rowIdx];
                  return (
                    <div key={`${colIdx}-${rowIdx}`} className="flex items-center justify-center">
                      {table && (
                        <TableUnit
                          table={table}
                          tableChairs={chairs.filter(c => c.table_id === table.id)}
                          showTime={showTime}
                          onChairToggle={handleChairToggle}
                          onTableTap={handleTableTap}
                          onExpand={expandTable}
                          isHighlighted={highlightedTables.has(table.id)}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}
      </div>

      {/* Action sheet for mapping orders */}
      {actionSheet && (
        <>
          <div className="fixed inset-0 bg-foreground/20 z-40" onClick={() => setActionSheet(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border rounded-t-3xl p-4 z-50 max-h-[40vh] overflow-y-auto">
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-3">Assign to order</h3>
            <div className="flex flex-wrap gap-2">
              {recentDone.map(order => (
                <button
                  key={order.id}
                  onClick={() => handleAssignOrder(actionSheet.table, order)}
                  className="px-4 py-3 rounded-xl bg-queue text-queue-foreground font-bold text-lg active:scale-95 transition-all shadow-md"
                >
                  #{order.order_number}
                  {order.group_size && <span className="text-sm ml-1 opacity-80">({order.group_size}p)</span>}
                </button>
              ))}
              <button
                onClick={async () => {
                  const tableChairs = chairs.filter(c => c.table_id === actionSheet.table.id);
                  for (const c of tableChairs) {
                    await toggleChair(c.id, true);
                  }
                  await updateTableStatus(actionSheet.table.id);
                  setActionSheet(null);
                }}
                className="px-4 py-3 rounded-xl bg-muted font-bold text-lg active:scale-95 transition-all"
              >
                No order
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
