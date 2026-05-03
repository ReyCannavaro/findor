'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, MapPin, Star, CheckCircle, ArrowRight, X,
  ChevronDown, SlidersHorizontal, Navigation,
  Music2, Volume2, Construction, Flower2, UtensilsCrossed,
  Clapperboard, Camera, Lightbulb, Mic2, Tent, Car,
  Sparkles, Mail, LayoutGrid, Heart, Award, Loader2,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const KOTA = [
  'Semua Kota',
  'Jakarta', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur',
  'Surabaya', 'Bandung', 'Yogyakarta', 'Bali', 'Denpasar',
  'Malang', 'Semarang', 'Medan', 'Makassar', 'Palembang',
  'Tangerang', 'Tangerang Selatan', 'Bekasi', 'Depok', 'Bogor',
  'Sidoarjo', 'Balikpapan', 'Manado', 'Batam', 'Pekanbaru',
];

const KATEGORI = [
  { label: 'Semua Kategori', Icon: LayoutGrid },
  { label: 'Wedding Organizer', Icon: Heart },
  { label: 'Sound System', Icon: Volume2 },
  { label: 'Stage & Rigging', Icon: Construction },
  { label: 'Dekorasi & Florist', Icon: Flower2 },
  { label: 'Catering', Icon: UtensilsCrossed },
  { label: 'Dokumentasi', Icon: Clapperboard },
  { label: 'Photography', Icon: Camera },
  { label: 'Lighting Design', Icon: Lightbulb },
  { label: 'Hiburan & Musik', Icon: Music2 },
  { label: 'MC & Host', Icon: Mic2 },
  { label: 'Tenda & Venue', Icon: Tent },
  { label: 'Transportasi', Icon: Car },
  { label: 'Makeup & Salon', Icon: Sparkles },
  { label: 'Undangan Digital', Icon: Mail },
];

interface ServiceInfo {
  id: string; name: string; category: string;
  price_min: number; price_max: number | null; unit: string | null;
}

interface Vendor {
  id: string;
  store_name: string;
  slug: string;
  category: string;
  description: string | null;
  city: string;
  rating_avg: number;
  review_count: number;
  is_verified: boolean;
  services: ServiceInfo[];
}

function formatHarga(services: ServiceInfo[]): string {
  if (!services || services.length === 0) return 'Hubungi vendor';
  const minPrice = Math.min(...services.map(s => s.price_min));
  if (minPrice >= 1_000_000) return `Rp ${(minPrice / 1_000_000).toFixed(0)}jt`;
  if (minPrice >= 1_000) return `Rp ${(minPrice / 1_000).toFixed(0)}rb`;
  return `Rp ${minPrice.toLocaleString('id-ID')}`;
}

const AVATAR_COLORS = ['#1C3D2E','#2D6A4F','#40916C','#1B4332','#0D3B2E'];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function CustomDropdown({ value, onChange, options, icon: TriggerIcon }: {
  value: string; onChange: (v: string) => void;
  options: { label: string; Icon?: React.ComponentType<{ size?: number; color?: string }> }[];
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find(o => o.label === value);
  const SelectedIcon = selected?.Icon;

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <button onClick={() => setOpen(p => !p)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, border: open ? '1.5px solid #0d3b2e' : '1.5px solid #e5e7eb', background: open ? '#f0fdf4' : 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: '#111827', transition: 'all 0.18s', textAlign: 'left', boxShadow: open ? '0 0 0 3px rgba(13,59,46,0.08)' : '0 1px 4px rgba(0,0,0,0.06)' }}>
        <TriggerIcon size={15} color={open ? '#0d3b2e' : '#9ca3af'} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: value === options[0].label ? '#9ca3af' : '#111827' }}>
          {SelectedIcon ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><SelectedIcon size={14} color="#0d3b2e" /> {value}</span> : value}
        </span>
        <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%', minWidth: 220, background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {options.map((opt, i) => {
              const OptIcon = opt.Icon;
              const isActive = opt.label === value;
              return (
                <button key={opt.label} onClick={() => { onChange(opt.label); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: isActive ? '#f0fdf4' : 'transparent', border: 'none', borderBottom: i < options.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? '#0d3b2e' : '#374151', textAlign: 'left' }}>
                  {OptIcon && <OptIcon size={15} color={isActive ? '#0d3b2e' : '#9ca3af'} />}
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {isActive && <CheckCircle size={14} color="#0d3b2e" fill="#0d3b2e" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KotaDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleDekatSaya = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      () => { onChange('Sidoarjo'); setLocLoading(false); setOpen(false); },
      () => setLocLoading(false)
    );
  };

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <button onClick={() => setOpen(p => !p)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, border: open ? '1.5px solid #0d3b2e' : '1.5px solid #e5e7eb', background: open ? '#f0fdf4' : 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: '#111827', transition: 'all 0.18s', textAlign: 'left', boxShadow: open ? '0 0 0 3px rgba(13,59,46,0.08)' : '0 1px 4px rgba(0,0,0,0.06)' }}>
        <MapPin size={15} color={open ? '#0d3b2e' : '#9ca3af'} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: value === 'Semua Kota' ? '#9ca3af' : '#111827' }}>{value}</span>
        <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%', minWidth: 240, background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
          <button onClick={handleDekatSaya} disabled={locLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f0fdf4', border: 'none', borderBottom: '1.5px solid #e5e7eb', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, color: '#0d3b2e', textAlign: 'left' }}>
            <Navigation size={15} color="#0d3b2e" />
            {locLoading ? 'Mendeteksi lokasi...' : 'Gunakan Lokasi Saya'}
          </button>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {KOTA.map((kota, i) => {
              const isActive = kota === value;
              return (
                <button key={kota} onClick={() => { onChange(kota); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 14px', background: isActive ? '#f0fdf4' : 'transparent', border: 'none', borderBottom: i < KOTA.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? '#0d3b2e' : '#374151', textAlign: 'left' }}>
                  {kota}
                  {isActive && <CheckCircle size={13} color="#0d3b2e" fill="#0d3b2e" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function VendorCard({ v, isHighlighting, idx }: { v: Vendor; isHighlighting: boolean; idx: number }) {
  return (
    <Link href={`/vendor/${v.slug}`} style={{ textDecoration: 'none' }}>
      <div
        className={`browse-card${isHighlighting ? ' card-pop' : ''}`}
        style={{ animationDelay: isHighlighting ? `${idx * 60}ms` : '0ms' }}
      >
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: avatarColor(v.store_name) }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.25)',
            fontFamily: 'Fraunces, serif',
          }}>
            {v.store_name[0].toUpperCase()}
          </div>

          {v.is_verified && (
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '4px 10px', backdropFilter: 'blur(6px)', zIndex: 2 }}>
              <CheckCircle size={11} color="#16a34a" fill="#16a34a" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>TERVERIFIKASI</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '4px 10px', backdropFilter: 'blur(6px)', zIndex: 2 }}>
            <Star size={11} fill="#f97316" color="#f97316" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
              {v.rating_avg > 0 ? v.rating_avg.toFixed(1) : '—'}
            </span>
            {v.review_count > 0 && <span style={{ fontSize: 11, color: '#6b7280' }}>({v.review_count})</span>}
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(13,59,46,0.88)', borderRadius: 999, padding: '4px 12px', zIndex: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{v.category}</span>
          </div>
        </div>

        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 5, lineHeight: 1.3 }}>{v.store_name}</p>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {v.description ?? `${v.category} profesional di ${v.city}`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <MapPin size={12} color="#94a3b8" />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{v.city}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Mulai dari</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0d3b2e' }}>{formatHarga(v.services)}</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0d3b2e', display: 'flex', alignItems: 'center', gap: 4 }}>
              Lihat Portfolio <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 18, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
      <div style={{ height: 200, background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 18, width: '70%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 13, width: '100%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 13, width: '60%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ height: 20, width: 80, borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ height: 20, width: 100, borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [pendingQuery,    setPendingQuery]    = useState(searchParams.get('q') ?? '');
  const [pendingKota,     setPendingKota]     = useState(searchParams.get('city') ?? 'Semua Kota');
  const [pendingKategori, setPendingKategori] = useState(searchParams.get('category') ?? 'Semua Kategori');
  const [pendingKategoriPill, setPendingKategoriPill] = useState(searchParams.get('category') ?? 'Semua Kategori');
  const [appliedQuery,    setAppliedQuery]    = useState(searchParams.get('q') ?? '');
  const [appliedKota,     setAppliedKota]     = useState(searchParams.get('city') ?? 'Semua Kota');
  const [appliedKategori, setAppliedKategori] = useState(searchParams.get('category') ?? 'Semua Kategori');
  const [vendors,    setVendors]    = useState<Vendor[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [isHighlighting, setIsHighlighting] = useState(false);

  const resultsRef = useRef<HTMLElement>(null);

  const hasPendingChange =
    pendingQuery !== appliedQuery ||
    pendingKota  !== appliedKota  ||
    pendingKategori !== appliedKategori;

  const hasAppliedFilter =
    appliedQuery ||
    appliedKota     !== 'Semua Kota' ||
    appliedKategori !== 'Semua Kategori';

  const fetchVendors = useCallback(async (
    q: string, city: string, category: string, p: number
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: '12', sort: 'rating' });
      if (q && q.trim())                        params.set('q', q.trim());
      if (city && city !== 'Semua Kota')        params.set('city', city);
      if (category && category !== 'Semua Kategori') params.set('category', category);

      const res  = await fetch(`/api/v1/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.data.vendors ?? []);
        setTotal(data.data.total ?? 0);
        setTotalPages(data.data.total_pages ?? 1);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchVendors(appliedQuery, appliedKota, appliedKategori, page);
  }, [appliedQuery, appliedKota, appliedKategori, page, fetchVendors]);

  useEffect(() => {
    fetchVendors(appliedQuery, appliedKota, appliedKategori, 1);
  }, []);

  const handleCari = () => {
    setPage(1);
    setAppliedQuery(pendingQuery);
    setAppliedKota(pendingKota);
    setAppliedKategori(pendingKategori);
    const params = new URLSearchParams();
    if (pendingQuery)                          params.set('q',        pendingQuery);
    if (pendingKota !== 'Semua Kota')          params.set('city',     pendingKota);
    if (pendingKategori !== 'Semua Kategori')  params.set('category', pendingKategori);
    router.replace(`/search${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { setIsHighlighting(true); setTimeout(() => setIsHighlighting(false), 900); }, 650);
    }, 80);
  };

  const handlePillClick = (label: string) => {
    setPendingKategoriPill(label);
    setPendingKategori(label);
  };

  const handleReset = () => {
    setPendingQuery(''); setPendingKota('Semua Kota'); setPendingKategori('Semua Kategori'); setPendingKategoriPill('Semua Kategori');
    setAppliedQuery(''); setAppliedKota('Semua Kota'); setAppliedKategori('Semua Kategori');
    setPage(1);
    router.replace('/search', { scroll: false });
  };

  const removeFilter = (type: 'q' | 'city' | 'category') => {
    const newQ    = type === 'q'        ? '' : appliedQuery;
    const newCity = type === 'city'     ? 'Semua Kota' : appliedKota;
    const newCat  = type === 'category' ? 'Semua Kategori' : appliedKategori;
    if (type === 'q')        { setPendingQuery(''); setAppliedQuery(''); }
    if (type === 'city')     { setPendingKota('Semua Kota'); setAppliedKota('Semua Kota'); }
    if (type === 'category') { setPendingKategori('Semua Kategori'); setPendingKategoriPill('Semua Kategori'); setAppliedKategori('Semua Kategori'); }
    setPage(1);
    const params = new URLSearchParams();
    if (newQ)                         params.set('q',        newQ);
    if (newCity !== 'Semua Kota')     params.set('city',     newCity);
    if (newCat  !== 'Semua Kategori') params.set('category', newCat);
    router.replace(`/search${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Navbar />

      <section style={{ position: 'relative', paddingTop: 140, paddingBottom: 80, overflow: 'hidden', minHeight: 500 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 40%', filter: 'brightness(0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(13,59,46,0.82) 40%, rgba(13,59,46,0.3) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,59,46,0.9) 0%, transparent 55%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 36, animation: 'fadeUp 0.7s 0.1s both' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12, letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>✦ Jelajahi Vendor</p>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 900, color: 'white', marginBottom: 12, letterSpacing: '-1.5px', lineHeight: 1.08 }}>
              Temukan Vendor Terbaik<br />
              <em style={{ fontStyle: 'italic', color: '#f5a623', fontWeight: 300 }}>untuk Acara Anda</em>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 460 }}>
              {loading ? '...' : `${total}+`} vendor terverifikasi siap membantu mewujudkan acara impian Anda di seluruh Indonesia.
            </p>
          </div>

          <div style={{ animation: 'fadeUp 0.7s 0.22s both' }}>
            <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 20px 60px rgba(0,0,0,0.22)', maxWidth: 900 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 220px', padding: '9px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fafafa' }}
                onFocusCapture={e => (e.currentTarget.style.borderColor = '#0d3b2e')}
                onBlurCapture={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <Search size={15} color="#9ca3af" strokeWidth={2} />
                <input
                  value={pendingQuery}
                  onChange={e => setPendingQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCari()}
                  placeholder="Cari nama vendor atau layanan..."
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, color: '#111827', background: 'transparent', fontFamily: 'inherit' }}
                />
                {pendingQuery && <button onClick={() => setPendingQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9ca3af' }}><X size={14} /></button>}
              </div>

              <div style={{ flex: '0 1 220px' }}>
                <CustomDropdown value={pendingKategori} onChange={v => { setPendingKategori(v); setPendingKategoriPill(v); }} options={KATEGORI} icon={SlidersHorizontal} />
              </div>

              <div style={{ flex: '0 1 200px' }}>
                <KotaDropdown value={pendingKota} onChange={setPendingKota} />
              </div>

              <button
                onClick={handleCari}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, background: hasPendingChange ? '#0d3b2e' : '#1a5c44', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: hasPendingChange ? '0 4px 14px rgba(13,59,46,0.35)' : 'none', transform: hasPendingChange ? 'scale(1.02)' : 'scale(1)' }}
              >
                <Search size={15} /> Cari Vendor
              </button>
            </div>
          </div>

          <div style={{ marginTop: 22, display: 'flex', gap: 8, flexWrap: 'wrap', animation: 'fadeUp 0.7s 0.35s both' }}>
            {KATEGORI.slice(0, 8).map(({ label, Icon }) => {
              const isActive = pendingKategoriPill === label;
              return (
                <button key={label} onClick={() => handlePillClick(label)} style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${isActive ? '#f5a623' : 'rgba(255,255,255,0.18)'}`, background: isActive ? '#f5a623' : 'rgba(255,255,255,0.09)', color: isActive ? '#0d3b2e' : 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.18s', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={resultsRef} className={isHighlighting ? 'results-highlight' : ''} style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px', borderRadius: 20, transition: 'background 0.3s' }}>
        {/* Result header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Mencari vendor...</>
                : <>{total} vendor ditemukan{hasAppliedFilter && <span style={{ fontWeight: 400, color: '#64748b', fontSize: 14 }}> — dari filter yang dipilih</span>}</>
              }
            </p>
            {hasAppliedFilter && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {appliedQuery && (
                  <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Search size={10} /> &quot;{appliedQuery}&quot;
                    <button onClick={() => removeFilter('q')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#16a34a' }}><X size={10} /></button>
                  </span>
                )}
                {appliedKategori !== 'Semua Kategori' && (
                  <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <SlidersHorizontal size={10} /> {appliedKategori}
                    <button onClick={() => removeFilter('category')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#16a34a' }}><X size={10} /></button>
                  </span>
                )}
                {appliedKota !== 'Semua Kota' && (
                  <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={10} /> {appliedKota}
                    <button onClick={() => removeFilter('city')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#16a34a' }}><X size={10} /></button>
                  </span>
                )}
                <button onClick={handleReset} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={11} /> Reset semua filter
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
            <Award size={14} /> Diurutkan: Rating Tertinggi
          </div>
        </div>

        {loading ? (
          <div className="browse-grid">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 56, height: 56, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Search size={24} color="#94a3b8" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Vendor tidak ditemukan</p>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Coba ubah kata kunci, kategori, atau kota yang Anda cari.</p>
            <button onClick={handleReset} style={{ padding: '11px 28px', borderRadius: 999, background: '#0d3b2e', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Tampilkan Semua Vendor
            </button>
          </div>
        ) : (
          <>
            <div className="browse-grid">
              {vendors.map((v, idx) => (
                <VendorCard key={v.id} v={v} isHighlighting={isHighlighting} idx={idx} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '10px 20px', borderRadius: 100, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, fontWeight: 600, color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                >
                  ← Sebelumnya
                </button>
                <span style={{ fontSize: 13, color: '#94a3b8', padding: '0 8px' }}>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '10px 20px', borderRadius: 100, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, fontWeight: 600, color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                >
                  Berikutnya →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,300&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes sectionFlash { 0%{background:transparent} 30%{background:rgba(13,59,46,0.06)} 100%{background:transparent} }
        @keyframes cardPop  { 0%{transform:translateY(10px) scale(0.98);opacity:0.6} 60%{transform:translateY(-3px) scale(1.01);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }
        .results-highlight { animation: sectionFlash 0.9s ease forwards; }
        .card-pop { animation: cardPop 0.4s ease both; }
        .browse-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .browse-card { background: white; border-radius: 18px; overflow: hidden; border: 1px solid #f1f5f9; transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .browse-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.10); }
        @media (max-width: 1024px) { .browse-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px)  { .browse-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}