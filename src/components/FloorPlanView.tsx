import { useState, useMemo, useEffect, useRef } from 'react';
import { useFloorPlan, RestaurantTable, Chair } from '@/hooks/useFloorPlan';
import { useFloorReturnSignals } from '@/hooks/useFloorReturnSignals';
import { Timer, Plus, Minus, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FloorPlanViewProps {
  sessionId: string;
  floor: 'ground' | 'first';
}

function ChairIcon({ chair, onPing, isHighlighted }: { chair: Chair; onPing: (id: string) => void; isHighlighted: boolean }) {
  return (
    <button
      onClick={() => onPing(chair.id)}
      className={`relative w-8 h-5 rounded-md transition-all active:scale-90 shadow-sm
        ${chair.is_occupied ? 'bg-floor-neutral-occupied' : 'bg-floor-neutral-available'} ${isHighlighted ? 'return-signal-emphasis return-signal-surface' : ''}`}
    >
      {isHighlighted && (
        <span className="pointer-events-none absolute -top-2 -right-2 rounded-full bg-card/95 p-0.5 text-signal shadow-sm">
          <Bell className="h-2.5 w-2.5 animate-bell-nudge" />
        </span>
      )}
    </button>
  );
}

function TableUnit({
  table,
  tableChairs,
  showTime,
   onChairPing,
   onTablePing,
  onExpand,
   isTableHighlighted,
   highlightedChairIds,
}: {
  table: RestaurantTable;
  tableChairs: Chair[];
  showTime: boolean;
   onChairPing: (id: string) => void;
   onTablePing: (table: RestaurantTable) => void;
  onExpand: (tableId: string, newSize: number) => void;
   isTableHighlighted?: boolean;
   highlightedChairIds: Set<string>;
}) {
  const isBig = table.table_type === 'big';
  const topChairs = tableChairs.filter((_, i) => i < (isBig ? 2 : 1));
  const bottomChairs = tableChairs.filter((_, i) => i >= (isBig ? 2 : 1));

  const tableBg = {
    available: 'bg-floor-neutral-available border-floor-neutral-available',
    occupied: 'bg-floor-neutral-occupied border-floor-neutral-occupied',
    sharing: 'bg-floor-neutral-sharing border-floor-neutral-sharing',
  }[table.status];

  const currentChairCount = tableChairs.length;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Top chairs */}
      <div className="flex gap-1 justify-center">
        {topChairs.map(c => (
          <ChairIcon key={c.id} chair={c} onPing={onChairPing} isHighlighted={highlightedChairIds.has(c.id)} />
        ))}
      </div>

      {/* Table */}
      <button
        onClick={() => onTablePing(table)}
        className={`${isBig ? 'w-20 h-12' : 'w-14 h-10'} rounded-xl border-2 ${tableBg} flex items-center justify-center transition-all active:scale-95 relative ${isTableHighlighted ? 'return-signal-emphasis return-signal-surface' : ''}`}
      >
        {isTableHighlighted && (
          <span className="pointer-events-none absolute -top-2 -right-2 z-20 rounded-full bg-card p-1 text-signal shadow-md">
            <Bell className="h-3 w-3 animate-bell-nudge" />
          </span>
        )}
        {showTime && table.occupied_at && (
          <span className="relative z-10 text-[10px] font-bold text-foreground">
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
          <ChairIcon key={c.id} chair={c} onPing={onChairPing} isHighlighted={highlightedChairIds.has(c.id)} />
        ))}
      </div>
    </div>
  );
}

export function FloorPlanView({ sessionId, floor }: FloorPlanViewProps) {
  const { tables, chairs, expandTable } = useFloorPlan(sessionId, floor);
  const { highlightedTableIds: returnedTableIds, highlightedChairIds, pingTable, pingChair } = useFloorReturnSignals(sessionId, floor);
  const [showTime, setShowTime] = useState(false);
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

  const columns = useMemo(() => {
    const cols: Record<number, RestaurantTable[]> = {};
    tables.forEach(t => {
      if (!cols[t.column_position]) cols[t.column_position] = [];
      cols[t.column_position].push(t);
    });
    return Object.entries(cols).sort(([a], [b]) => Number(a) - Number(b));
  }, [tables]);

  const handleChairPing = async (chairId: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    await pingChair(chairId);
  };

  const handleTablePing = async (table: RestaurantTable) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
    await pingTable(table.id);
  };

  // columnLabels removed - no longer needed

  return (
    <div className="flex flex-col h-full">
      {/* Header with embedded legend */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">{floor === 'ground' ? 'Ground' : '1st Floor'}</h2>
          <div className="flex gap-2 text-[10px] font-semibold">
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-floor-neutral-available" />Avail</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-floor-neutral-occupied" />Occ</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-floor-neutral-sharing" />Share</span>
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
                          onChairPing={handleChairPing}
                          onTablePing={handleTablePing}
                          onExpand={expandTable}
                          isTableHighlighted={highlightedTables.has(table.id) || returnedTableIds.has(table.id)}
                          highlightedChairIds={highlightedChairIds}
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

    </div>
  );
}
