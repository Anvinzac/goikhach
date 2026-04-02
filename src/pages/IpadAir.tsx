import { useState, useEffect } from 'react';
import { useKiosk } from '@/hooks/useKiosk';
import { QRCodeSVG } from 'qrcode.react';

const PUBLISHED_APP_URL = 'https://khach.quanchay.la';

function getBaseUrl() {
  if (typeof window === 'undefined') return PUBLISHED_APP_URL;
  const host = window.location.hostname;
  const isPreview = host.includes('lovableproject.com') || host.includes('preview--');
  return isPreview ? PUBLISHED_APP_URL : window.location.origin;
}

const PIN = '8723';

export default function IpadAir() {
  const [verified, setVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('queue-pin-verified') === 'true') {
      setVerified(true);
    }
  }, []);

  const handlePinKey = (key: string) => {
    if (key === 'del') {
      setPinInput(prev => prev.slice(0, -1));
      return;
    }
    if (pinInput.length >= 4) return;
    const next = pinInput + key;
    setPinInput(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === PIN) {
          setVerified(true);
          sessionStorage.setItem('queue-pin-verified', 'true');
        } else {
          setPinError(true);
          setPinInput('');
          setTimeout(() => setPinError(false), 800);
        }
      }, 150);
    }
  };

  if (!verified) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0014',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', color: '#fff', fontWeight: 'bold' }}>🔒</div>
          <h1 style={{ color: '#fff', fontSize: '18px', margin: '12px 0 4px' }}>Xác thực truy cập</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Nhập mã PIN 4 chữ số</p>
        </div>

        {/* PIN dots */}
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '48px',
              height: '48px',
              margin: '0 6px',
              borderRadius: '12px',
              border: pinError ? '2px solid #e53e3e' : pinInput[i] ? '2px solid #6366f1' : '2px solid #333',
              background: pinInput[i] ? '#6366f1' : '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {pinInput[i] && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
            </div>
          ))}
        </div>

        {pinError && <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '12px' }}>Mã PIN không đúng</p>}

        {/* Numpad */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '260px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) =>
            key === null ? (
              <div key={i} style={{ width: '72px', height: '52px', margin: '4px' }} />
            ) : (
              <button
                key={i}
                onClick={() => handlePinKey(String(key === 'del' ? 'del' : key))}
                style={{
                  width: '72px',
                  height: '52px',
                  margin: '4px',
                  borderRadius: '12px',
                  border: key === 'del' ? 'none' : '1px solid #333',
                  background: key === 'del' ? 'transparent' : '#1a1a2e',
                  color: key === 'del' ? '#e53e3e' : '#fff',
                  fontSize: key === 'del' ? '14px' : '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                }}
              >
                {key === 'del' ? '⌫' : key}
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  return <IpadAirKiosk />;
}

function IpadAirKiosk() {
  const { currentOrderNumber, secretCode, sessionType, loading, noSession, allUsed, claimed } = useKiosk();
  const qrUrl = secretCode ? `${getBaseUrl()}/join/${secretCode}` : null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0014',
        color: '#d8b4fe',
        fontSize: '24px',
        fontFamily: 'sans-serif',
      }}>
        Đang tải…
      </div>
    );
  }

  if (noSession) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0014',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '32px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
        <h1 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24px', margin: '0 0 8px' }}>Chưa có phiên hoạt động</h1>
        <p style={{ color: 'rgba(200,170,255,0.5)', fontSize: '16px' }}>No active session</p>
      </div>
    );
  }

  if (allUsed) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0014',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '32px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h1 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24px', margin: '0 0 8px' }}>Hết số</h1>
        <p style={{ color: 'rgba(200,170,255,0.5)', fontSize: '16px' }}>All numbers have been assigned</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0014',
      fontFamily: 'sans-serif',
      padding: '24px',
    }}>
      {/* Session badge */}
      <div style={{
        padding: '6px 16px',
        borderRadius: '999px',
        background: 'rgba(120,50,160,0.3)',
        border: '1px solid rgba(180,100,255,0.2)',
        color: '#d8b4fe',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '24px',
      }}>
        {sessionType === 'lunch' ? 'Trưa / Lunch' : 'Tối / Dinner'}
      </div>

      {/* Title */}
      <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px', textAlign: 'center' }}>
        Quét mã để lấy số
      </h1>
      <p style={{ color: 'rgba(200,170,255,0.4)', fontSize: '15px', margin: '0 0 32px', textAlign: 'center' }}>
        Scan to get your queue number
      </p>

      {/* QR or claimed */}
      {claimed ? (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(180,100,255,0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', fontWeight: 600, margin: '0 0 4px' }}>Đang chờ xác nhận</p>
          <p style={{ color: 'rgba(200,170,255,0.4)', fontSize: '13px', margin: 0 }}>A customer is selecting their group size…</p>
        </div>
      ) : qrUrl ? (
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(160,60,255,0.2)',
        }}>
          <QRCodeSVG value={qrUrl} size={260} level="M" includeMargin={false} />
        </div>
      ) : null}

      {/* Current number */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(180,130,255,0.4)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Số hiện tại / Current number
        </p>
        <div style={{
          fontSize: '96px',
          fontWeight: 900,
          color: '#c4b5fd',
          lineHeight: 1,
        }}>
          {currentOrderNumber}
        </div>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: '48px',
        color: 'rgba(160,100,255,0.25)',
        fontSize: '11px',
        textAlign: 'center',
        maxWidth: '280px',
        lineHeight: 1.5,
      }}>
        Mỗi mã QR chỉ dùng được một lần. Vui lòng không chụp ảnh mã.
        <br />
        Each QR code is single-use. Please do not take photos.
      </p>
    </div>
  );
}
