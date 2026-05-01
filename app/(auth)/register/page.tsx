'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, CheckCircle, User } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.full_name.trim() && form.email && form.password.length >= 8 && form.password === form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, full_name: form.full_name }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error ?? 'Gagal membuat akun.'); return; }
      setStep('done');
    } catch { setError('Terjadi kesalahan. Coba lagi.'); }
    finally { setLoading(false); }
  };

  if (step === 'done') return (
    <main style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 440, background: 'white', borderRadius: 24, padding: '56px 48px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={36} color="var(--verified-green)" />
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.5px' }}>Akun Berhasil Dibuat!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 6 }}>
            Selamat datang di Findor, <strong>{form.full_name}</strong>!
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
            Cek email kamu untuk verifikasi akun, lalu mulai jelajahi vendor premium.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-primary">Masuk Sekarang</Link>
            <Link href="/search" className="btn-secondary">Jelajahi Vendor</Link>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero/wedding.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.07 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(13,59,46,0.7) 0%, rgba(13,59,46,0.98) 100%)' }} />
      <div style={{ position: 'absolute', top: -140, right: -140, width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 340, height: 340, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: 24, padding: '44px 48px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link href="/"><img src="/logo.png" alt="Findor" style={{ height: 36, width: 'auto', objectFit: 'contain' }} /></Link>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#dbeafe', borderRadius: 999, padding: '5px 14px', marginBottom: 14 }}>
              <User size={13} color="#1d4ed8" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>Daftar sebagai Pengguna</span>
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>Buat Akun Baru</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Bergabung dengan komunitas Findor</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '11px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Nama Lengkap *</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                placeholder="Nama lengkap Anda" required
                style={{ ...inputStyle, borderColor: focused === 'name' ? 'var(--forest)' : '#e5e7eb', boxShadow: focused === 'name' ? '0 0 0 4px rgba(13,59,46,0.08)' : 'none' }} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="email@contoh.com" required
                style={{ ...inputStyle, borderColor: focused === 'email' ? 'var(--forest)' : '#e5e7eb', boxShadow: focused === 'email' ? '0 0 0 4px rgba(13,59,46,0.08)' : 'none' }} />
            </div>
            <div>
              <label style={labelStyle}>Password * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>min. 8 karakter</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                  placeholder="Buat password" required
                  style={{ ...inputStyle, paddingRight: 44, borderColor: focused === 'pass' ? 'var(--forest)' : '#e5e7eb', boxShadow: focused === 'pass' ? '0 0 0 4px rgba(13,59,46,0.08)' : 'none' }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {[8, 12, 16].map((threshold, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: form.password.length >= threshold ? (i === 0 ? '#f97316' : i === 1 ? '#f5a623' : '#16a34a') : '#e5e7eb', transition: 'background 0.3s' }} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Konfirmasi Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  placeholder="Ulangi password" required
                  style={{ ...inputStyle, paddingRight: 44, borderColor: form.confirm && form.confirm !== form.password ? '#fca5a5' : focused === 'confirm' ? 'var(--forest)' : '#e5e7eb' }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Password tidak cocok</p>
              )}
            </div>

            <button type="submit" disabled={!canSubmit || loading}
              style={{ marginTop: 4, width: '100%', padding: '14px', borderRadius: 999, background: canSubmit && !loading ? 'var(--forest)' : '#e5e7eb', color: canSubmit && !loading ? 'white' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: canSubmit && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: canSubmit && !loading ? '0 4px 20px rgba(13,59,46,0.25)' : 'none' }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Membuat akun...</>
                : <>Buat Akun <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: 'var(--forest)', fontWeight: 700, textDecoration: 'none' }}>Masuk di sini</Link>
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, lineHeight: 1.7 }}>
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/how-it-works" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>Syarat & Ketentuan</Link>{' '}
            dan{' '}
            <Link href="/how-it-works" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>Kebijakan Privasi</Link> Findor.
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em', display: 'block', marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14, border: '1.5px solid #e5e7eb', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)', background: '#fafafa', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };