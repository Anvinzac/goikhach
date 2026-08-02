import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import type { QueueOrder } from '@/hooks/useQueueOrders';

// Mock QueueRow with a minimal harness that exposes the two update actions,
// so we can assert on QueueManager's double-tap debounce logic only.
vi.mock('../QueueRow', () => ({
  QueueRow: ({ order, onUpdate }: { order: QueueOrder; onUpdate: (id: string, u: Partial<QueueOrder>) => void }) => (
    <div>
      <button
        data-testid={`done-${order.order_number}`}
        onClick={() => onUpdate(order.id, { status: 'done' })}
      >
        done
      </button>
      <button
        data-testid={`cancel-${order.order_number}`}
        onClick={() => onUpdate(order.id, { status: 'cancelled' })}
      >
        cancel
      </button>
    </div>
  ),
}));

import { QueueManager } from '../QueueManager';

const makeOrder = (n: number, status: QueueOrder['status'] = 'waiting'): QueueOrder => ({
  id: `id-${n}`,
  session_id: 's1',
  order_number: n,
  group_size: 2,
  previous_group_size: null,
  status,
  notes: [],
  custom_note: null,
  registered_at: null,
  reached_table_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const renderManager = (updateOrder: (id: string, u: Partial<QueueOrder>) => void) =>
  render(
    <QueueManager
      sessionId="s1"
      sessionType="lunch"
      onResetPressStart={() => {}}
      onResetPressEnd={() => {}}
      onRefresh={() => {}}
      orders={[makeOrder(1), makeOrder(2)]}
      updateOrder={updateOrder}
      qrEnabled={false}
    />
  );

const enableFilter = () => {
  fireEvent.click(screen.getByTitle('Hide called (Done)'));
};

describe('QueueManager double-tap in filtered mode', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('defers the Done update while filtering', () => {
    const updateOrder = vi.fn();
    renderManager(updateOrder);
    enableFilter();

    fireEvent.click(screen.getByTestId('done-1'));
    expect(updateOrder).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(updateOrder).toHaveBeenCalledTimes(1);
    expect(updateOrder).toHaveBeenCalledWith('id-1', { status: 'done' });
  });

  it('turns a fast second tap into Cancelled without emitting Done', () => {
    const updateOrder = vi.fn();
    renderManager(updateOrder);
    enableFilter();

    fireEvent.click(screen.getByTestId('done-1'));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.click(screen.getByTestId('cancel-1'));

    expect(updateOrder).toHaveBeenCalledTimes(1);
    expect(updateOrder).toHaveBeenCalledWith('id-1', { status: 'cancelled' });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // The pending Done must never fire after the cancel.
    expect(updateOrder).toHaveBeenCalledTimes(1);
    expect(updateOrder).not.toHaveBeenCalledWith('id-1', { status: 'done' });
  });

  it('keeps per-row timers independent', () => {
    const updateOrder = vi.fn();
    renderManager(updateOrder);
    enableFilter();

    fireEvent.click(screen.getByTestId('done-1'));
    fireEvent.click(screen.getByTestId('done-2'));
    fireEvent.click(screen.getByTestId('cancel-2'));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(updateOrder).toHaveBeenCalledWith('id-2', { status: 'cancelled' });
    expect(updateOrder).toHaveBeenCalledWith('id-1', { status: 'done' });
    expect(updateOrder).toHaveBeenCalledTimes(2);
  });

  it('applies Done immediately when the filter is off', () => {
    const updateOrder = vi.fn();
    renderManager(updateOrder);

    fireEvent.click(screen.getByTestId('done-1'));
    expect(updateOrder).toHaveBeenCalledWith('id-1', { status: 'done' });
  });
});
