'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, CheckCircle, MapPin, Phone, ArrowRight, ArrowLeft,
  Heart, Share2, Calendar, ChevronLeft, ChevronRight,
  MessageCircle, Shield, Clock, Award, X, ChevronDown,
  AlertCircle, Loader2, Send, Image as ImageIcon,
} from 'lucide-react';
import Navbar from '@/components/navbar';

interface Service { id: string; name: string; category: string; description: string | null; price_min: number; price_max: number | null; unit: string | null; }
interface ReviewUser { id: string; full_name: string | null; avatar_url: string | null; }
interface Review { id: string; rating: number; comment: string | null; created_at: string; user: ReviewUser; }
interface Vendor {
  id: string; store_name: string; slug: string; category: string;
  description: string | null; whatsapp_number: string; city: string;
  address: string | null; latitude: number | null; longitude: number | null;
  is_verified: boolean; is_active: boolean; rating_avg: number; review_count: number;
  services: Service[]; reviews: Review[];
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function getMonthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfWeek(year: number, month: number) { return new Date(year, month, 1).getDay(); }

/* ── Avatar initials ── */
function Avatar({ name, size = 36 }: { name: string | null; size?: number }) {
  const initials = (name ?? 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = ['#0d3b2e', '#1a5c44', '#16a34a', '#15803d', '#166534'];
  const color = colors[(name ?? '').charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: size * 0.36, fontWeight: 700, color: 'white', letterSpacing: '0.03em' }}>
      {initials}
    </div>
  );
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#f97316' : 'none'} color={i <= Math.round(rating) ? '#f97316' : '#d1d5db'} />
      ))}
    </span>
  );
}

const GALLERY_IMGS = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=900&q=80',
];

function Gallery() {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef(0);
  const prev = () => setActive(p => (p - 1 + GALLERY_IMGS.length) % GALLERY_IMGS.length);
  const next = () => setActive(p => (p + 1) % GALLERY_IMGS.length);

  useEffect(() => {
    if (!lightbox) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); if (e.key === 'Escape') setLightbox(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox]);

  return (
    <>
      <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', background: '#111' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', cursor: 'zoom-in' }}
          onClick={() => setLightbox(true)}
          onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={e => { const dx = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(dx) > 50) dx > 0 ? next() : prev(); }}>
          <img src={GALLERY_IMGS[active]} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.25s' }} />
          <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0,0,0,0.55)', borderRadius: 999, padding: '5px 12px', backdropFilter: 'blur(6px)' }}>
            <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>{active + 1} / {GALLERY_IMGS.length}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.45)', borderRadius: 999, padding: '5px 12px', backdropFilter: 'blur(6px)' }}>
            <ImageIcon size={13} color="white" />
            <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>Portofolio</span>
          </div>
          {[{ dir: 'left', fn: prev }, { dir: 'right', fn: next }].map(({ dir, fn }) => (
            <button key={dir} onClick={e => { e.stopPropagation(); fn(); }}
              style={{ position: 'absolute', [dir]: 14, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'white' }}>
              {dir === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: '#0a0a0a', overflowX: 'auto' }}>
          {GALLERY_IMGS.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ flexShrink: 0, width: 72, height: 50, borderRadius: 8, overflow: 'hidden', border: i === active ? '2.5px solid #f5a623' : '2.5px solid transparent', padding: 0, cursor: 'pointer', transition: 'border-color 0.18s' }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={22} />
          </button>
          <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 52, height: 52, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'white' }}>
            <ChevronLeft size={26} />
          </button>
          <img src={GALLERY_IMGS[active]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 52, height: 52, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'white' }}>
            <ChevronRight size={26} />
          </button>
        </div>
      )}
    </>
  );
}

function AvailabilityCalendar({ vendorId }: { vendorId: string }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [availability, setAvailability] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchMonth = useCallback(async (d: Date) => {
    setLoading(true);
    try {
      const key = getMonthKey(d);
      const res = await fetch(`/api/v1/vendors/${vendorId}/availability?month=${key}`);
      const data = await res.json();
      if (data.success) setAvailability(data.data.availability ?? {});
    } catch { /* silent */ } finally { setLoading(false); }
  }, [vendorId]);

  useEffect(() => { fetchMonth(viewDate); }, [viewDate, fetchMonth]);

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function getStatus(day: number | null): 'past' | 'available' | 'full' | 'off' | 'empty' {
    if (!day) return 'empty';
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayStr = today.toISOString().slice(0, 10);
    if (dateStr <= todayStr) return 'past';
    const s = availability[dateStr];
    if (s === 'full') return 'full';
    if (s === 'off') return 'off';
    return 'available';
  }

  const STATUS_STYLE: Record<string, React.CSSProperties> = {
    past:      { color: '#d1d5db', cursor: 'default', background: 'transparent' },
    available: { color: '#0d3b2e', background: '#dcfce7', fontWeight: 600, cursor: 'default', borderRadius: 8 },
    full:      { color: '#dc2626', background: '#fee2e2', fontWeight: 600, cursor: 'default', borderRadius: 8, textDecoration: 'line-through' },
    off:       { color: '#6b7280', background: '#f3f4f6', fontWeight: 500, cursor: 'default', borderRadius: 8 },
    empty:     { background: 'transparent' },
  };

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={16} color="#374151" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading && <Loader2 size={13} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} />}
          {monthLabel}
        </span>
        <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <ChevronRight size={16} color="#374151" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, padding: '10px 12px 4px' }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, padding: '4px 12px 14px' }}>
        {cells.map((day, i) => {
          const status = getStatus(day);
          return (
            <div key={i} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, transition: 'all 0.15s', ...STATUS_STYLE[status] }}>
              {day ?? ''}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, padding: '10px 16px 14px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
        {[['#dcfce7', '#0d3b2e', 'Tersedia'], ['#fee2e2', '#dc2626', 'Penuh'], ['#f3f4f6', '#6b7280', 'Libur']].map(([bg, c, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: bg }} />
            <span style={{ fontSize: 12, color: c, fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function BookingModal({ vendor, service, onClose, onSuccess }: { vendor: Vendor; service: Service; onClose: () => void; onSuccess: () => void; }) {
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [setupTime, setSetupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  const handleSubmit = async () => {
    if (!eventName || !eventLocation || !eventDate) { setError('Nama event, lokasi, dan tanggal wajib diisi.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendor.id, service_id: service.id, event_date: eventDate, event_name: eventName, event_location: eventLocation, setup_time: setupTime || null, notes: notes || null }),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
      else setError(data.error ?? 'Terjadi kesalahan, coba lagi.');
    } catch { setError('Tidak dapat terhubung ke server.'); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', color: '#0f172a', background: '#fafafa', outline: 'none', transition: 'border-color 0.18s', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '22px 24px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>Buat Booking Request</p>
            <p style={{ fontSize: 13, color: '#64748b' }}>{service.name} · {vendor.store_name}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: 12 }}><X size={18} color="#374151" /></button>
        </div>

        <div style={{ margin: '18px 24px 0', padding: '12px 14px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: '#15803d', lineHeight: 1.5 }}>
            Booking ini bersifat <strong>konfirmasi setelah negosiasi</strong> via WhatsApp. Pastikan harga sudah disepakati sebelum submit.
          </p>
        </div>

        <div style={{ margin: '16px 24px 0', padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Layanan yang dipesan</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{service.name}</p>
          <p style={{ fontSize: 13, color: '#0d3b2e', fontWeight: 600 }}>
            {formatPrice(service.price_min)}{service.price_max ? ` – ${formatPrice(service.price_max)}` : ''}{service.unit ? ` / ${service.unit}` : ''}
          </p>
        </div>
=
        <div style={{ padding: '18px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', fontSize: 13, color: '#dc2626', display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Nama Event <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Contoh: Pernikahan Andi & Sari" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tanggal Event <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" value={eventDate} min={minDate} onChange={e => setEventDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Lokasi Event <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="Alamat lengkap lokasi acara" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Jam Setup <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opsional)</span></label>
              <input type="time" value={setupTime} onChange={e => setSetupTime(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Catatan Tambahan <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opsional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detail layout, kebutuhan listrik, dll." maxLength={500}
              style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.6 }} />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>{notes.length}/500</p>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: '14px 0', borderRadius: 12, background: loading ? '#9ca3af' : '#0d3b2e', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s', fontFamily: 'inherit' }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Mengirim...</> : <><Send size={16} /> Kirim Booking Request</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'layanan' | 'ulasan' | 'info'>('layanan');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/vendors/${id}`);
        const data = await res.json();
        if (data.success) setVendor(data.data.vendor);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleBookmark = async () => {
    if (!vendor || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const res = await fetch('/api/v1/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendor_id: vendor.id }) });
      const data = await res.json();
      if (data.success) setBookmarked(data.data.bookmarked);
      else if (res.status === 401) router.push(`/login?redirect=/vendor/${id}`);
    } catch { /* silent */ }
    finally { setBookmarkLoading(false); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!vendor) return;
    const phone = vendor.whatsapp_number.replace(/\D/g, '');
    const msg = encodeURIComponent(`Halo ${vendor.store_name}, saya menemukan profil Anda di Findor dan ingin menanyakan ketersediaan layanan Anda.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleBookNow = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 60px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: i === 0 ? 380 : 140, borderRadius: 16, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          ))}
        </div>
        <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      </main>
    );
  }

  if (!vendor) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Vendor tidak ditemukan</p>
          <Link href="/search" style={{ color: '#0d3b2e', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Kembali ke pencarian</Link>
        </div>
      </main>
    );
  }

  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: vendor.reviews.filter(r => Math.round(r.rating) === n).length,
    pct: vendor.reviews.length > 0 ? (vendor.reviews.filter(r => Math.round(r.rating) === n).length / vendor.reviews.length) * 100 : 0,
  }));

  return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Beranda</Link>
          <ChevronRight size={13} />
          <Link href="/search" style={{ color: '#94a3b8', textDecoration: 'none' }}>Vendor</Link>
          <ChevronRight size={13} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{vendor.store_name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }} className="vendor-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Gallery />
          <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {vendor.is_verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, letterSpacing: '0.05em' }}>
                      <CheckCircle size={11} /> TERVERIFIKASI
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0f9ff', color: '#0369a1', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                    <Award size={11} /> {vendor.category}
                  </span>
                </div>
                <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 10 }}>{vendor.store_name}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRating rating={vendor.rating_avg} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{Number(vendor.rating_avg).toFixed(1)}</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>({vendor.review_count} ulasan)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                    <MapPin size={13} color="#94a3b8" /> {vendor.city}
                    {vendor.address && <span> · {vendor.address}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={handleBookmark} disabled={bookmarkLoading}
                  style={{ width: 42, height: 42, borderRadius: '50%', border: `1.5px solid ${bookmarked ? '#ef4444' : '#e5e7eb'}`, background: bookmarked ? '#fef2f2' : 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Heart size={18} fill={bookmarked ? '#ef4444' : 'none'} color={bookmarked ? '#ef4444' : '#9ca3af'} />
                </button>
                <button onClick={handleShare}
                  style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: copied ? '#f0fdf4' : 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Share2 size={18} color={copied ? '#16a34a' : '#9ca3af'} />
                </button>
              </div>
            </div>
            {vendor.description && (
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.75, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                {vendor.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
              {[
                { Icon: Shield, label: 'Vendor Terverifikasi', sub: 'Dokumen terverifikasi' },
                { Icon: Clock, label: 'Respon Cepat', sub: 'Rata-rata < 2 jam' },
                { Icon: Award, label: 'Top Rated', sub: `${Number(vendor.rating_avg).toFixed(1)} bintang` },
              ].map(({ Icon, label, sub }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', flex: '1 1 160px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon size={16} color="#0d3b2e" />
                  </div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{label}</p>
                    <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
              {(['layanan', 'ulasan', 'info'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ flex: 1, padding: '16px 0', fontSize: 14, fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? '#0d3b2e' : '#9ca3af', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2.5px solid #0d3b2e' : '2.5px solid transparent', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.18s' }}>
                  {tab === 'layanan' ? `Layanan (${vendor.services.length})` : tab === 'ulasan' ? `Ulasan (${vendor.review_count})` : 'Informasi'}
                </button>
              ))}
            </div>

            <div style={{ padding: '24px 28px' }}>
              {activeTab === 'layanan' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {vendor.services.length === 0 ? (
                    <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>Belum ada layanan yang ditampilkan.</p>
                  ) : vendor.services.map(svc => {
                    const isExpanded = expandedService === svc.id;
                    return (
                      <div key={svc.id} style={{ borderRadius: 14, border: '1.5px solid #e5e7eb', overflow: 'hidden', transition: 'border-color 0.18s', ...(isExpanded ? { borderColor: '#0d3b2e' } : {}) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', background: isExpanded ? '#f0fdf4' : 'white', transition: 'background 0.18s' }}
                          onClick={() => setExpandedService(isExpanded ? null : svc.id)}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{svc.name}</p>
                            <p style={{ fontSize: 12, color: '#64748b' }}>{svc.category}{svc.unit ? ` · per ${svc.unit}` : ''}</p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: 16, fontWeight: 800, color: '#0d3b2e' }}>{formatPrice(svc.price_min)}</p>
                            {svc.price_max && <p style={{ fontSize: 12, color: '#94a3b8' }}>s/d {formatPrice(svc.price_max)}</p>}
                          </div>
                          <ChevronDown size={18} color="#9ca3af" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                        </div>
                        {isExpanded && (
                          <div style={{ padding: '0 18px 18px', borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
                            {svc.description && <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{svc.description}</p>}
                            <button onClick={() => handleBookNow(svc)}
                              style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: '#0d3b2e', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'background 0.2s' }}>
                              <Calendar size={15} /> Booking Layanan Ini
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'ulasan' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 28, padding: '20px 24px', background: '#f8fafc', borderRadius: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 52, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{Number(vendor.rating_avg).toFixed(1)}</span>
                      <StarRating rating={vendor.rating_avg} size={18} />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{vendor.review_count} ulasan</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {ratingDist.map(({ star, count, pct }) => (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#374151', width: 16, textAlign: 'right', fontWeight: 600 }}>{star}</span>
                          <Star size={12} fill="#f97316" color="#f97316" />
                          <div style={{ flex: 1, height: 7, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: pct > 0 ? '#f97316' : 'transparent', borderRadius: 999, transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', width: 22, textAlign: 'right' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {vendor.reviews.length === 0 ? (
                      <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Belum ada ulasan untuk vendor ini.</p>
                    ) : vendor.reviews.map(rev => (
                      <div key={rev.id} style={{ padding: '18px 20px', background: '#fafafa', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={rev.user?.full_name ?? null} size={36} />
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{rev.user?.full_name ?? 'Pengguna'}</p>
                              <p style={{ fontSize: 11.5, color: '#94a3b8' }}>{formatDate(rev.created_at)}</p>
                            </div>
                          </div>
                          <StarRating rating={rev.rating} size={13} />
                        </div>
                        {rev.comment && <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>{rev.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Nama Toko', value: vendor.store_name },
                    { label: 'Kategori', value: vendor.category },
                    { label: 'Kota', value: vendor.city },
                    { label: 'Alamat', value: vendor.address ?? '-' },
                    { label: 'Status', value: vendor.is_verified ? '✓ Terverifikasi' : 'Belum terverifikasi' },
                    { label: 'Total Ulasan', value: `${vendor.review_count} ulasan` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: 13.5, color: '#0f172a', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                    </div>
                  ))}
                  {vendor.latitude && vendor.longitude && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Peta Lokasi</p>
                      <a href={`https://www.google.com/maps?q=${vendor.latitude},${vendor.longitude}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: '#f0fdf4', borderRadius: 12, color: '#0d3b2e', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>
                        <MapPin size={15} /> Buka di Google Maps
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 90 }}>

          {/* CTA Card */}
          <div style={{ background: 'white', borderRadius: 20, padding: '24px 22px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>Mulai dari</p>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 800, color: '#0d3b2e', lineHeight: 1 }}>
                  {vendor.services.length > 0 ? formatPrice(Math.min(...vendor.services.map(s => s.price_min))) : 'Hubungi vendor'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff7ed', padding: '7px 12px', borderRadius: 999 }}>
                <Star size={14} fill="#f97316" color="#f97316" />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#ea580c' }}>{Number(vendor.rating_avg).toFixed(1)}</span>
              </div>
            </div>

            <button onClick={handleWhatsApp}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 0', borderRadius: 12, background: '#16a34a', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit', transition: 'background 0.2s' }}>
              <MessageCircle size={18} /> Hubungi via WhatsApp
            </button>

            <button onClick={() => { if (vendor.services.length > 0) { setSelectedService(vendor.services[0]); setShowBookingModal(true); } else setActiveTab('layanan'); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 0', borderRadius: 12, background: '#0d3b2e', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
              <Calendar size={18} /> Buat Booking Request
            </button>

            {bookingSuccess && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', fontSize: 13, color: '#15803d', display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckCircle size={15} /> Booking berhasil dikirim! Cek halaman <Link href="/bookings" style={{ color: '#0d3b2e', fontWeight: 700 }}>Bookings</Link>.
              </div>
            )}

            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
              Negosiasi harga dulu via WhatsApp, lalu konfirmasi booking di sini.
            </p>
          </div>

          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={15} color="#0d3b2e" /> Ketersediaan Tanggal
            </p>
            <AvailabilityCalendar vendorId={vendor.id} />
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px', border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Informasi Cepat</p>
            {[
              { Icon: MapPin, label: vendor.city },
              { Icon: Star, label: `${Number(vendor.rating_avg).toFixed(1)} / 5.0 · ${vendor.review_count} ulasan` },
              { Icon: Shield, label: vendor.is_verified ? 'Terverifikasi Findor' : 'Dalam proses verifikasi' },
              { Icon: Phone, label: vendor.whatsapp_number },
            ].map(({ Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Icon size={14} color="#0d3b2e" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showBookingModal && selectedService && (
        <BookingModal
          vendor={vendor}
          service={selectedService}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => setBookingSuccess(true)}
        />
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .vendor-layout { grid-template-columns: 1fr 380px; }
        @media (max-width: 1024px) {
          .vendor-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}