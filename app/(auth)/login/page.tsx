'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Shield, Zap, Star } from 'lucide-react';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect') ?? '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [focused,  setFocused]  = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/v1/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error ?? 'Email atau password salah.'); return; }
      router.push(redirectTo);
      router.refresh();
    } catch { setError('Terjadi kesalahan. Coba lagi.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      const res  = await fetch('/api/v1/auth/google');
      const data = await res.json();
      if (data.success && data.data?.url) window.location.href = data.data.url;
    } catch { setError('Gagal login dengan Google.'); }
  };

  return (
    <div style={wrapStyle}>
      <LeftPanel />

      <div style={rightStyle}>
        <div style={cardStyle}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link href="/">
              <img src="/logo_findor.jpg" alt="Findor"
                style={{ height: 44, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{
              fontSize: 27, fontWeight: 900, color: '#0f172a',
              letterSpacing: '-0.7px', marginBottom: 6,
              fontFamily: 'Fraunces, serif',
            }}>
              Selamat Datang Kembali
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Masuk untuk melanjutkan ke Findor 👋</p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, padding: '12px 16px', marginBottom: 22,
              fontSize: 13, color: '#dc2626',
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'shake 0.4s ease both',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={labelSt}>Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="email@contoh.com"
                style={inputSt(focused === 'email')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={labelSt}>Password</label>
                <Link href="#" style={{ fontSize: 12, color: '#0d3b2e', fontWeight: 600, textDecoration: 'none' }}>
                  Lupa password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Masukkan password"
                  style={{ ...inputSt(focused === 'password'), paddingRight: 46 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 4, width: '100%', padding: '15px 20px', borderRadius: 14,
                background: loading ? '#e5e7eb' : '#0d3b2e',
                color: loading ? '#9ca3af' : 'white',
                fontSize: 15, fontWeight: 700, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(13,59,46,0.28)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#145740'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d3b2e'; }}
            >
              {loading ? <><Spinner /> Memproses...</> : <>Masuk ke Findor <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
            <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500, whiteSpace: 'nowrap' }}>atau masuk dengan</span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          </div>

          <button
            onClick={handleGoogle}
            style={{
              width: '100%', padding: '13px', borderRadius: 14,
              border: '1.5px solid #e2e8f0', background: 'white',
              fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'inherit', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2e0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'white'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Masuk dengan Google
          </button>

          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 22 }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#0d3b2e', fontWeight: 700, textDecoration: 'none' }}>Daftar gratis</Link>
          </p>
          <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 10, lineHeight: 1.7 }}>
            Dengan masuk, Anda menyetujui{' '}
            <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Kebijakan Privasi</Link>
            {' '}Findor.
          </p>
        </div>
      </div>

      <Styles />
    </div>
  );
}

function LeftPanel() {
  return (
    <div style={{
      flex: '0 0 44%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #0a2e20 0%, #0d3b2e 50%, #1a5c41 100%)',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 40%', opacity: 0.10 }} />
      <div style={{ position: 'absolute', top: -100, right: -100, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(64,145,108,0.18) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px' }}>
        <Link href="/">
          <img src="/logo_findor.jpg" alt="Findor" style={{ height: 44, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
        </Link>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#f5a623', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>✦ Platform Event Indonesia</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
            Semua Vendor<br />
            <em style={{ fontStyle: 'italic', color: '#f5a623', fontWeight: 300 }}>Terpercaya</em><br />
            Ada di Sini
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 280 }}>
            Dari sound system hingga wedding organizer, temukan dan pesan vendor terbaik untuk acara Anda.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: <Shield size={15} />, text: 'Vendor terverifikasi dengan KTP asli' },
            { icon: <Zap size={15} />,   text: 'Booking & negosiasi langsung via WhatsApp' },
            { icon: <Star size={15} />,  text: 'Ribuan ulasan nyata dari pengguna' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5a623' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#f5a623" color="#f5a623" />)}
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', marginLeft: 6 }}>4.9/5</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
            &ldquo;Berkat Findor, kami menemukan vendor sound system terbaik untuk konser kami dalam waktu singkat!&rdquo;
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>— Budi S., Event Organizer Surabaya</p>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,300&display=swap');
      @keyframes spin  { to { transform: rotate(360deg); } }
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @media (max-width: 768px) {
        .left-panel { display: none !important; }
      }
    `}</style>
  );
}

const wrapStyle: React.CSSProperties = { display: 'flex', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' };
const rightStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px 24px' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: 460, background: 'white', borderRadius: 24, padding: '44px 48px', boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)', animation: 'fadeUp 0.5s ease both' };
const labelSt: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#374151', letterSpacing: '0.01em', display: 'block', marginBottom: 7 };
function inputSt(focused: boolean): React.CSSProperties {
  return { width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#0f172a', background: '#fafafa', boxSizing: 'border-box' as const, border: `1.5px solid ${focused ? '#0d3b2e' : '#e2e8f0'}`, boxShadow: focused ? '0 0 0 3px rgba(13,59,46,0.08)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s' };
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f8fafc' }} />}>
      <LoginForm />
    </Suspense>
  );
}