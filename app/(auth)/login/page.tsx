'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? 'Email atau password salah.');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const res  = await fetch('/api/v1/auth/google');
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch {
      setError('Gagal login dengan Google.');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#0d3b2e', position: 'relative', overflow: 'hidden' }}>

      {/* Background photo */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(13,59,46,0.7) 0%, rgba(13,59,46,0.97) 100%)' }} />
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480, margin: '40px 24px', background: 'white', borderRadius: 24, padding: '48px 52px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', animation: 'fadeUp 0.5s ease both' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/">
            <img src="/logo_findor.jpg" alt="Findor" style={{ height: 48, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
          </Link>
        </div>

        <div style={{ marginBottom: 32, animation: 'fadeUp 0.6s 0.15s both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: 6, lineHeight: 1.2, textAlign: 'center' }}>
            Masuk ke Findor
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>Selamat datang kembali 👋</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626', animation: 'fadeUp 0.3s ease both' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp 0.6s 0.28s both' }}>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="email@contoh.com"
              style={{
                ...inputStyle,
                borderColor: focused === 'email' ? '#0d3b2e' : '#e2e8f0',
                boxShadow: focused === 'email' ? '0 0 0 4px rgba(13,59,46,0.08)' : 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={labelStyle}>Password</label>
              <Link href="#" style={{ fontSize: 12, color: '#0d3b2e', fontWeight: 600, textDecoration: 'none' }}>
                Lupa password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Masukkan password"
                style={{
                  ...inputStyle,
                  paddingRight: 44,
                  borderColor: focused === 'password' ? '#0d3b2e' : '#e2e8f0',
                  boxShadow: focused === 'password' ? '0 0 0 4px rgba(13,59,46,0.08)' : 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              background: loading ? '#e2e8f0' : '#0d3b2e',
              color: loading ? '#94a3b8' : 'white',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(13,59,46,0.25)',
              letterSpacing: '-0.01em',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spin-dot" />
                Memproses...
              </span>
            ) : (
              <>Masuk <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0', animation: 'fadeUp 0.6s 0.4s both' }}>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500 }}>atau lanjutkan dengan</span>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        </div>

        <button
          onClick={handleGoogle}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: '1.5px solid #e2e8f0',
            background: 'white',
            fontSize: 15,
            fontWeight: 600,
            color: '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'inherit',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            animation: 'fadeUp 0.6s 0.45s both',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Masuk dengan Google
        </button>

        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 20 }}>
          Belum punya akun?{' '}
          <Link href="/register" style={{ color: '#0d3b2e', fontWeight: 700, textDecoration: 'none' }}>Daftar gratis</Link>
        </p>

        <p style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginTop: 16, lineHeight: 1.7 }}>
          Dengan masuk, Anda menyetujui{' '}
          <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Syarat & Ketentuan</Link>
          {' '}dan{' '}
          <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Kebijakan Privasi</Link>
          {' '}Findor.
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-dot {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
        }
      `}</style>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#374151',
  letterSpacing: '0.02em',
  display: 'block',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  fontSize: 15,
  border: '1.5px solid #e2e8f0',
  outline: 'none',
  fontFamily: 'inherit',
  color: '#0f172a',
  background: '#fafafa',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};