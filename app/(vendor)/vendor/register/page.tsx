'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store, MapPin, Phone, FileText, Upload, CheckCircle2,
  ArrowRight, ArrowLeft, X, AlertCircle, Camera, IdCard,
  ChevronRight, Shield, Star, Users, Sparkles, Image,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const CATEGORIES = [
  'Sound System', 'Stage & Rigging', 'Dekorasi & Florist', 'Catering',
  'Dokumentasi', 'Photography', 'Lighting Design', 'Hiburan & Musik',
  'MC & Host', 'Tenda & Venue', 'Transportasi', 'Makeup & Salon',
  'Wedding Organizer', 'Undangan Digital', 'Lainnya',
];

const KOTA = [
  'Jakarta', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Pusat',
  'Surabaya', 'Bandung', 'Yogyakarta', 'Bali', 'Denpasar', 'Malang', 'Semarang',
  'Medan', 'Makassar', 'Palembang', 'Tangerang', 'Tangerang Selatan',
  'Bekasi', 'Depok', 'Bogor', 'Solo', 'Balikpapan', 'Samarinda',
  'Manado', 'Padang', 'Pekanbaru', 'Banjarmasin', 'Pontianak', 'Lainnya',
];

const STEPS = [
  { num: 1, label: 'Info Toko' },
  { num: 2, label: 'Dokumen' },
  { num: 3, label: 'Konfirmasi' },
];

const BENEFITS = [
  { icon: <Users size={18} />, text: 'Akses ke ribuan klien premium di seluruh Indonesia' },
  { icon: <Shield size={18} />, text: 'Badge "Vendor Terverifikasi" meningkatkan kepercayaan klien' },
  { icon: <Star size={18} />, text: 'Tampil di hasil pencarian dengan rating & ulasan nyata' },
  { icon: <Sparkles size={18} />, text: 'Dashboard manajemen booking & layanan lengkap' },
];

interface FormData {
  store_name: string;
  category: string;
  description: string;
  whatsapp_number: string;
  city: string;
  address: string;
}

const EMPTY_FORM: FormData = {
  store_name: '',
  category: '',
  description: '',
  whatsapp_number: '+62',
  city: '',
  address: '',
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUploadZone({
  label, hint, accept, maxMB, file, onFile, onClear, error, icon,
}: {
  label: string; hint: string; accept: string; maxMB: number;
  file: File | null; onFile: (f: File) => void; onClear: () => void;
  error?: string; icon: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
        {label} *
      </label>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>{hint}</p>

      {file ? (
        <div style={{ borderRadius: 14, border: '1.5px solid #a7f3d0', background: '#f0fdf4', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {preview ? (
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid #bbf7d0' }}>
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={22} color="#16a34a" />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                {file.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={11} /> File dipilih
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatFileSize(file.size)}</span>
              </div>
            </div>
            <button onClick={onClear}
              style={{ width: 30, height: 30, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            borderRadius: 14, border: `2px dashed ${error ? '#fca5a5' : dragging ? 'var(--forest)' : '#d1d5db'}`,
            background: dragging ? '#f0fdf4' : error ? '#fff5f5' : '#fafafa',
            padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: dragging ? '#dcfce7' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: dragging ? 'var(--forest)' : 'var(--text-muted)' }}>
            {icon}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Klik untuk upload atau drag & drop
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {accept.replace('image/jpeg,image/png,image/webp,application/pdf', 'JPG, PNG, WebP, PDF')} · Maks {maxMB}MB
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
      {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{error}</p>}
    </div>
  );
}

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {STEPS.map((s, i) => {
        const done = current > s.num;
        const active = current === s.num;
        return (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? '#16a34a' : active ? 'var(--forest)' : 'var(--gray-200)',
                color: done || active ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, transition: 'all 0.3s',
                boxShadow: active ? '0 0 0 4px rgba(13,59,46,0.15)' : 'none',
              }}>
                {done ? <CheckCircle2 size={18} /> : s.num}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? 'var(--forest)' : done ? '#16a34a' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 80, height: 2, background: done ? '#16a34a' : 'var(--gray-200)', margin: '0 8px', marginBottom: 22, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<FormData & { ktp: string; selfie: string; general: string }>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/me').then(r => r.json()).then(d => {
      if (!d.success) { setIsLoggedIn(false); return; }
      if (d.data.vendor) { router.replace('/vendor/dashboard'); return; }
      setIsLoggedIn(true);
    }).catch(() => setIsLoggedIn(false));
  }, [router]);

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const inputStyle = (field: keyof FormData): React.CSSProperties => ({
    width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14,
    border: `1.5px solid ${errors[field] ? '#fca5a5' : focused === field ? 'var(--forest)' : '#e5e7eb'}`,
    outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)',
    background: '#fafafa', boxSizing: 'border-box',
    boxShadow: focused === field && !errors[field] ? '0 0 0 3px rgba(13,59,46,0.08)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.store_name.trim() || form.store_name.trim().length < 2)
      e.store_name = 'Nama toko minimal 2 karakter';
    if (!form.category) e.category = 'Kategori wajib dipilih';
    if (!form.whatsapp_number || !/^\+62\d{8,13}$/.test(form.whatsapp_number))
      e.whatsapp_number = 'Format: +62xxxxxxxxxx (min. 8 digit setelah +62)';
    if (!form.city) e.city = 'Kota wajib dipilih';
    return e;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!ktpFile) e.ktp = 'File KTP wajib diupload';
    else if (ktpFile.size > 5 * 1024 * 1024) e.ktp = 'Ukuran file KTP maks 5MB';
    if (!selfieFile) e.selfie = 'Foto selfie wajib diupload';
    else if (selfieFile.size > 5 * 1024 * 1024) e.selfie = 'Ukuran file selfie maks 5MB';
    return e;
  };

  const handleNext = () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const fd = new FormData();
      fd.append('store_name', form.store_name.trim());
      fd.append('category', form.category);
      fd.append('whatsapp_number', form.whatsapp_number);
      fd.append('city', form.city);
      if (form.description.trim()) fd.append('description', form.description.trim());
      if (form.address.trim()) fd.append('address', form.address.trim());
      fd.append('ktp_file', ktpFile!);
      fd.append('selfie_file', selfieFile!);

      const res = await fetch('/api/v1/vendors', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.success) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrors({ general: data.error ?? 'Gagal mendaftar. Coba lagi.' });
      }
    } catch {
      setErrors({ general: 'Terjadi kesalahan. Periksa koneksi dan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)', padding: '40px 24px' }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 0 12px rgba(22,163,74,0.08)' }}>
              <CheckCircle2 size={40} color="#16a34a" />
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.5px' }}>
              Pendaftaran Berhasil!
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 8 }}>
              Toko <strong>{form.store_name}</strong> sedang dalam proses verifikasi oleh tim Findor.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 32 }}>
              Proses verifikasi memakan waktu <strong>1–2 hari kerja</strong>. Kami akan menghubungi kamu via WhatsApp ke nomor <strong>{form.whatsapp_number}</strong> setelah disetujui.
            </p>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>Sambil menunggu verifikasi, kamu bisa:</div>
              <ul style={{ fontSize: 13, color: '#78350f', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>Siapkan foto portofolio terbaik kamu</li>
                <li>Buat daftar paket layanan dan harga</li>
                <li>Pastikan nomor WhatsApp aktif dan bisa dihubungi</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/vendor/dashboard" className="btn-forest" style={{ display: 'inline-flex' }}>
                Ke Dashboard Vendor <ArrowRight size={16} />
              </Link>
              <Link href="/" className="btn-secondary" style={{ display: 'inline-flex', borderColor: 'var(--gray-300)', color: 'var(--text-secondary)' }}>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isLoggedIn === false) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)', padding: '40px 24px' }}>
          <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', background: 'white', borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Store size={24} color="#1d4ed8" />
            </div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Login Dulu, Yuk!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
              Kamu perlu login atau buat akun terlebih dahulu sebelum mendaftarkan toko vendor.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href={`/login?redirect=/vendor/register`} className="btn-forest" style={{ display: 'flex', justifyContent: 'center' }}>
                Masuk ke Akun <ArrowRight size={16} />
              </Link>
              <Link href={`/register?redirect=/vendor/register`} style={{ display: 'flex', justifyContent: 'center', padding: '12px', borderRadius: 12, border: '1.5px solid var(--gray-200)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Buat Akun Baru
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isLoggedIn === null) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--gray-200)', borderTopColor: 'var(--forest)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <section style={{ position: 'relative', background: 'var(--forest)', padding: '48px 24px 56px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 14px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.15)' }}>
            <Store size={13} color="var(--amber)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.06em' }}>DAFTAR VENDOR</span>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: 'white', marginBottom: 12, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            Kembangkan Bisnis Event<br />
            <em style={{ fontStyle: 'italic', color: 'var(--amber)', fontWeight: 300 }}>Bersama Findor</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto' }}>
            Daftarkan layanan event kamu dan dapatkan akses ke ribuan klien premium.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }} className="register-grid">
        <div>
          <StepBar current={step} />

          <div style={{ background: 'white', borderRadius: 20, padding: '32px 36px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)' }} className="form-card">

            {errors.general && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={15} /> {errors.general}
              </div>
            )}

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Informasi Toko</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Isi informasi dasar toko vendor kamu.</p>
                </div>

                <div>
                  <label style={labelStyle}>Nama Toko *</label>
                  <input value={form.store_name} onChange={e => set('store_name', e.target.value)}
                    onFocus={() => setFocused('store_name')} onBlur={() => setFocused(null)}
                    placeholder="Cth: Melody Aura Sound" style={inputStyle('store_name')} />
                  {errors.store_name && <p style={errStyle}>{errors.store_name}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Kategori Utama *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    onFocus={() => setFocused('category')} onBlur={() => setFocused(null)}
                    style={{ ...inputStyle('category'), appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Pilih kategori layanan utama</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p style={errStyle}>{errors.category}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Nomor WhatsApp Toko *</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
                      <Phone size={14} color="var(--text-muted)" />
                    </div>
                    <input value={form.whatsapp_number}
                      onChange={e => {
                        let val = e.target.value;
                        if (!val.startsWith('+62')) val = '+62';
                        set('whatsapp_number', val);
                      }}
                      onFocus={() => setFocused('whatsapp_number')} onBlur={() => setFocused(null)}
                      placeholder="+6281234567890" inputMode="tel"
                      style={{ ...inputStyle('whatsapp_number'), paddingLeft: 40 }} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Format: +62 diikuti nomor tanpa 0. Cth: +6281234567890</p>
                  {errors.whatsapp_number && <p style={errStyle}>{errors.whatsapp_number}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Kota Operasional *</label>
                  <select value={form.city} onChange={e => set('city', e.target.value)}
                    onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
                    style={{ ...inputStyle('city'), appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Pilih kota</option>
                    {KOTA.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  {errors.city && <p style={errStyle}>{errors.city}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Alamat Lengkap <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>opsional</span></label>
                  <textarea value={form.address} onChange={e => set('address', e.target.value)}
                    onFocus={() => setFocused('address')} onBlur={() => setFocused(null)}
                    placeholder="Jl. Sudirman No. 1, Jakarta Selatan..."
                    rows={2} maxLength={300}
                    style={{ ...inputStyle('address'), resize: 'none', lineHeight: 1.6 }} />
                </div>

                <div>
                  <label style={labelStyle}>Deskripsi Toko <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>opsional · maks 1000 karakter</span></label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    onFocus={() => setFocused('description')} onBlur={() => setFocused(null)}
                    placeholder="Ceritakan tentang toko kamu: pengalaman, spesialisasi, jangkauan wilayah, dan keunggulan dibanding kompetitor..."
                    rows={4} maxLength={1000}
                    style={{ ...inputStyle('description'), resize: 'vertical', lineHeight: 1.6 }} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>{form.description.length}/1000</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Upload Dokumen Verifikasi</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Dokumen ini digunakan untuk verifikasi identitas dan keamanan klien. Tidak akan ditampilkan ke publik.
                  </p>
                </div>

                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Shield size={16} color="#0369a1" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 12, color: '#0c4a6e', lineHeight: 1.6 }}>
                    <strong>Dokumen aman & privat.</strong> KTP dan selfie kamu hanya dilihat oleh tim verifikasi Findor dan tidak pernah dipublikasikan.
                  </div>
                </div>

                <FileUploadZone
                  label="Foto KTP (Kartu Tanda Penduduk)"
                  hint="Upload foto KTP yang jelas, tidak buram, dan semua teks terbaca. Pastikan foto tidak gelap atau terpotong."
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  maxMB={5}
                  file={ktpFile}
                  onFile={setKtpFile}
                  onClear={() => setKtpFile(null)}
                  error={errors.ktp}
                  icon={<IdCard size={22} />}
                />

                <FileUploadZone
                  label="Foto Selfie dengan KTP"
                  hint="Foto wajah kamu sambil memegang KTP di samping wajah. Pastikan keduanya terlihat jelas dalam satu frame."
                  accept="image/jpeg,image/png,image/webp"
                  maxMB={5}
                  file={selfieFile}
                  onFile={setSelfieFile}
                  onClear={() => setSelfieFile(null)}
                  error={errors.selfie}
                  icon={<Camera size={22} />}
                />
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Konfirmasi Pendaftaran</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Periksa kembali data kamu sebelum submit.</p>
                </div>

                <div style={{ background: 'var(--gray-50)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Info Toko</div>
                  <Row label="Nama Toko" value={form.store_name} />
                  <Row label="Kategori" value={form.category} />
                  <Row label="WhatsApp" value={form.whatsapp_number} />
                  <Row label="Kota" value={form.city} />
                  {form.address && <Row label="Alamat" value={form.address} />}
                  {form.description && (
                    <div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Deskripsi</span>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{form.description.slice(0, 150)}{form.description.length > 150 ? '...' : ''}</span>
                    </div>
                  )}
                </div>

                <div style={{ background: 'var(--gray-50)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Dokumen</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span style={{ color: 'var(--text-secondary)' }}>KTP: <strong>{ktpFile?.name}</strong> ({formatFileSize(ktpFile?.size ?? 0)})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span style={{ color: 'var(--text-secondary)' }}>Selfie: <strong>{selfieFile?.name}</strong> ({formatFileSize(selfieFile?.size ?? 0)})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--forest)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={13} /> Edit info toko
                  </button>
                  <span style={{ color: 'var(--gray-200)' }}>·</span>
                  <button onClick={() => setStep(2)} style={{ fontSize: 12, color: 'var(--forest)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={13} /> Ganti dokumen
                  </button>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#92400e', lineHeight: 1.65 }}>
                  Dengan mendaftar, kamu menyetujui <Link href="/how-it-works" style={{ color: 'var(--forest)', fontWeight: 600 }}>Syarat & Ketentuan Vendor</Link> Findor. Tim kami akan menghubungi kamu dalam 1–2 hari kerja setelah verifikasi dokumen selesai.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'space-between' }}>
              {step > 1 ? (
                <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 20px', borderRadius: 12, border: '1.5px solid var(--gray-200)', background: 'white', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <ArrowLeft size={16} /> Kembali
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button onClick={handleNext}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: 'none', background: 'var(--forest)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(13,59,46,0.2)' }}>
                  Lanjutkan <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: 'none', background: loading ? '#e5e7eb' : 'var(--forest)', color: loading ? 'var(--text-muted)' : 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 14px rgba(13,59,46,0.2)', transition: 'all 0.2s' }}>
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Mendaftarkan...</>
                    : <><CheckCircle2 size={16} /> Daftarkan Toko</>}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="info-sidebar">
          <div style={{ background: 'white', borderRadius: 18, padding: '24px', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={18} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Keuntungan Bergabung</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Kenapa vendor pilih Findor</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BENEFITS.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                    {b.icon}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--forest)', borderRadius: 18, padding: '22px', color: 'white' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Shield size={15} color="var(--amber)" /> Proses Verifikasi
            </div>
            {[
              { n: '1', text: 'Submit formulir & dokumen' },
              { n: '2', text: 'Review dokumen oleh tim Findor' },
              { n: '3', text: 'Konfirmasi via WhatsApp (1–2 hari kerja)' },
              { n: '4', text: 'Toko aktif & mulai terima booking!' },
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--forest)', flexShrink: 0, marginTop: 1 }}>
                  {item.n}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 18, padding: '20px 22px', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { n: '2.400+', label: 'Vendor aktif' },
              { n: '18.000+', label: 'Event sukses' },
              { n: '4.8 ★', label: 'Avg rating' },
              { n: '34 kota', label: 'Jangkauan' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--forest)', letterSpacing: '-0.5px' }}>{s.n}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .register-grid { grid-template-columns: 1fr !important; }
          .info-sidebar { order: -1; }
        }
        @media (max-width: 600px) {
          .form-card { padding: 24px 20px !important; }
        }
      `}</style>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, flex: 1 }}>{value}</span>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 };
const errStyle: React.CSSProperties = { fontSize: 11, color: '#ef4444', marginTop: 5 };