'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Phone, Mail, Shield, Store, CheckCircle2,
  Clock, XCircle, ChevronRight, ArrowRight, Save,
  Loader2, Upload, FileText, X, AlertCircle,
  Star, LayoutGrid, MapPin, Eye, EyeOff,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface VendorInfo {
  id: string;
  store_name: string;
  slug: string;
  category: string;
  city: string;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  review_count: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  vendor: VendorInfo | null;
}

const KATEGORI = [
  'Wedding Organizer', 'Sound System', 'Stage & Rigging',
  'Dekorasi & Florist', 'Catering', 'Dokumentasi',
  'Photography', 'Lighting Design', 'Hiburan & Musik',
  'MC & Host', 'Tenda & Venue', 'Transportasi',
  'Makeup & Salon', 'Undangan Digital',
];

const KOTA = [
  'Jakarta', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur',
  'Surabaya', 'Bandung', 'Yogyakarta', 'Bali', 'Denpasar', 'Malang',
  'Semarang', 'Medan', 'Makassar', 'Palembang', 'Tangerang',
  'Tangerang Selatan', 'Bekasi', 'Depok', 'Bogor', 'Sidoarjo',
  'Balikpapan', 'Manado', 'Batam', 'Pekanbaru', 'Lainnya',
];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function initials(name: string | null, email: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return email.charAt(0).toUpperCase();
}

function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  );
}

function SectionCard({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F3F9F5', display: 'grid', placeItems: 'center', color: '#1C3D2E', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: '20px 24px' }}>
        {children}
      </div>
    </div>
  );
}

function FieldGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7, letterSpacing: '0.01em' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: `1.5px solid ${focused ? '#1C3D2E' : '#E5E7EB'}`,
  boxShadow: focused ? '0 0 0 3px rgba(28,61,46,0.08)' : 'none',
  fontSize: 14, color: '#111827', background: '#FAFAFA',
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box' as const,
});

function FileUploadZone({ label, accept, file, onChange, hint }: {
  label: string; accept: string;
  file: File | null; onChange: (f: File) => void; hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else { setPreview(null); }
  }, [file]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</p>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => ref.current?.click()}
        style={{
          border: `2px dashed ${file ? '#1C3D2E' : '#D1D5DB'}`,
          borderRadius: 12, padding: '20px 16px',
          textAlign: 'center', cursor: 'pointer',
          background: file ? '#F3F9F5' : '#FAFAFA',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={ref} type="file" accept={accept}
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }}
        />
        {preview ? (
          <img src={preview} alt={label} style={{ maxHeight: 100, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
        ) : file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <FileText size={28} color="#1C3D2E" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1C3D2E' }}>{file.name}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Upload size={22} color="#9CA3AF" />
            <span style={{ fontSize: 13, color: '#6B7280' }}>Klik atau seret file</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{hint ?? 'Max 5MB'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function VendorStatusBanner({ vendor }: { vendor: VendorInfo }) {
  if (vendor.is_verified && vendor.is_active) {
    return (
      <div style={{
        background: 'linear-gradient(115deg, #1C3D2E 0%, #2D6A4F 100%)',
        borderRadius: 16, padding: '20px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Store size={22} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'white', fontFamily: 'Fraunces, serif' }}>{vendor.store_name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: '#86EFAC', borderRadius: 100, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={10} /> Terverifikasi
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>{vendor.category}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <MapPin size={11} /><span>{vendor.city}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <Star size={11} fill="#F5A623" color="#F5A623" />
              <span>{vendor.rating_avg.toFixed(1)} ({vendor.review_count} ulasan)</span>
            </div>
          </div>
        </div>
        <Link href="/vendor/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: '#F5A623', color: '#1C3D2E', fontWeight: 700, fontSize: 13,
          borderRadius: 100, padding: '10px 18px', textDecoration: 'none', flexShrink: 0,
        }}>
          Dashboard Vendor <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFBEB', border: '1px solid #FDE68A',
      borderRadius: 16, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF3C7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Clock size={20} color="#92400E" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 3 }}>Menunggu Verifikasi Admin</div>
        <div style={{ fontSize: 13, color: '#B45309' }}>
          Toko <strong>{vendor.store_name}</strong> sedang direview. Proses verifikasi maksimal 1×24 jam.
        </div>
      </div>
    </div>
  );
}

function VendorOnboardingForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const [form, setForm] = useState({
    store_name: '', category: '', description: '',
    whatsapp_number: '+62', city: '', address: '',
  });
  const [ktpFile,    setKtpFile]    = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const validateStep1 = () => {
    if (!form.store_name.trim() || form.store_name.length < 2) return 'Nama toko minimal 2 karakter.';
    if (!form.category) return 'Pilih kategori layanan.';
    if (!form.whatsapp_number.match(/^\+62\d{8,13}$/)) return 'Format WA: +62xxxxxxxxxx';
    if (!form.city) return 'Pilih kota.';
    return '';
  };

  const handleSubmit = async () => {
    if (!ktpFile) { setError('Upload foto KTP wajib.'); return; }
    if (!selfieFile) { setError('Upload selfie dengan KTP wajib.'); return; }
    setLoading(true); setError('');

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('ktp_file', ktpFile);
      fd.append('selfie_file', selfieFile);

      const res  = await fetch('/api/v1/vendors', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Gagal mendaftar.');
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally { setLoading(false); }
  };

  const STEPS = ['Info Toko', 'Dokumen'];

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done   = step > n;
          return (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', top: 16, left: '50%', right: '-50%', height: 2,
                  background: done ? '#1C3D2E' : '#E5E7EB', zIndex: 0,
                }} />
              )}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', zIndex: 1,
                background: done ? '#1C3D2E' : active ? '#1C3D2E' : '#F3F4F6',
                border: `2px solid ${active || done ? '#1C3D2E' : '#E5E7EB'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                color: active || done ? 'white' : '#9CA3AF',
              }}>
                {done ? <CheckCircle2 size={15} /> : n}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#1C3D2E' : '#9CA3AF', marginTop: 6 }}>{label}</span>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldGroup label="Nama Toko *">
            <input
              value={form.store_name}
              onChange={e => set('store_name', e.target.value)}
              onFocus={() => setFocused('store_name')}
              onBlur={() => setFocused(null)}
              placeholder="Contoh: Harmony Sound System"
              style={inputStyle(focused === 'store_name')}
            />
          </FieldGroup>

          <FieldGroup label="Kategori Utama *">
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              style={{ ...inputStyle(false), cursor: 'pointer' }}
            >
              <option value="">Pilih kategori...</option>
              {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label="Nomor WhatsApp Bisnis *" hint="Format: +62xxxxxxxxxx (contoh: +6281234567890)">
            <input
              value={form.whatsapp_number}
              onChange={e => set('whatsapp_number', e.target.value)}
              onFocus={() => setFocused('wa')}
              onBlur={() => setFocused(null)}
              placeholder="+62812345678"
              style={inputStyle(focused === 'wa')}
            />
          </FieldGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldGroup label="Kota *">
              <select
                value={form.city}
                onChange={e => set('city', e.target.value)}
                style={{ ...inputStyle(false), cursor: 'pointer' }}
              >
                <option value="">Pilih kota...</option>
                {KOTA.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Alamat Lengkap">
              <input
                value={form.address}
                onChange={e => set('address', e.target.value)}
                onFocus={() => setFocused('address')}
                onBlur={() => setFocused(null)}
                placeholder="Jl. Contoh No. 1"
                style={inputStyle(focused === 'address')}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Deskripsi Toko" hint="Opsional. Jelaskan layanan utama tokomu (maks 1000 karakter).">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Contoh: Kami menyediakan sound system profesional untuk berbagai skala acara..."
              style={{
                ...inputStyle(focused === 'desc'),
                resize: 'vertical',
              }}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
            />
          </FieldGroup>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}

          <button
            onClick={() => {
              const err = validateStep1();
              if (err) { setError(err); return; }
              setError(''); setStep(2);
            }}
            style={{
              width: '100%', padding: '13px', borderRadius: 100,
              background: '#1C3D2E', color: '#d8f3dc',
              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'inherit',
            }}
          >
            Lanjut ke Dokumen <ChevronRight size={15} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            borderRadius: 10, padding: '12px 14px',
            fontSize: 13, color: '#1E40AF', display: 'flex', gap: 8,
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              Dokumen diperlukan untuk verifikasi identitas pemilik usaha. Data kamu dijaga kerahasiaannya dan hanya dilihat oleh tim admin Findor.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FileUploadZone
              label="Foto KTP *"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              file={ktpFile}
              onChange={setKtpFile}
              hint="JPG, PNG, WEBP, PDF · Max 5MB"
            />
            <FileUploadZone
              label="Selfie + KTP *"
              accept="image/jpeg,image/png,image/webp"
              file={selfieFile}
              onChange={setSelfieFile}
              hint="JPG, PNG, WEBP · Max 5MB"
            />
          </div>

          <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
            Selfie adalah foto wajah kamu sambil memegang KTP. Pastikan wajah dan tulisan KTP terlihat jelas.
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={() => { setStep(1); setError(''); }}
              style={{
                flex: 1, padding: '13px', borderRadius: 100,
                border: '1.5px solid #E5E7EB', background: '#fff',
                fontSize: 14, fontWeight: 600, color: '#374151',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ← Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2, padding: '13px', borderRadius: 100,
                background: loading ? '#E5E7EB' : '#1C3D2E',
                color: loading ? '#9CA3AF' : '#d8f3dc',
                fontSize: 14, fontWeight: 700, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: 'inherit',
              }}
            >
              {loading
                ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Mendaftarkan...</>
                : <><Store size={14} /> Daftarkan Toko</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser]     = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [focused, setFocused]   = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res  = await fetch('/api/v1/auth/me');
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setFullName(data.data.full_name ?? '');
        setPhone(data.data.phone ?? '');
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true); setSaveMsg(null);
    try {
      const res  = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim() || undefined,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Gagal menyimpan.');
      setSaveMsg({ type: 'success', text: 'Profil berhasil diperbarui.' });
      setUser(prev => prev ? { ...prev, full_name: fullName.trim() || null, phone: phone.trim() || null } : prev);
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: unknown) {
      setSaveMsg({ type: 'error', text: e instanceof Error ? e.message : 'Terjadi kesalahan.' });
    } finally { setSaving(false); }
  };

  const isDirty = user && (fullName !== (user.full_name ?? '') || phone !== (user.phone ?? ''));

  const userInitials = user ? initials(user.full_name, user.email) : '?';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,300&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .section-animate { animation: fadeUp 0.45s ease both; }
      `}</style>

      <Navbar />

      <main style={{ minHeight: '100vh', background: '#F7F7F4', paddingTop: 100 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 80px' }}>
          <div className="section-animate" style={{ marginBottom: 28, paddingTop: 12 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 5px', fontFamily: 'Fraunces, serif', letterSpacing: '-0.5px' }}>
              Profil Saya
            </h1>
            <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>
              Kelola informasi akun dan toko vendormu
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB', padding: '24px', animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.08}s` }}>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                    <Skeleton w={38} h={38} r={10} />
                    <div style={{ flex: 1 }}><Skeleton w="50%" h={16} /><div style={{ marginTop: 6 }}><Skeleton w="30%" h={12} /></div></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Skeleton w="100%" h={46} r={10} />
                    <Skeleton w="100%" h={46} r={10} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="section-animate" style={{
                background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB',
                padding: '24px', display: 'flex', alignItems: 'center', gap: 20,
                flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1C3D2E 0%, #2D6A4F 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 800, color: 'white',
                  boxShadow: '0 4px 16px rgba(28,61,46,0.25)', flexShrink: 0,
                  fontFamily: 'Fraunces, serif',
                }}>
                  {userInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: 'Fraunces, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.full_name ?? 'Pengguna Findor'}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>{user?.email}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 9px',
                      borderRadius: 100,
                      background: user?.role === 'admin' ? '#F3E8FF' : user?.role === 'vendor' ? '#ECFDF5' : '#F3F4F6',
                      color: user?.role === 'admin' ? '#7C3AED' : user?.role === 'vendor' ? '#065F46' : '#374151',
                    }}>
                      {user?.role === 'admin' ? 'Admin' : user?.role === 'vendor' ? 'Vendor' : 'User'}
                    </span>
                  </div>
                  {user?.created_at && (
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
                      Bergabung sejak {formatDate(user.created_at)}
                    </p>
                  )}
                </div>
              </div>

              {user?.vendor && (
                <div className="section-animate" style={{ animationDelay: '0.05s' }}>
                  <VendorStatusBanner vendor={user.vendor} />
                </div>
              )}

              {onboardingDone && (
                <div style={{
                  background: '#ECFDF5', border: '1px solid #A7F3D0',
                  borderRadius: 16, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  animation: 'slideDown 0.4s ease both',
                }}>
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>Pendaftaran Berhasil Dikirim!</div>
                    <div style={{ fontSize: 13, color: '#047857' }}>Tim admin akan mereview dokumenmu dalam 1×24 jam. Setelah diverifikasi, toko kamu akan aktif.</div>
                  </div>
                </div>
              )}

              <div className="section-animate" style={{ animationDelay: '0.1s' }}>
                <SectionCard title="Informasi Pribadi" subtitle="Nama dan nomor telepon yang tampil ke vendor" icon={<User size={18} />}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FieldGroup label="Email">
                      <div style={{ position: 'relative' }}>
                        <Mail size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          value={user?.email ?? ''}
                          readOnly
                          style={{
                            ...inputStyle(false),
                            paddingLeft: 40,
                            background: '#F9FAFB',
                            color: '#9CA3AF',
                            cursor: 'not-allowed',
                          }}
                        />
                      </div>
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 5 }}>Email tidak bisa diubah.</p>
                    </FieldGroup>

                    <FieldGroup label="Nama Lengkap">
                      <div style={{ position: 'relative' }}>
                        <User size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          onFocus={() => setFocused('name')}
                          onBlur={() => setFocused(null)}
                          placeholder="Masukkan nama lengkap"
                          style={{ ...inputStyle(focused === 'name'), paddingLeft: 40 }}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Nomor Telepon" hint="Format: +62 atau 08...">
                      <div style={{ position: 'relative' }}>
                        <Phone size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          onFocus={() => setFocused('phone')}
                          onBlur={() => setFocused(null)}
                          placeholder="+628123456789"
                          style={{ ...inputStyle(focused === 'phone'), paddingLeft: 40 }}
                        />
                      </div>
                    </FieldGroup>

                    {saveMsg && (
                      <div style={{
                        background: saveMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                        border: `1px solid ${saveMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                        borderRadius: 10, padding: '11px 14px',
                        fontSize: 13, color: saveMsg.type === 'success' ? '#065F46' : '#DC2626',
                        display: 'flex', alignItems: 'center', gap: 8,
                        animation: 'slideDown 0.3s ease both',
                      }}>
                        {saveMsg.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {saveMsg.text}
                      </div>
                    )}

                    <button
                      onClick={handleSave}
                      disabled={!isDirty || saving}
                      style={{
                        alignSelf: 'flex-start',
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '11px 22px', borderRadius: 100,
                        background: !isDirty || saving ? '#F3F4F6' : '#1C3D2E',
                        color: !isDirty || saving ? '#9CA3AF' : '#d8f3dc',
                        fontSize: 14, fontWeight: 700, border: 'none',
                        cursor: !isDirty || saving ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.18s',
                      }}
                    >
                      {saving
                        ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Menyimpan...</>
                        : <><Save size={14} /> Simpan Perubahan</>
                      }
                    </button>
                  </div>
                </SectionCard>
              </div>

              <div className="section-animate" style={{ animationDelay: '0.15s' }}>
                <SectionCard title="Keamanan Akun" subtitle="Password dan keamanan login" icon={<Shield size={18} />}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: '#F3F4F6', display: 'grid', placeItems: 'center' }}>
                        <EyeOff size={16} color="#6B7280" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Password</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Terakhir diubah: tidak diketahui</div>
                      </div>
                    </div>
                    <button style={{
                      fontSize: 13, fontWeight: 600, color: '#1C3D2E',
                      background: '#F3F9F5', border: 'none', borderRadius: 100,
                      padding: '9px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <Eye size={13} /> Ubah Password
                    </button>
                  </div>
                </SectionCard>
              </div>

              {!user?.vendor && !onboardingDone && (
                <div className="section-animate" style={{ animationDelay: '0.2s' }}>
                  <SectionCard
                    title="Daftarkan Toko Vendor"
                    subtitle="Jangkau lebih banyak klien lewat platform Findor"
                    icon={<Store size={18} />}
                  >
                    {!showOnboarding ? (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                          {[
                            { icon: <LayoutGrid size={14} />, text: 'Etalase digital gratis' },
                            { icon: <Star size={14} />, text: 'Bangun reputasi via ulasan' },
                            { icon: <CheckCircle2 size={14} />, text: 'Badge vendor terverifikasi' },
                            { icon: <ArrowRight size={14} />, text: 'Kelola booking lebih mudah' },
                          ].map(b => (
                            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                              <div style={{ width: 26, height: 26, borderRadius: 7, background: '#F3F9F5', display: 'grid', placeItems: 'center', color: '#1C3D2E', flexShrink: 0 }}>
                                {b.icon}
                              </div>
                              {b.text}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowOnboarding(true)}
                          style={{
                            width: '100%', padding: '13px', borderRadius: 100,
                            background: '#1C3D2E', color: '#d8f3dc',
                            fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            fontFamily: 'inherit',
                          }}
                        >
                          <Store size={16} /> Daftarkan Layanan Saya
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                            Isi form berikut untuk mendaftarkan toko kamu.
                          </p>
                          <button onClick={() => setShowOnboarding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                            <X size={18} />
                          </button>
                        </div>
                        <VendorOnboardingForm
                          onSuccess={() => {
                            setShowOnboarding(false);
                            setOnboardingDone(true);
                            fetchProfile();
                          }}
                        />
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              <div className="section-animate" style={{ animationDelay: '0.25s' }}>
                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB', overflow: 'hidden' }}>
                  {[
                    { icon: <Receipt size={16} />, label: 'Transaksi Saya', sub: 'Lihat riwayat booking', href: '/bookings' },
                    { icon: <Heart size={16} />, label: 'Wishlist', sub: 'Vendor yang kamu simpan', href: '/bookmarks' },
                    ...(user?.vendor?.is_verified
                      ? [{ icon: <Store size={16} />, label: 'Dashboard Vendor', sub: 'Kelola toko dan booking', href: '/vendor/dashboard' }]
                      : []
                    ),
                  ].map((item, i, arr) => (
                    <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '15px 20px',
                          borderBottom: i < arr.length - 1 ? '1px solid #F9F9F7' : 'none',
                          transition: 'background 0.15s', cursor: 'pointer',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F9F9F7'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F3F9F5', display: 'grid', placeItems: 'center', color: '#1C3D2E', flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.label}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.sub}</div>
                        </div>
                        <ChevronRight size={15} color="#D1D5DB" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

import { Receipt, Heart } from 'lucide-react';