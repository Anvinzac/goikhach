import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const PIN = '8723';
const STORAGE_KEY = 'queue-pin-verified';

export function PinGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setVerified(true);
    }
  }, []);

  const handleSubmit = () => {
    if (input === PIN) {
      setVerified(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 1000);
    }
  };

  if (verified) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-bold text-foreground">Nhập mã PIN</p>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                error ? 'border-occupied animate-shake' : input[i] ? 'border-foreground' : 'border-border'
              }`}
            >
              {input[i] ? '●' : ''}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
            key === null ? <div key={i} /> :
            <button
              key={i}
              onClick={() => {
                if (key === 'del') {
                  setInput(prev => prev.slice(0, -1));
                } else if (input.length < 4) {
                  const next = input + key;
                  setInput(next);
                  if (next.length === 4) {
                    setTimeout(() => {
                      if (next === PIN) {
                        setVerified(true);
                        sessionStorage.setItem(STORAGE_KEY, 'true');
                      } else {
                        setError(true);
                        setInput('');
                        setTimeout(() => setError(false), 1000);
                      }
                    }, 150);
                  }
                }
              }}
              className="w-16 h-14 rounded-xl bg-muted text-foreground font-bold text-lg active:scale-90 transition-all hover:bg-accent"
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
