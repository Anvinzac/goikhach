import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { QueueManager } from '@/components/QueueManager';
import { FloorPlanView } from '@/components/FloorPlanView';
import { SessionStarter } from '@/components/SessionStarter';
import { Users, MapPin, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'queue' | 'ground' | 'first';

const Index = () => {
  const { session, loading, startNewSession } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const [showReset, setShowReset] = useState(false);

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

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'queue', label: 'Queue', icon: Users },
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
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg text-queue">🍽</span>
          <span className="font-bold text-sm capitalize">{session.session_type}</span>
        </div>
        <button
          onMouseDown={handleReset}
          onTouchStart={handleReset}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted active:bg-occupied active:text-occupied-foreground transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'queue' && <QueueManager sessionId={session.id} />}
        {activeTab === 'ground' && <FloorPlanView sessionId={session.id} floor="ground" />}
        {activeTab === 'first' && <FloorPlanView sessionId={session.id} floor="first" />}
      </div>

      {/* Bottom tabs */}
      <div className="flex border-t-2 border-border bg-card safe-area-bottom">
        {tabs.map(tab => {
          const Icon = tab.icon;
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
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-all active:scale-95
                ${active ? 'text-queue' : 'text-muted-foreground'}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
