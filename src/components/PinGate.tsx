import { useState, useEffect, useRef } from 'react';
import { Lock, Delete } from 'lucide-react';

const ADMIN_PIN = '8723';
const GUEST_PIN = '6610';
const STORAGE_KEY = 'queue-pin-verified';
const MODE_KEY = 'queue-pin-mode';

export type AccessMode = 'admin' | 'guest';

export function getAccessMode(): AccessMode {
  if (typeof window === 'undefined') return 'admin';
  return (sessionStorage.getItem(MODE_KEY) as AccessMode) || 'admin';
}

export function useAccessMode(): AccessMode {
  const [mode, setMode] = useState<AccessMode>(() => getAccessMode());
  useEffect(() => {
    const handler = () => setMode(getAccessMode());
    window.addEventListener('queue-pin-mode-change', handler);
    return () => window.removeEventListener('queue-pin-mode-change', handler);
  }, []);
  return mode;
}

export function PinGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [pressed, setPressed] = useState<number | 'del' | null>(null);
  const [glow, setGlow] = useState<number | 'del' | null>(null);
  const [rippleId, setRippleId] = useState(0);
  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setVerified(true);
    }
  }, []);

  useEffect(() => () => { if (glowTimer.current) clearTimeout(glowTimer.current); }, []);

  const press = (key: number | 'del') => {
    setPressed(key);
    setGlow(key);
    setRippleId(id => id + 1);
    if (glowTimer.current) clearTimeout(glowTimer.current);
  };

  const release = () => {
    setPressed(null);
    if (glowTimer.current) clearTimeout(glowTimer.current);
    glowTimer.current = setTimeout(() => setGlow(null), 520);
  };


  const handleKey = (key: number | 'del') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    if (key === 'del') {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    if (input.length >= 4) return;
    const next = input + key;
    setInput(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === ADMIN_PIN || next === GUEST_PIN) {
          const mode: AccessMode = next === GUEST_PIN ? 'guest' : 'admin';
          sessionStorage.setItem(STORAGE_KEY, 'true');
          sessionStorage.setItem(MODE_KEY, mode);
          window.dispatchEvent(new Event('queue-pin-mode-change'));
          setVerified(true);
        } else {
          setError(true);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([50, 30, 50]);
          }
          setInput('');
          setTimeout(() => setError(false), 600);
        }
      }, 150);
    }
  };

  if (verified) return <>{children}</>;

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center"
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
        background: 'linear-gradient(160deg, hsl(220 20% 10%) 0%, hsl(230 25% 18%) 40%, hsl(260 30% 22%) 100%)',
      }}
    >
      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, hsl(var(--queue)), hsl(var(--queue-end)))' }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'linear-gradient(135deg, hsl(var(--available)), hsl(var(--available-end)))' }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-10 blur-3xl"
          style={{ background: 'linear-gradient(135deg, hsl(var(--sharing)), hsl(var(--sharing-end)))' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Lock icon with gradient ring */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--queue)), hsl(var(--queue-end)))',
              boxShadow: '0 8px 32px hsl(var(--queue) / 0.4)',
            }}
          >
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div
            className="absolute -inset-1 rounded-[1.25rem] -z-10 opacity-50 blur-sm"
            style={{ background: 'linear-gradient(135deg, hsl(var(--queue)), hsl(var(--queue-end)))' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-lg font-extrabold text-white tracking-tight">Xác thực truy cập</h1>
          <p className="text-xs font-medium text-white/40 mt-0.5">Nhập mã PIN 4 chữ số</p>
        </div>

        {/* PIN dots */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                error
                  ? 'animate-shake'
                  : ''
              }`}
              style={{
                background: input[i]
                  ? 'linear-gradient(135deg, hsl(var(--queue)), hsl(var(--queue-end)))'
                  : 'hsl(220 20% 16%)',
                border: `2px solid ${
                  error
                    ? 'hsl(var(--occupied))'
                    : input[i]
                    ? 'hsl(var(--queue) / 0.6)'
                    : 'hsl(220 20% 24%)'
                }`,
                boxShadow: input[i] ? '0 4px 20px hsl(var(--queue) / 0.3)' : 'none',
              }}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  input[i] ? 'scale-100' : 'scale-0'
                }`}
                style={{ background: 'white' }}
              />
            </div>
          ))}
        </div>

        {/* Error message */}
        <div className={`h-4 transition-opacity duration-300 ${error ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs font-bold" style={{ color: 'hsl(var(--occupied))' }}>Mã PIN không đúng</p>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) =>
            key === null ? (
              <div key={i} />
            ) : (
              (() => {
                const isDown = pressed === key;
                const isGlow = glow === key;
                const active = isDown || isGlow;
                const isDel = key === 'del';
                return (
                  <button
                    key={i}
                    onClick={() => handleKey(key as number | 'del')}
                    onPointerDown={() => press(key as number | 'del')}
                    onPointerUp={() => release()}
                    onPointerLeave={() => release()}
                    onPointerCancel={() => release()}
                    className="relative overflow-hidden w-[72px] h-[56px] rounded-2xl font-bold text-xl"
                    style={{
                      background: isDel ? 'transparent' : 'hsl(220 20% 16%)',
                      border: isDel
                        ? 'none'
                        : `1px solid ${active ? 'hsl(var(--queue) / 0.7)' : 'hsl(220 20% 22%)'}`,
                      color: isDel ? 'hsl(var(--occupied))' : 'white',
                      transform: isDown ? 'scale(0.94)' : 'scale(1)',
                      boxShadow:
                        active && !isDel ? '0 8px 28px hsl(var(--queue) / 0.35)' : 'none',
                      transition:
                        'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 480ms ease-out, border-color 480ms ease-out',
                    }}
                  >
                    {/* Lingering fill + ripple */}
                    <span
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{
                        background: isDel
                          ? 'radial-gradient(circle at center, hsl(var(--occupied) / 0.35), hsl(var(--occupied) / 0.05))'
                          : 'linear-gradient(135deg, hsl(var(--queue)), hsl(var(--queue-end)))',
                        opacity: active ? 1 : 0,
                        transform: active ? 'scale(1)' : 'scale(1.15)',
                        transition:
                          'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    />
                    {isGlow && (
                      <span
                        key={rippleId}
                        className="absolute left-1/2 top-1/2 pointer-events-none rounded-full animate-key-ripple"
                        style={{
                          width: 96,
                          height: 96,
                          marginLeft: -48,
                          marginTop: -48,
                          background: isDel
                            ? 'hsl(var(--occupied) / 0.45)'
                            : 'hsl(0 0% 100% / 0.5)',
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center h-full">
                      {isDel ? <Delete className="w-5 h-5" /> : key}
                    </span>
                  </button>
                );
              })()
            )
          )}
        </div>
      </div>
    </div>
  );
}
