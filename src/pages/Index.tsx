import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/hooks/useSession';
import { useQueueOrders } from '@/hooks/useQueueOrders';
import { QueueManager } from '@/components/QueueManager';
import { FloorPlanView } from '@/components/FloorPlanView';
import { SessionStarter } from '@/components/SessionStarter';
import { PinGate } from '@/components/PinGate';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Tab = 'queue' | 'ground' | 'first';

const Index = () => {
  const { session, loading, startNewSession } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const [showReset, setShowReset] = useState(false);
  const [qrEnabled, setQrEnabled] = useState(false);
  const { orders, updateOrder, refetch } = useQueueOrders(session?.id);
  const [floorBadges, setFloorBadges] = useState<{ ground: number; first: number }>({ ground: 0, first: 0 });
  const resetTimerRef = useRef<number | null>(null);
  const resetTriggeredRef = useRef(false);

  const waitingCount = orders
    .filter(o => o.status === 'waiting' && o.group_size != null)
    .reduce((sum, o) => sum + (o.group_size || 0), 0);

  const waitingGroups = orders.filter(o => o.status === 'waiting' && o.group_size != null).length;
  const estimatedMinutes = waitingGroups * 3;

  // Listen for shared floor return signals to show badges and draw attention
  useEffect(() => {
    if (!session?.id) return;
    const channel = supabase
      .channel('table-return-badges')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'floor_return_signals',
        filter: `session_id=eq.${session.id}`,
      }, (payload) => {
        const newRow = payload.new as { floor: string };
        const floor = newRow.floor as 'ground' | 'first';
        if (!['ground', 'first'].includes(floor)) return;

        setFloorBadges(prev => ({ ...prev, [floor]: prev[floor] + 1 }));

        setTimeout(() => {
          setFloorBadges(prev => ({ ...prev, [floor]: Math.max(0, prev[floor] - 1) }));
        }, 40000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.id]);

  const handleResetPressStart = useCallback(() => {
    if (!session || resetTimerRef.current !== null) return;

    resetTriggeredRef.current = false;
    resetTimerRef.current = window.setTimeout(() => {
      resetTriggeredRef.current = true;
      resetTimerRef.current = null;
      setShowReset(false);
      startNewSession(session.session_type as 'lunch' | 'dinner');
      toast.success('Session reset!');
    }, 1000);
  }, [session, startNewSession]);

  const handleResetPressEnd = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (resetTriggeredRef.current) {
      resetTriggeredRef.current = false;
      return;
    }

    await refetch();
    toast.success('Đã tải dữ liệu mới nhất');
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-queue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <SessionStarter onStart={(type, notice) => startNewSession(type, notice)} loading={false} />;
  }

  const tabs: { id: Tab; label: string; icon?: typeof MapPin; badgeKey?: 'ground' | 'first' }[] = [
    { id: 'queue', label: 'Queue' },
    { id: 'ground', label: 'Ground', icon: MapPin, badgeKey: 'ground' },
    { id: 'first', label: '1st Floor', icon: MapPin, badgeKey: 'first' },
  ];

  return (
    <PinGate>
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'queue' && (
          <QueueManager
            sessionId={session.id}
            sessionType={session.session_type}
            onResetPressStart={handleResetPressStart}
            onResetPressEnd={handleResetPressEnd}
            onRefresh={handleRefresh}
            estimatedMinutes={estimatedMinutes}
            orders={orders}
            updateOrder={updateOrder}
            qrEnabled={qrEnabled}
            onToggleQr={() => setQrEnabled(v => !v)}
          />
        )}
        {activeTab === 'ground' && <FloorPlanView sessionId={session.id} floor="ground" />}
        {activeTab === 'first' && <FloorPlanView sessionId={session.id} floor="first" />}
      </div>

      {/* Bottom tabs */}
      <div className="flex border-t border-border bg-card safe-area-bottom flex-shrink-0">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.badgeKey) {
                  setFloorBadges(prev => ({ ...prev, [tab.badgeKey!]: 0 }));
                }
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate(15);
                }
              }}
              className={`flex-1 flex flex-col items-center py-1 transition-all active:scale-95
                ${active ? 'text-queue' : 'text-muted-foreground'}`}
            >
              {tab.id === 'queue' ? (
                <span className="text-xl font-black tabular-nums leading-none">{waitingCount}</span>
              ) : (
                <span className="relative">
                  {tab.icon && (
                    <tab.icon
                      className={`w-5 h-5 transition-all ${tab.badgeKey && floorBadges[tab.badgeKey] > 0 ? 'text-signal animate-bell-nudge' : ''}`}
                    />
                  )}
                  {tab.badgeKey && floorBadges[tab.badgeKey] > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-available text-[10px] font-black flex items-center justify-center px-0.5 animate-bounce">
                      {floorBadges[tab.badgeKey]}
                    </span>
                  )}
                </span>
              )}
              <span className="text-[10px] font-bold leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
    </PinGate>
  );
};

export default Index;
