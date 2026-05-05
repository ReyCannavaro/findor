'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, CheckCircle, Mail, Shield, Zap, Star } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep]           = useState<'form' | 'verify'>('form');
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm]           = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [focused, setFocused]     = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const passStrength = form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : form.password.length < 12 ? 2 : 3;
  const passLabels  = ['', 'Lemah', 'Sedang', 'Kuat'];
  const passColors  = ['', '#ef4444', '#f5a623', '#16a34a'];

  const canSubmit = form.full_name.trim().length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.password === form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, full_name: form.full_name }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error ?? 'Gagal membuat akun.'); return; }
      setStep('verify');
    } catch { setError('Terjadi kesalahan. Coba lagi.'); }
    finally { setLoading(false); }
  };

  // ── EMAIL VERIFICATION SCREEN ─────────────────────────────
  if (step === 'verify') return (
    <div style={wrapStyle}>
      <LeftPanel />
      <div style={rightStyle}>
        <div style={cardStyle}>
          {/* Animated envelope */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '3px solid #a7f3d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'bounceIn 0.6s cubic-bezier(0.22,1,0.36,1) both',
              position: 'relative',
            }}>
              <Mail size={40} color="#059669" strokeWidth={1.5} />
              {/* Ping animation */}
              <div style={{
                position: 'absolute', inset: -6,
                borderRadius: '50%', border: '2px solid #a7f3d0',
                animation: 'ping 2s ease-out infinite',
              }} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', fontFamily: 'Fraunces, serif', letterSpacing: '-0.5px' }}>
              Cek Inbox Kamu! 📬
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
              Kami sudah mengirim link verifikasi ke
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#f0fdf4', border: '1.5px solid #bbf7d0',
              borderRadius: 12, padding: '10px 18px', marginTop: 8,
            }}>
              <Mail size={15} color="#16a34a" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>{form.email}</span>
            </div>
          </div>

          {/* Steps */}
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Langkah selanjutnya
            </p>
            {[
              { n: '1', text: 'Buka email dari Findor di inbox atau folder Spam' },
              { n: '2', text: 'Klik tombol "Verifikasi Email" di dalam email tersebut' },
              { n: '3', text: 'Kamu akan diarahkan kembali ke Findor dan langsung bisa masuk' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: '#0d3b2e', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                }}>
                  {s.n}
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: '3px 0 0' }}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Warning: cek spam */}
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 12, padding: '12px 16px', marginBottom: 24,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
              Tidak ada email masuk? Cek folder <strong>Spam</strong> atau <strong>Promosi</strong>. Email mungkin tertunda 1–2 menit.
            </p>
          </div>

          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '14px', borderRadius: 14,
            background: '#0d3b2e', color: 'white',
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(13,59,46,0.25)',
          }}>
            Ke Halaman Login <ArrowRight size={16} />
          </Link>

          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 16 }}>
            Email salah?{' '}
            <button
              onClick={() => setStep('form')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d3b2e', fontWeight: 700, fontSize: 13, padding: 0, fontFamily: 'inherit' }}
            >
              Daftar ulang
            </button>
          </p>
        </div>
      </div>
      <Styles />
    </div>
  );

  // ── REGISTER FORM ──────────────────────────────────────────
  return (
    <div style={wrapStyle}>
      <LeftPanel />
      <div style={rightStyle}>
        <div style={cardStyle}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link href="/">
              <img src="/logo_findor.jpg" alt="Findor" style={{ height: 44, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
            </Link>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.6px', marginBottom: 6, textAlign: 'center', fontFamily: 'Fraunces, serif' }}>
              Buat Akun Gratis
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
              Bergabung dengan ribuan penyelenggara event di Indonesia
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

            {/* Nama */}
            <Field label="Nama Lengkap">
              <input
                value={form.full_name} onChange={e => set('full_name', e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                placeholder="Nama lengkap Anda" required
                style={inputSt(focused === 'name')}
              />
            </Field>

            {/* Email */}
            <Field label="Email">
              <input
                type="email" value={form.email} onChange={e => set('email', e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="email@contoh.com" required
                style={inputSt(focused === 'email')}
              />
            </Field>

            {/* Password */}
            <Field label="Password">
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                  placeholder="Min. 8 karakter" required
                  style={{ ...inputSt(focused === 'pass'), paddingRight: 44 }}
                />
                <EyeBtn show={showPass} toggle={() => setShowPass(v => !v)} />
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 99,
                        background: passStrength >= i ? passColors[passStrength] : '#e5e7eb',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: passColors[passStrength], fontWeight: 600 }}>
                    {passLabels[passStrength]}
                  </p>
                </div>
              )}
            </Field>

            {/* Konfirmasi */}
            <Field label="Konfirmasi Password">
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'} value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  placeholder="Ulangi password" required
                  style={{
                    ...inputSt(focused === 'confirm'),
                    paddingRight: 44,
                    borderColor: form.confirm && form.confirm !== form.password ? '#fca5a5'
                      : form.confirm && form.confirm === form.password ? '#86efac'
                      : focused === 'confirm' ? '#0d3b2e' : '#e2e8f0',
                  }}
                />
                <EyeBtn show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
                {form.confirm && form.confirm === form.password && (
                  <div style={{ position: 'absolute', right: 42, top: '50%', transform: 'translateY(-50%)' }}>
                    <CheckCircle size={15} color="#16a34a" />
                  </div>
                )}
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Password tidak cocok</p>
              )}
            </Field>

            <button
              type="submit" disabled={!canSubmit || loading}
              style={{
                marginTop: 4, width: '100%', padding: '15px', borderRadius: 14,
                background: canSubmit && !loading ? '#0d3b2e' : '#e5e7eb',
                color: canSubmit && !loading ? 'white' : '#9ca3af',
                fontSize: 15, fontWeight: 700, border: 'none',
                cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'all 0.2s',
                boxShadow: canSubmit && !loading ? '0 4px 20px rgba(13,59,46,0.25)' : 'none',
              }}
            >
              {loading
                ? <><Spinner /> Membuat akun...</>
                : <>Buat Akun Gratis <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#0d3b2e', fontWeight: 700, textDecoration: 'none' }}>Masuk di sini</Link>
          </p>
          <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 10, lineHeight: 1.7 }}>
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Kebijakan Privasi</Link> Findor.
          </p>
        </div>
      </div>
      <Styles />
    </div>
  );
}

// ── SHARED COMPONENTS ───────────────────────────────────────

function LeftPanel() {
  return (
    <div style={{
      flex: '0 0 44%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #0a2e20 0%, #0d3b2e 50%, #1a5c41 100%)',
    }}>
      {/* BG photo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.12,
      }} />

      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(64,145,108,0.2) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px' }}>

        {/* Logo */}
        <Link href="/">
          <img src="/logo_findor.jpg" alt="Findor" style={{ height: 44, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
        </Link>

        {/* Headline */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#f5a623', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            ✦ Platform Event Indonesia
          </p>
          <h2 style={{
            fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 900,
            color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20,
          }}>
            Wujudkan<br />
            <em style={{ fontStyle: 'italic', color: '#f5a623', fontWeight: 300 }}>Event Impian</em><br />
            Anda
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 280 }}>
            Temukan dan pesan vendor terpercaya untuk pernikahan, konser, seminar, dan semua jenis acara Anda.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: <Shield size={15} />, text: 'Vendor terverifikasi dengan KTP asli' },
            { icon: <Zap size={15} />, text: 'Booking dalam hitungan menit' },
            { icon: <Star size={15} />, text: 'Ribuan ulasan nyata dari pengguna' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f5a623',
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: '16px 20px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#f5a623" color="#f5a623" />)}
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', marginLeft: 6 }}>4.9/5</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
            "Findor sangat membantu! Saya bisa temukan vendor dekorasi impian dalam 10 menit."
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>— Rini A., Wedding Planner Jakarta</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7, letterSpacing: '0.01em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

function Spinner() {
  return <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,300&display=swap');
      @keyframes spin       { to { transform: rotate(360deg); } }
      @keyframes bounceIn   { 0%{opacity:0;transform:scale(0.6)} 60%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
      @keyframes ping       { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.5);opacity:0} }
      @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @media (max-width: 768px) {
        .left-panel { display: none !important; }
        .right-panel { padding: 24px 20px !important; }
      }
    `}</style>
  );
}

// ── SHARED STYLES ───────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
  display: 'flex', minHeight: '100vh',
  fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
};

const rightStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#f8fafc', padding: '40px 24px',
};

const cardStyle: React.CSSProperties = {
  width: '100%', maxWidth: 460,
  background: 'white', borderRadius: 24,
  padding: '44px 48px',
  boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
  animation: 'fadeUp 0.5s ease both',
};

function inputSt(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    fontSize: 14, border: `1.5px solid ${focused ? '#0d3b2e' : '#e2e8f0'}`,
    boxShadow: focused ? '0 0 0 3px rgba(13,59,46,0.08)' : 'none',
    outline: 'none', fontFamily: 'inherit', color: '#0f172a',
    background: '#fafafa', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
}