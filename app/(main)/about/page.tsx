'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Star, Heart, Zap, MapPin } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const STATS = [
  { value: '2.400+', label: 'Vendor Terverifikasi' },
  { value: '18.000+', label: 'Event Sukses' },
  { value: '99%', label: 'Tingkat Kepuasan' },
  { value: '34', label: 'Kota di Indonesia' },
];

const VALUES = [
  { icon: <Shield size={22} />, title: 'Kepercayaan', desc: 'Setiap vendor melewati verifikasi ketat sebelum tampil di platform. Kami tidak berkompromi soal kualitas.' },
  { icon: <Star size={22} />, title: 'Kurasi Ketat', desc: 'Bukan sekadar direktori. Findor adalah galeri terkurasi — hanya yang terbaik yang layak masuk.' },
  { icon: <Heart size={22} />, title: 'Berpihak pada Klien', desc: 'Garansi dana kembali, mediasi sengketa, dan dukungan 24/7 memastikan Anda selalu terlindungi.' },
  { icon: <Zap size={22} />, title: 'Efisiensi', desc: 'Temukan, negosiasi, dan booking vendor premium dalam satu platform — tanpa ribet, tanpa perantara.' },
];

const TEAM = [
  { name: 'Reyjuno Al Cannvaro', role: 'Co-Founder & CEO', img: '/team/arya.jpg' },
  { name: 'Raffi Akbar Baihaqy', role: 'Co-Founder & CPO', img: '/team/nadira.jpg' },
  { name: 'Arga Fikri Akbar', role: 'Head of Curation', img: '/team/reza.jpg' },
  { name: 'Abbiyu Putra Praditama', role: 'Head of Vendor Relations', img: '/team/sinta.jpg' },
];

const MILESTONES = [
  { year: '2022', title: 'Findor Didirikan', desc: 'Lahir di Jakarta dengan misi menghubungkan klien dan vendor event berkualitas.' },
  { year: '2023', title: 'Ekspansi 10 Kota', desc: 'Hadir di Surabaya, Bandung, Bali, Medan, dan 6 kota besar lainnya.' },
  { year: '2024', title: '500+ Vendor Aktif', desc: 'Melampaui 500 vendor terverifikasi dengan tingkat kepuasan klien 99%.' },
  { year: '2025', title: '34 Kota Indonesia', desc: 'Menjadi platform vendor event terluas dengan jangkauan nasional.' },
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      <section style={{ background: 'var(--forest)', padding: '120px 24px 90px', position: 'relative', overflow: 'hidden' }}>
        <img src="/about/hero.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,59,46,0.55) 0%, rgba(13,59,46,0.9) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,59,46,0.65) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.35)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tentang Kami</span>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 900, color: 'var(--white)', letterSpacing: '-1.5px', lineHeight: 1.08, marginBottom: 20 }}>
            Kami Hadir untuk Membuat<br />Event Anda{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--amber)', fontWeight: 300 }}>Tak Terlupakan</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto 36px' }}>
            Findor adalah platform kurasi vendor event premium pertama di Indonesia — menghubungkan penyelenggara acara dengan vendor terbaik yang telah terverifikasi secara ketat.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse" className="btn-primary" style={{ fontSize: 14, padding: '11px 24px' }}>
              Cari Vendor <ArrowRight size={15} />
            </Link>
            <Link href="/how-it-works" className="btn-secondary" style={{ fontSize: 14, padding: '11px 24px' }}>
              Cara Kerja
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)', padding: '52px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="stats-grid">
          {STATS.map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid var(--gray-100)' : 'none', paddingRight: i < STATS.length - 1 ? 24 : 0 }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 900, color: 'var(--forest)', letterSpacing: '-1px', marginBottom: 4, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="story-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cerita Kami</span>
            </div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 34, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 18 }}>
              Lahir dari Frustrasi,<br />Tumbuh dari{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--forest)', fontWeight: 300 }}>Kepercayaan</em>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 14 }}>
              Findor lahir pada 2022 ketika para pendirinya mengalami sendiri betapa sulitnya menemukan vendor event yang benar-benar bisa diandalkan.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 28 }}>
              Kami membangun Findor dengan satu prinsip:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>hanya vendor yang benar-benar layak yang boleh tampil</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Didirikan di Sidoarjo, 2024', 'Hadir di 34 kota Indonesia', 'Didukung 2.400+ vendor terverifikasi'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={15} color="var(--verified-green)" />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}>
            <img src="/about/story.jpg" alt="Findor story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'var(--forest)', borderRadius: 'var(--radius-md)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={16} color="var(--amber)" />
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Berbasis di</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>Jakarta, Indonesia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 8 }}>Perjalanan Findor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Dari ide sederhana menjadi platform terpercaya jutaan pengguna.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="milestone-grid">
            {MILESTONES.map((m, i) => (
              <div key={i} style={{ background: i % 2 === 0 ? 'var(--forest)' : 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', border: i % 2 === 0 ? 'none' : '1px solid var(--gray-100)' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 900, color: i % 2 === 0 ? 'var(--amber)' : 'var(--forest)', marginBottom: 12, lineHeight: 1 }}>{m.year}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: i % 2 === 0 ? 'var(--white)' : 'var(--text-primary)', marginBottom: 8 }}>{m.title}</div>
                <div style={{ fontSize: 13, color: i % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)', lineHeight: 1.65 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 8 }}>Yang Kami Percaya</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Nilai-nilai yang menjadi fondasi setiap keputusan di Findor.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="value-card" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '24px 26px', border: '1px solid var(--gray-100)', display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'transform 0.25s, box-shadow 0.25s' }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--forest)', display: 'grid', placeItems: 'center', color: 'var(--amber)', flexShrink: 0 }}>
                  {v.icon}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{v.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 8 }}>Orang-orang di Balik Findor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Tim yang berdedikasi membangun ekosistem event terbaik di Indonesia.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="team-grid">
            {TEAM.map(t => (
              <div key={t.name} className="team-card" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-100)', transition: 'transform 0.25s, box-shadow 0.25s' }}>
                <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'var(--gray-100)', position: 'relative' }}>
                  <img src={t.img} alt={t.name} className="team-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,59,46,0.5) 0%, transparent 50%)' }} />
                </div>
                <div style={{ padding: '16px 16px 18px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ background: 'var(--forest)', borderRadius: 'var(--radius-xl)', padding: '56px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <img src="/about/cta.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(13,59,46,0.7) 0%, rgba(13,59,46,0.95) 100%)' }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 34, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.2 }}>
                Siap Wujudkan Event{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--amber)', fontWeight: 300 }}>Impian</em> Anda?
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
                Jelajahi ratusan vendor premium yang sudah terverifikasi dan siap membantu acara Anda.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/browse" className="btn-primary" style={{ fontSize: 14, padding: '12px 28px' }}>
                  Cari Vendor <ArrowRight size={15} />
                </Link>
                <Link href="/how-it-works" className="btn-secondary" style={{ fontSize: 14, padding: '12px 28px' }}>
                  Standar Findor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .stats-grid { grid-template-columns: repeat(4, 1fr); }
        .story-grid { grid-template-columns: 1fr 1fr; }
        .milestone-grid { grid-template-columns: repeat(4, 1fr); }
        .values-grid { grid-template-columns: 1fr 1fr; }
        .team-grid { grid-template-columns: repeat(4, 1fr); }
        .value-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .team-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .team-card:hover .team-img { transform: scale(1.06); }
        @media (max-width: 1024px) {
          .milestone-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .story-grid { grid-template-columns: 1fr !important; }
          .milestone-grid { grid-template-columns: 1fr !important; }
          .values-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  );
}