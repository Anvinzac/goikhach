import { useState, useEffect, useCallback } from 'react';
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
  const { orders, updateOrder } = useQueueOrders(session?.id);
  const [floorBadges, setFloorBadges] = useState<{ ground: number; first: number }>({ ground: 0, first: 0 });

  const waitingCount = orders
    .filter(o => o.status === 'waiting' && o.group_size != null)
    .reduce((sum, o) => sum + (o.group_size || 0), 0);

  const waitingGroups = orders.filter(o => o.status === 'waiting' && o.group_size != null).length;
  const estimatedMinutes = waitingGroups * 3;

  // Listen for table status changes to show badges
  useEffect(() => {
    if (!session?.id) return;
    const channel = supabase
      .channel('table-return-badges')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'restaurant_tables',
        filter: `session_id=eq.${session.id}`,
      }, (payload) => {
        const newRow = payload.new as { floor: string; status: string };
        if (newRow.status === 'available') {
          const floor = newRow.floor as 'ground' | 'first';
          setFloorBadges(prev => ({ ...prev, [floor]: prev[floor] + 1 }));
          // Auto-clear badge after 15 seconds
          setTimeout(() => {
            setFloorBadges(prev => ({ ...prev, [floor]: Math.max(0, prev[floor] - 1) }));
          }, 15000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.id]);

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

  const handleReset = () => {
    let held = 0;
    const interval = setInterval(() => {
      held++;
      if (held >= 1) {
        clearInterval(interval);
        setShowReset(false);
        startNewSession(session.session_type as 'lunch' | 'dinner');
        toast.success('Session reset!');
      }
    }, 1000);

    const handleUp = () => {
      clearInterval(interval);
      if (held < 1) {
        toast.info('Giữ 1 giây để reset');
      }
      document.removeEventListener('touchend', handleUp);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('touchend', handleUp);
    document.addEventListener('mouseup', handleUp);
  };

  return (
    <PinGate>
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'queue' && (
          <QueueManager
            sessionId={session.id}
            sessionType={session.session_type}
            onReset={handleReset}
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
                  {tab.icon && <tab.icon className="w-5 h-5" />}
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
