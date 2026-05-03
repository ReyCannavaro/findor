'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, CheckCircle, Shield,
  ArrowRight, ArrowLeft, ChevronRight, Volume2, Lightbulb,
  Camera, UtensilsCrossed, Tent, Music, MapPin,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const SLIDES = [
  {
    id: 0,
    image: '/hero/wedding.jpg',
    headlinePart1: 'Wujudkan Event',
    headlineItalic: 'Impian',
    headlinePart2: 'Tanpa Kompromi',
    subtext: 'Temukan vendor pernikahan, dekorasi, catering, dan fotografer terbaik — semua di satu platform.',
  },
  {
    id: 1,
    image: '/hero/corporate.jpg',
    headlinePart1: 'Event Korporat',
    headlineItalic: 'Berkesan',
    headlinePart2: '& Profesional',
    subtext: 'Dari seminar hingga gala dinner — vendor pilihan siap menjadikan setiap momen perusahaan Anda luar biasa.',
  },
  {
    id: 2,
    image: '/hero/birthday.jpg',
    headlinePart1: 'Pesta',
    headlineItalic: 'Spesial',
    headlinePart2: 'Layak Dapat Yang Terbaik',
    subtext: 'Birthday, sweet seventeen, atau gathering keluarga — findor hadir memastikan setiap detail sempurna.',
  },
];

const HERO_STATS = [
  { num: '2.400', suffix: '+', desc: 'Vendor Terverifikasi' },
  { num: '18.000', suffix: '+', desc: 'Event Sukses' },
  { num: '99', suffix: '%', desc: 'Kepuasan Klien' },
  { num: '34', suffix: '', desc: 'Kota di Indonesia' },
];

const SLIDE_DURATION = 5500;

const CATEGORIES_SMALL = [
  { icon: <Volume2 size={20} />, label: 'Sound System', count: 87, image: '/categories/sound.jpg' },
  { icon: <Lightbulb size={20} />, label: 'Decoration', count: 203, image: '/categories/decoration.jpg' },
  { icon: <Camera size={20} />, label: 'Documentation', count: 91, image: '/categories/documentation.jpg' },
  { icon: <Music size={20} />, label: 'Entertainment', count: 64, image: '/categories/entertainment.jpg' },
];

// Tipe untuk vendor dari API
interface ApiVendor {
  id: string; store_name: string; slug: string;
  category: string; description: string | null; city: string;
  rating_avg: number; review_count: number; is_verified: boolean;
  services: { id: string; price_min: number; price_max: number | null }[];
}

const TRUST_ITEMS = [
  { icon: <Shield size={18} />, title: 'Garansi Layanan', desc: 'Dana kembali 100% jika vendor tidak hadir di hari H.' },
  { icon: <CheckCircle size={18} />, title: 'Verifikasi 5 Tahap', desc: 'Kami mengecek langsung kualitas fisik peralatan vendor.' },
];

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [active, setActive] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    setActive(false);
    setTimeout(() => {
      setCurrent(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
      setActive(true);
    }, 80);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goTo(current + 1), SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, goTo]);

  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo]);

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) goTo(dx > 0 ? current + 1 : current - 1);
  };

  const slide = SLIDES[current];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: 600,
        overflow: 'hidden',
        background: 'var(--forest)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        key={`bg-${current}`}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${slide.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.55)',
          animation: 'heroZoom 7s ease-out forwards',
        }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(110deg, rgba(13,59,46,0.75) 38%, rgba(13,59,46,0.15) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(13,59,46,0.85) 0%, transparent 60%)',
      }} />

      {/* Slide Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 48px',
        paddingBottom: '35px',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
        {active && (
          <div>
            <h1 style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(40px, 5.5vw, 78px)',
              fontWeight: 900,
              color: 'var(--white)',
              lineHeight: 1.04,
              letterSpacing: '-2px',
              maxWidth: 620,
              marginBottom: 20,
              animation: 'heroFadeUp 0.75s 0.28s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              {slide.headlinePart1}
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--amber)', fontWeight: 300 }}>
                {slide.headlineItalic}
              </em>{' '}
              {slide.headlinePart2}
              <span style={{ color: 'var(--amber)' }}>.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 1.6vw, 18px)',
              color: 'rgba(255,255,255,0.62)',
              maxWidth: 480,
              lineHeight: 1.7,
              marginBottom: 40,
              fontWeight: 300,
              animation: 'heroFadeUp 0.75s 0.42s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              {slide.subtext}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
              animation: 'heroFadeUp 0.7s 0.55s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <Link
                href="/search"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '14px 30px', borderRadius: 100 }}
              >
                Cari Vendor <ArrowRight size={17} />
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 300, letterSpacing: '0.05em' }}>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {String(current + 1).padStart(2, '0')}
                </span>{' '}/ {String(SLIDES.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => goTo(current - 1)}
        aria-label="Sebelumnya"
        style={{
          position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center',
          cursor: 'pointer', color: 'white', transition: 'background 0.2s',
        }}
      >
        <ArrowLeft size={20} />
      </button>
      <button
        onClick={() => goTo(current + 1)}
        aria-label="Berikutnya"
        style={{
          position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center',
          cursor: 'pointer', color: 'white', transition: 'background 0.2s',
        }}
      >
        <ArrowRight size={20} />
      </button>

      <div style={{
        position: 'absolute', left: '50%', bottom: 168,
        transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? 28 : 8, height: 8,
              borderRadius: 100,
              background: i === current ? 'var(--amber)' : 'rgba(255,255,255,0.25)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'background 0.3s, width 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 48, left: 0, right: 0, zIndex: 4,
        maxWidth: 1200, margin: '0 auto', padding: '0 48px',
        display: 'flex', alignItems: 'center',
      }}>
        {HERO_STATS.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRight: i < HERO_STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              paddingRight: i < HERO_STATS.length - 1 ? 32 : 0,
              marginRight: i < HERO_STATS.length - 1 ? 32 : 0,
              transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
              opacity: statsVisible ? 1 : 0,
              transition: `transform 0.6s ${i * 0.12}s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ${i * 0.12}s ease`,
            }}
          >
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, color: 'var(--white)', lineHeight: 1 }}>
              {s.num}<span style={{ color: 'var(--amber)' }}>{s.suffix}</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroZoom {
          from { transform: scale(1.08); }
          to   { transform: scale(1.0); }
        }
      `}</style>
    </section>
  );
}

function formatHarga(services: { price_min: number }[]): string {
  if (!services || services.length === 0) return 'Hubungi vendor';
  const min = Math.min(...services.map(s => s.price_min));
  if (min >= 1_000_000) return `Rp ${(min / 1_000_000).toFixed(0)}jt`;
  if (min >= 1_000) return `Rp ${(min / 1_000).toFixed(0)}rb`;
  return `Rp ${min.toLocaleString('id-ID')}`;
}

export default function HomeClient() {
  const router = useRouter();
  const [popularVendors, setPopularVendors] = useState<ApiVendor[]>([]);
  const [vendorLoading, setVendorLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/search?sort=rating&per_page=4')
      .then(r => r.json())
      .then(d => { if (d.success) setPopularVendors(d.data.vendors ?? []); })
      .catch(() => {})
      .finally(() => setVendorLoading(false));
  }, []);

  const handleViewDetail = (slug: string) => {
    router.push(`/vendor/${slug}`);
  };

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <section style={{ padding: '80px 0', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>Kategori Utama</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Temukan spesialis untuk setiap detail acara Anda.</p>
            </div>
            <Link href="/search" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--forest)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: 16 }}>
            <Link href="/search?kategori=Stage+%26+Rigging" style={{ textDecoration: 'none', gridRow: '1 / 3' }}>
              <div
                className="cat-card"
                style={{
                  position: 'relative', borderRadius: 20, overflow: 'hidden',
                  height: '100%', minHeight: 380, cursor: 'pointer',
                  background: 'var(--forest)', display: 'flex', alignItems: 'flex-end',
                }}
              >
                <img src="/categories/stage.jpg" alt="Stage & Rigging" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="cat-img" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,59,46,0.95) 0%, rgba(13,59,46,0.15) 55%, transparent 100%)' }} />
                <div style={{ position: 'relative', padding: 28 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--amber)', borderRadius: 100,
                    padding: '4px 12px', marginBottom: 14,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Terpopuler</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', color: 'white', backdropFilter: 'blur(8px)' }}>
                      <Tent size={18} />
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--white)', fontSize: 22, fontFamily: 'Fraunces, serif', letterSpacing: '-0.5px' }}>Stage &amp; Rigging</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>124 Vendor Terverifikasi</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontSize: 13, fontWeight: 600 }}>
                    Jelajahi <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>

            <div style={{ gridColumn: '2 / 4', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {CATEGORIES_SMALL.map(cat => (
                <Link key={cat.label} href={`/search?kategori=${encodeURIComponent(cat.label)}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="cat-card"
                    style={{
                      position: 'relative', borderRadius: 18, overflow: 'hidden',
                      height: 170, cursor: 'pointer', background: 'var(--gray-50)',
                      display: 'flex', alignItems: 'flex-end',
                    }}
                  >
                    <img src={cat.image} alt={cat.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="cat-img" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)' }} />
                    <div style={{ position: 'relative', padding: '14px 16px', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: 'white', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                          {cat.icon}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--white)', fontSize: 15, marginBottom: 2, letterSpacing: '-0.3px' }}>{cat.label}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{cat.count} vendor</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/search?kategori=Catering+Service" style={{ textDecoration: 'none', gridColumn: '2 / 4' }}>
              <div
                className="cat-card"
                style={{
                  position: 'relative', borderRadius: 20, overflow: 'hidden',
                  height: 170, cursor: 'pointer', background: 'var(--forest)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <img src="/categories/catering.jpg" alt="Catering Service" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="cat-img" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(13,59,46,0.92) 35%, rgba(13,59,46,0.2) 100%)' }} />
                <div style={{ position: 'relative', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', color: 'white', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                      <UtensilsCrossed size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--white)', fontSize: 22, fontFamily: 'Fraunces, serif', letterSpacing: '-0.5px', marginBottom: 4 }}>Catering Service</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>156 Vendor Terverifikasi · Premium &amp; Budget Friendly</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--amber)', borderRadius: 100, padding: '10px 20px', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--forest)' }}>Lihat Semua</span>
                    <ArrowRight size={15} color="var(--forest)" />
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>

        <style>{`
          .cat-card:hover .cat-img { transform: scale(1.06); }
          .cat-card { transition: box-shadow 0.3s, transform 0.3s; }
          .cat-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.18); transform: translateY(-3px); }
        `}</style>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>Vendor Terpopuler</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Yang paling banyak dicari dan dipercaya oleh klien premium.</p>
          </div>

          <div className="vendor-grid">
            {vendorLoading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="vendor-card" style={{ overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '4/3', background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ height: 16, width: '70%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
                      <div style={{ height: 13, width: '50%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
                      <div style={{ height: 34, width: '100%', borderRadius: 100, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
                    </div>
                  </div>
                ))
              : popularVendors.map(v => (
                <div key={v.id} className="vendor-card">
                  <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#1C3D2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.2)', fontFamily: 'Fraunces, serif' }}>
                      {v.store_name[0].toUpperCase()}
                    </span>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 'var(--radius-full)', padding: '3px 8px', fontSize: 12, fontWeight: 700, color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={10} fill="var(--amber)" color="var(--amber)" /> {v.rating_avg > 0 ? v.rating_avg.toFixed(1) : '—'}
                    </div>
                    {v.is_verified && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 'var(--radius-full)', padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}>
                        ✓ Verified
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{v.store_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{v.category}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      <MapPin size={11} /> {v.city}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Starts from</span>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--forest)' }}>{formatHarga(v.services)}</div>
                      </div>
                      <button
                        onClick={() => handleViewDetail(v.slug)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 12, fontWeight: 600, color: 'var(--forest)',
                          background: 'var(--amber)', borderRadius: 100,
                          padding: '7px 14px', border: 'none', cursor: 'pointer',
                        }}
                      >
                        Portofolio <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <style>{`
          .vendor-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          @media (max-width: 1024px) {
            .vendor-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 480px) {
            .vendor-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 16, lineHeight: 1.15 }}>
                Kurasi Ketat Untuk<br />Keamanan Anda.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Setiap vendor dengan badge <strong>Terpercaya</strong> telah melewati verifikasi legalitas, pengecekan peralatan, dan audit riwayat pekerjaan.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {TRUST_ITEMS.map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--verified-green)', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="#" className="btn-forest" style={{ display: 'inline-flex' }}>
                Pelajari Standar Findor <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--forest)', position: 'relative' }}>
                <img src="/trust/vendor1.jpg" alt="vendor" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, mixBlendMode: 'luminosity' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'var(--amber)', borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>GOLD VENDOR</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-100)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Standard Kualitas Global</div>
                </div>
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '1', background: 'var(--forest)', position: 'relative' }}>
                  <img src="/trust/speaker.jpg" alt="speaker" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)', fontFamily: 'Fraunces, serif' }}>500+</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Vendor Terverifikasi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
        <img
          src="/cta/bg.jpg"
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.55)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,59,46,0.55) 0%, rgba(13,59,46,0.82) 50%, rgba(13,59,46,0.55) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,59,46,0.7) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.5px', marginBottom: 16, lineHeight: 1.2 }}>
            Punya Vendor Event Berkualitas?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
            Dapatkan akses ke ribuan klien premium di seluruh Indonesia. Mulai kembangkan bisnis event Anda hari ini.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/vendor/dashboard" className="btn-primary">Daftar Sebagai Vendor</Link>
            <Link href="#" className="btn-secondary">Hubungi Consultant</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}