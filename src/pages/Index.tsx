import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useQueueOrders } from '@/hooks/useQueueOrders';
import { QueueManager } from '@/components/QueueManager';
import { FloorPlanView } from '@/components/FloorPlanView';
import { SessionStarter } from '@/components/SessionStarter';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'queue' | 'ground' | 'first';

const Index = () => {
  const { session, loading, startNewSession } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const [showReset, setShowReset] = useState(false);
  const { orders } = useQueueOrders(session?.id);

  const waitingCount = orders
    .filter(o => o.status === 'waiting' && o.group_size != null)
    .reduce((sum, o) => sum + (o.group_size || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-queue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <SessionStarter onStart={startNewSession} loading={false} />;
  }

  const tabs: { id: Tab; label: string; icon?: typeof MapPin }[] = [
    { id: 'queue', label: 'Queue' },
    { id: 'ground', label: 'Ground', icon: MapPin },
    { id: 'first', label: '1st Floor', icon: MapPin },
  ];

  const handleReset = () => {
    let held = 0;
    const interval = setInterval(() => {
      held++;
      if (held >= 3) {
        clearInterval(interval);
        setShowReset(false);
        startNewSession(session.session_type as 'lunch' | 'dinner');
        toast.success('Session reset!');
      }
    }, 1000);

    const handleUp = () => {
      clearInterval(interval);
      if (held < 3) {
        toast.info('Hold for 3 seconds to reset');
      }
      document.removeEventListener('touchend', handleUp);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('touchend', handleUp);
    document.addEventListener('mouseup', handleUp);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'queue' && (
          <QueueManager
            sessionId={session.id}
            sessionType={session.session_type}
            onReset={handleReset}
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
                tab.icon && <tab.icon className="w-5 h-5" />
              )}
              <span className="text-[10px] font-bold leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
