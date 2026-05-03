'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Findor Error]', error);
  }, [error]);

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

        <div style={{ marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(220,38,38,0.25)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#1A1917',
          marginBottom: 10,
          letterSpacing: '-0.5px',
        }}>
          Terjadi Kesalahan
        </h1>
        <p style={{
          fontSize: 15,
          color: '#6B6960',
          lineHeight: 1.7,
          marginBottom: 8,
        }}>
          Ada sesuatu yang tidak berjalan sebagaimana mestinya.
          Coba muat ulang halaman — biasanya ini berhasil.
        </p>

        {error.digest && (
          <p style={{
            fontSize: 11,
            color: '#9E9C94',
            fontFamily: 'monospace',
            background: '#F0EFEB',
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 6,
            marginBottom: 28,
          }}>
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div style={{ marginBottom: 28 }} />}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0D3B2E', color: 'white',
              fontWeight: 600, fontSize: 15,
              padding: '13px 28px', borderRadius: 9999,
              border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 16px rgba(13,59,46,0.25)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Coba Lagi
          </button>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: '#1A1917',
            fontWeight: 600, fontSize: 15,
            padding: '12px 28px', borderRadius: 9999,
            textDecoration: 'none',
            border: '1.5px solid #E2E0D9',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ke Beranda
          </Link>
        </div>

      </div>
    </main>
  );
}