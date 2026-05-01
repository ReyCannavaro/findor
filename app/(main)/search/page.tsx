'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Star, CheckCircle, ArrowRight, X,
  ChevronDown, SlidersHorizontal, Navigation,
  Music2, Volume2, Construction, Flower2, UtensilsCrossed,
  Clapperboard, Camera, Lightbulb, Mic2, Tent, Car,
  Sparkles, Mail, LayoutGrid, Heart, Award,
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

const VENDORS = [
  { id: 'melody-aura-sound', name: 'Melody Aura Sound', kategori: 'Sound System', kota: 'Jakarta', lokasi: 'Sudirman, Jakarta', harga: 'Rp 15jt', rating: 4.9, ulasan: 241, verified: true, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80', desc: 'Spesialis sound system profesional untuk berbagai skala acara.' },
  { id: 'atelier-decor', name: 'Atelier Decor', kategori: 'Dekorasi & Florist', kota: 'Tangerang Selatan', lokasi: 'Tangerang Selatan', harga: 'Rp 45jt', rating: 5.0, ulasan: 92, verified: true, img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80', desc: 'Dekorasi floral dan art direction untuk pernikahan mewah.' },
  { id: 'visual-soul-studio', name: 'Visual Soul Studio', kategori: 'Dokumentasi', kota: 'Jakarta', lokasi: 'Kemang, Jakarta', harga: 'Rp 20jt', rating: 4.8, ulasan: 180, verified: true, img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80', desc: 'Dokumentasi sinematik berkualitas tinggi untuk momen berharga.' },
  { id: 'savory-palette', name: 'Savory Palette', kategori: 'Catering', kota: 'Jakarta', lokasi: 'Kelapa Gading, Jakarta', harga: 'Rp 350rb', rating: 4.9, ulasan: 310, verified: true, img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80', desc: 'Catering premium dengan menu nusantara dan internasional.' },
  { id: 'lumina-studio', name: 'Lumina Studio Jakarta', kategori: 'Photography', kota: 'Jakarta Selatan', lokasi: 'Senopati, Jakarta Selatan', harga: 'Rp 8.5jt', rating: 4.9, ulasan: 124, verified: true, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', desc: 'Studio fotografi pernikahan fine-art dengan sentuhan editorial.' },
  { id: 'spark-pro-light', name: 'Spark Pro Light', kategori: 'Lighting Design', kota: 'Surabaya', lokasi: 'Surabaya Pusat', harga: 'Rp 12jt', rating: 4.7, ulasan: 67, verified: true, img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80', desc: 'Desain pencahayaan artistik untuk panggung dan venue.' },
  { id: 'harmoni-wo', name: 'Harmoni Wedding Organizer', kategori: 'Wedding Organizer', kota: 'Bandung', lokasi: 'Dago, Bandung', harga: 'Rp 35jt', rating: 4.8, ulasan: 203, verified: true, img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80', desc: 'Wedding organizer berpengalaman dengan konsep yang personal.' },
  { id: 'sonic-systems', name: 'Sonic Systems Pro', kategori: 'Sound System', kota: 'Surabaya', lokasi: 'Surabaya Timur', harga: 'Rp 18jt', rating: 4.6, ulasan: 55, verified: false, img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80', desc: 'Penyedia sound system skala besar untuk konser dan festival.' },
  { id: 'bali-stage-co', name: 'Bali Stage Co.', kategori: 'Stage & Rigging', kota: 'Bali', lokasi: 'Seminyak, Bali', harga: 'Rp 55jt', rating: 4.9, ulasan: 88, verified: true, img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', desc: 'Konstruksi panggung dan rigging untuk event outdoor premium.' },
  { id: 'jogja-entertainment', name: 'Jogja Entertainment', kategori: 'Hiburan & Musik', kota: 'Yogyakarta', lokasi: 'Sleman, Yogyakarta', harga: 'Rp 8jt', rating: 4.7, ulasan: 142, verified: true, img: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80', desc: 'Penyedia hiburan live music dan pertunjukan seni budaya.' },
  { id: 'malang-catering', name: 'Dapur Nusantara', kategori: 'Catering', kota: 'Malang', lokasi: 'Malang Kota', harga: 'Rp 200rb', rating: 4.5, ulasan: 76, verified: false, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80', desc: 'Catering masakan nusantara autentik untuk acara keluarga.' },
  { id: 'bandung-photo', name: 'Capture Moment Studio', kategori: 'Photography', kota: 'Bandung', lokasi: 'Braga, Bandung', harga: 'Rp 6jt', rating: 4.6, ulasan: 98, verified: true, img: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80', desc: 'Fotografer profesional spesialis prewedding dan pernikahan.' },
];

function CustomDropdown({ value, onChange, options, icon: TriggerIcon, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { label: string; Icon?: React.ComponentType<{ size?: number; color?: string }> }[];
  icon: React.ComponentType<{ size?: number; color?: string }>; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDekatSaya = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(() => { onChange('Sidoarjo'); setLocLoading(false); setOpen(false); }, () => { setLocLoading(false); });
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

export default function BrowsePage() {
  const [pendingQuery, setPendingQuery] = useState('');
  const [pendingKota, setPendingKota] = useState('Semua Kota');
  const [pendingKategori, setPendingKategori] = useState('Semua Kategori');
  const [pendingKategoriPill, setPendingKategoriPill] = useState('Semua Kategori');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [appliedKota, setAppliedKota] = useState('Semua Kota');
  const [appliedKategori, setAppliedKategori] = useState('Semua Kategori');
  const resultsRef = useRef<HTMLElement>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);

  const hasPendingChange = pendingQuery !== appliedQuery || pendingKota !== appliedKota || pendingKategori !== appliedKategori;

  const hasil = useMemo(() => VENDORS.filter(v => {
    const cocokQuery = !appliedQuery || v.name.toLowerCase().includes(appliedQuery.toLowerCase()) || v.kategori.toLowerCase().includes(appliedQuery.toLowerCase()) || v.desc.toLowerCase().includes(appliedQuery.toLowerCase());
    const cocokKota = appliedKota === 'Semua Kota' || v.kota === appliedKota;
    const cocokKategori = appliedKategori === 'Semua Kategori' || v.kategori === appliedKategori;
    return cocokQuery && cocokKota && cocokKategori;
  }), [appliedQuery, appliedKota, appliedKategori]);

  const handleCari = () => {
    setAppliedQuery(pendingQuery);
    setAppliedKota(pendingKota);
    setAppliedKategori(pendingKategori);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { setIsHighlighting(true); setTimeout(() => setIsHighlighting(false), 900); }, 650);
    }, 80);
  };

  const handlePillClick = (label: string) => { setPendingKategoriPill(label); setPendingKategori(label); };

  const hasAppliedFilter = appliedQuery || appliedKota !== 'Semua Kota' || appliedKategori !== 'Semua Kategori';

  const handleReset = () => {
    setPendingQuery(''); setPendingKota('Semua Kota'); setPendingKategori('Semua Kategori'); setPendingKategoriPill('Semua Kategori');
    setAppliedQuery(''); setAppliedKota('Semua Kota'); setAppliedKategori('Semua Kategori');
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
              {VENDORS.length}+ vendor terverifikasi siap membantu mewujudkan acara impian Anda di seluruh Indonesia.
            </p>
          </div>

          <div style={{ animation: 'fadeUp 0.7s 0.22s both' }}>
            <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 20px 60px rgba(0,0,0,0.22)', maxWidth: 900 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 220px', padding: '9px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fafafa' }}
                onFocusCapture={e => (e.currentTarget.style.borderColor = '#0d3b2e')}
                onBlurCapture={e => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                <Search size={15} color="#9ca3af" strokeWidth={2} />
                <input value={pendingQuery} onChange={e => setPendingQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCari()} placeholder="Cari nama vendor atau layanan..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, color: '#111827', background: 'transparent', fontFamily: 'inherit' }} />
                {pendingQuery && <button onClick={() => setPendingQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9ca3af' }}><X size={14} /></button>}
              </div>

              <div style={{ flex: '0 1 220px' }}>
                <CustomDropdown value={pendingKategori} onChange={v => { setPendingKategori(v); setPendingKategoriPill(v); }} options={KATEGORI} icon={SlidersHorizontal} />
              </div>

              <div style={{ flex: '0 1 200px' }}>
                <KotaDropdown value={pendingKota} onChange={setPendingKota} />
              </div>

              <button onClick={handleCari} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, background: hasPendingChange ? '#0d3b2e' : '#1a5c44', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: hasPendingChange ? '0 4px 14px rgba(13,59,46,0.35)' : 'none', transform: hasPendingChange ? 'scale(1.02)' : 'scale(1)' }}>
                <Search size={15} /> Cari Vendor
              </button>
            </div>
          </div>

          {/* Kategori Pills */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {hasil.length} vendor ditemukan
              {hasAppliedFilter && <span style={{ fontWeight: 400, color: '#64748b', fontSize: 14 }}> — dari filter yang dipilih</span>}
            </p>
            {hasAppliedFilter && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {appliedQuery && <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 5 }}><Search size={10} /> &quot;{appliedQuery}&quot; <button onClick={() => { setAppliedQuery(''); setPendingQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#16a34a' }}><X size={10} /></button></span>}
                {appliedKategori !== 'Semua Kategori' && <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 5 }}><SlidersHorizontal size={10} /> {appliedKategori} <button onClick={() => { setAppliedKategori('Semua Kategori'); setPendingKategori('Semua Kategori'); setPendingKategoriPill('Semua Kategori'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#16a34a' }}><X size={10} /></button></span>}
                {appliedKota !== 'Semua Kota' && <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={10} /> {appliedKota} <button onClick={() => { setAppliedKota('Semua Kota'); setPendingKota('Semua Kota'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#16a34a' }}><X size={10} /></button></span>}
                <button onClick={handleReset} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}><X size={11} /> Reset semua filter</button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
            <Award size={14} /> Diurutkan: Rating Tertinggi
          </div>
        </div>

        {hasil.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 56, height: 56, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Search size={24} color="#94a3b8" /></div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Vendor tidak ditemukan</p>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Coba ubah kata kunci, kategori, atau kota yang Anda cari.</p>
            <button onClick={handleReset} style={{ padding: '11px 28px', borderRadius: 999, background: '#0d3b2e', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Tampilkan Semua Vendor</button>
          </div>
        ) : (
          <div className="browse-grid">
            {hasil.map((v, idx) => (
              <Link key={v.id} href={`/vendor/${v.id}`} style={{ textDecoration: 'none' }}>
                <div className={`browse-card${isHighlighting ? ' card-pop' : ''}`} style={{ animationDelay: isHighlighting ? `${idx * 60}ms` : '0ms' }}>
                  <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#e5e7eb' }}>
                    <img src={v.img} alt={v.name} className="browse-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }} />
                    {v.verified && (
                      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '4px 10px', backdropFilter: 'blur(6px)' }}>
                        <CheckCircle size={11} color="#16a34a" fill="#16a34a" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>TERVERIFIKASI</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '4px 10px', backdropFilter: 'blur(6px)' }}>
                      <Star size={11} fill="#f97316" color="#f97316" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{v.rating}</span>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>({v.ulasan})</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(13,59,46,0.88)', borderRadius: 999, padding: '4px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{v.kategori}</span>
                    </div>
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 5, lineHeight: 1.3 }}>{v.name}</p>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>{v.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                      <MapPin size={12} color="#94a3b8" />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{v.lokasi}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Mulai dari</p>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#0d3b2e' }}>{v.harga}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0d3b2e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Lihat Portfolio <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sectionFlash {
          0%   { background: transparent; }
          30%  { background: rgba(13, 59, 46, 0.06); }
          100% { background: transparent; }
        }
        .results-highlight { animation: sectionFlash 0.9s ease forwards; }
        @keyframes cardPop {
          0%   { transform: translateY(10px) scale(0.98); opacity: 0.6; }
          60%  { transform: translateY(-3px) scale(1.01); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .card-pop { animation: cardPop 0.4s ease both; }
        .browse-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .browse-card { background: white; border-radius: 18px; overflow: hidden; border: 1px solid #f1f5f9; transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .browse-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.10); }
        .browse-card:hover .browse-card-img { transform: scale(1.06); }
        @media (max-width: 1024px) { .browse-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .browse-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}