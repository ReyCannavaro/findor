export default function Loading() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--gray-50, #F9F9F7)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        .sk {
          background: linear-gradient(90deg, #EDEDE9 25%, #E2E0D9 50%, #EDEDE9 75%);
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
          border-radius: 8px;
        }
      `}</style>

      <div style={{
        position: 'fixed', top: 16, left: 0, right: 0,
        zIndex: 100, display: 'flex', justifyContent: 'center', padding: '0 20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: 9999, padding: '8px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '0.75px solid rgba(255,255,255,0.9)',
          width: '100%', maxWidth: 720,
        }}>
          <div className="sk" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <div style={{ width: 1, height: 22, background: '#E2E0D9', margin: '0 4px' }} />
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {[80, 72, 80].map((w, i) => (
              <div key={i} className="sk" style={{ width: w, height: 14, borderRadius: 9999 }} />
            ))}
          </div>
          <div className="sk" style={{ width: 120, height: 36, borderRadius: 9999 }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '110px 24px 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="sk" style={{ width: 180, height: 14, borderRadius: 9999, marginBottom: 16 }} />
          <div className="sk" style={{ width: 280, height: 30, marginBottom: 10 }} />
          <div className="sk" style={{ width: 200, height: 14 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '20px 22px', border: '1px solid #F0EFEB', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="sk" style={{ width: 38, height: 38, borderRadius: 10 }} />
              <div>
                <div className="sk" style={{ width: '60%', height: 12, marginBottom: 8 }} />
                <div className="sk" style={{ width: '40%', height: 28 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0EFEB', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #F9F9F7', display: 'flex', justifyContent: 'space-between' }}>
              <div className="sk" style={{ width: 140, height: 16 }} />
              <div className="sk" style={{ width: 70, height: 14, borderRadius: 9999 }} />
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="sk" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="sk" style={{ width: '70%', height: 13, marginBottom: 8 }} />
                    <div className="sk" style={{ width: '50%', height: 11 }} />
                  </div>
                  <div className="sk" style={{ width: 72, height: 22, borderRadius: 9999 }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0EFEB', padding: '18px 20px' }}>
              <div className="sk" style={{ width: 120, height: 15, marginBottom: 16 }} />
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                  <div className="sk" style={{ width: 34, height: 34, borderRadius: 9 }} />
                  <div style={{ flex: 1 }}>
                    <div className="sk" style={{ width: '80%', height: 12, marginBottom: 6 }} />
                    <div className="sk" style={{ width: '55%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0EFEB', padding: '18px 20px' }}>
              <div className="sk" style={{ width: 140, height: 15, marginBottom: 16 }} />
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  <div className="sk" style={{ width: 38, height: 38, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="sk" style={{ width: '75%', height: 12, marginBottom: 6 }} />
                    <div className="sk" style={{ width: '45%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'white', borderRadius: 9999,
        padding: '10px 20px',
        boxShadow: '0 4px 20px rgba(13,59,46,0.12)',
        border: '1px solid #F0EFEB',
      }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#0D3B2E',
              animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#6B6960' }}>Memuat halaman…</span>
      </div>

    </main>
  );
}