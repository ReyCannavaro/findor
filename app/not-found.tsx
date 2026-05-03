import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--gray-50, #F9F9F7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: 40 }}>
          <img src="/logo_findor.jpg" alt="Findor" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
        </Link>

        <div style={{ position: 'relative', marginBottom: 32 }}>
          <p style={{
            fontSize: 'clamp(96px, 20vw, 160px)',
            fontWeight: 900,
            color: '#0D3B2E',
            lineHeight: 1,
            letterSpacing: '-6px',
            opacity: 0.06,
            userSelect: 'none',
            margin: 0,
          }}>
            404
          </p>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D3B2E 0%, #2D6A4F 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(13,59,46,0.25)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          </div>
        </div>

        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#1A1917',
          marginBottom: 10,
          letterSpacing: '-0.5px',
        }}>
          Halaman Tidak Ditemukan
        </h1>
        <p style={{
          fontSize: 15,
          color: '#6B6960',
          lineHeight: 1.7,
          marginBottom: 36,
        }}>
          URL yang kamu kunjungi tidak ada atau sudah dipindahkan.
          Cek kembali alamatnya, atau kembali ke halaman utama.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0D3B2E', color: 'white',
            fontWeight: 600, fontSize: 15,
            padding: '13px 28px', borderRadius: 9999,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(13,59,46,0.25)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ke Beranda
          </Link>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: '#1A1917',
            fontWeight: 600, fontSize: 15,
            padding: '12px 28px', borderRadius: 9999,
            textDecoration: 'none',
            border: '1.5px solid #E2E0D9',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Cari Vendor
          </Link>
        </div>

      </div>
    </main>
  );
}