'use client';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, XCircle, AlertTriangle,
  Users, Store, Shield, Star, MessageCircle, Ban,
  Search, CalendarCheck, Handshake, BadgeCheck,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const HOW_STEPS = [
  { num: '01', icon: <Search size={24} />, title: 'Cari Vendor', desc: 'Temukan vendor sesuai kategori, lokasi, dan budget. Filter canggih membantu kamu menemukan yang paling cocok.' },
  { num: '02', icon: <MessageCircle size={24} />, title: 'Hubungi & Negosiasi', desc: 'Diskusikan detail event langsung via WhatsApp. Tanyakan paket, ketersediaan, dan sesuaikan kebutuhan.' },
  { num: '03', icon: <CalendarCheck size={24} />, title: 'Booking & DP', desc: 'Lakukan booking resmi dan bayar DP melalui Virtual Account Findor. Dana aman hingga event selesai.' },
  { num: '04', icon: <Handshake size={24} />, title: 'Event Berjalan', desc: 'Vendor hadir profesional di hari H. Tim Findor siap membantu jika ada kendala mendadak.' },
  { num: '05', icon: <BadgeCheck size={24} />, title: 'Selesai & Review', desc: 'Pelunasan dilakukan setelah event sukses. Berikan ulasan untuk membantu komunitas Findor.' },
];

const USER_RULES = [
  { type: 'do', title: 'Komunikasi Lewat WhatsApp', desc: 'Semua negosiasi harga dan kesepakatan dilakukan langsung via WhatsApp dengan vendor.' },
  { type: 'do', title: 'Upload Bukti Transaksi Valid', desc: 'Setelah transfer, upload screenshot atau PDF bukti pembayaran yang jelas dan terbaca.' },
  { type: 'do', title: 'Booking Minimal 14 Hari Sebelum Event', desc: 'Pastikan booking setidaknya 2 minggu sebelum tanggal acara agar vendor dapat mempersiapkan diri.' },
  { type: 'do', title: 'Konfirmasi Detail Event Lengkap', desc: 'Sampaikan lokasi, durasi, jumlah tamu, dan kebutuhan teknis secara jelas kepada vendor.' },
  { type: 'dont', title: 'Dilarang Membatalkan Sepihak', desc: 'Pembatalan kurang dari 7 hari sebelum event tidak mendapat refund. Hubungi tim Findor untuk mediasi.' },
  { type: 'dont', title: 'Dilarang Transaksi di Luar Platform', desc: 'Semua pembayaran DP wajib melalui Virtual Account Findor. Transaksi langsung tidak dilindungi garansi.' },
  { type: 'dont', title: 'Dilarang Memberikan Ulasan Palsu', desc: 'Ulasan hanya boleh diberikan oleh user yang benar-benar menggunakan layanan vendor tersebut.' },
];

const VENDOR_RULES = [
  { type: 'do', title: 'Respons WhatsApp Maksimal 2 Jam', desc: 'Vendor wajib merespons pesan dari calon klien dalam 2 jam di jam kerja (08.00–20.00).' },
  { type: 'do', title: 'Informasi Paket Harus Akurat', desc: 'Deskripsi paket, harga, dan ketersediaan yang ditampilkan di profil harus sesuai kondisi aktual.' },
  { type: 'do', title: 'Hadir Tepat Waktu di Hari H', desc: 'Vendor wajib tiba di lokasi minimal 2 jam sebelum acara dimulai untuk persiapan.' },
  { type: 'do', title: 'Laporkan Kendala Segera', desc: 'Jika ada hambatan teknis atau force majeure, vendor wajib menginformasikan ke klien dan tim Findor.' },
  { type: 'dont', title: 'Dilarang Menolak Klien Tanpa Alasan', desc: 'Penolakan booking hanya diperbolehkan jika tanggal sudah terisi atau ada alasan teknis yang valid.' },
  { type: 'dont', title: 'Dilarang Menaikkan Harga Mendadak', desc: 'Harga yang sudah disepakati tidak boleh diubah secara sepihak setelah klien melakukan DP.' },
  { type: 'dont', title: 'Dilarang Menggunakan Peralatan Tidak Layak', desc: 'Semua peralatan harus sesuai yang tertera di paket dan dalam kondisi baik.' },
];

const VERIFICATION_STEPS = [
  { step: '01', title: 'Verifikasi Identitas', desc: 'KTP pemilik usaha dan NPWP bisnis diperiksa oleh tim Findor.' },
  { step: '02', title: 'Audit Portofolio', desc: 'Minimal 10 dokumentasi event nyata yang dapat diverifikasi.' },
  { step: '03', title: 'Pengecekan Peralatan', desc: 'Tim teknis Findor melakukan inspeksi fisik peralatan utama.' },
  { step: '04', title: 'Uji Respons & Komunikasi', desc: 'Simulasi interaksi klien untuk menilai profesionalisme vendor.' },
  { step: '05', title: 'Review Riwayat Kerja', desc: 'Wawancara dengan minimal 3 klien terdahulu sebagai referensi.' },
];

const SANCTIONS = [
  'Peringatan tertulis pertama dan kedua',
  'Pembekuan akun sementara (7–30 hari)',
  'Penghapusan permanen dari platform Findor',
  'Pelaporan ke pihak berwenang untuk kasus penipuan',
];

function RuleCard({ rule }: { rule: { type: string; title: string; desc: string } }) {
  const isDo = rule.type === 'do';
  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', border: `1px solid ${isDo ? '#d1fae5' : '#fee2e2'}`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: isDo ? '#dcfce7' : '#fee2e2', display: 'grid', placeItems: 'center', color: isDo ? 'var(--verified-green)' : 'var(--danger)' }}>
        {isDo ? <CheckCircle size={17} /> : <XCircle size={17} />}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{rule.title}</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{rule.desc}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--forest)', display: 'grid', placeItems: 'center', color: 'var(--amber)', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 2 }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />

      <section style={{ background: 'var(--forest)', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <img src="/how-it-works/hero.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,59,46,0.6) 0%, rgba(13,59,46,0.88) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,59,46,0.65) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.35)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <Shield size={12} color="var(--amber)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Standar Findor</span>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'var(--white)', letterSpacing: '-1.5px', lineHeight: 1.08, marginBottom: 18 }}>
            Cara Kerja &<br />
            <em style={{ fontStyle: 'italic', color: 'var(--amber)', fontWeight: 300 }}>Standar</em> Platform
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 32px' }}>
            Panduan lengkap untuk user dan vendor agar setiap event berjalan profesional, aman, dan sesuai ekspektasi.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse" className="btn-primary" style={{ fontSize: 14, padding: '11px 24px' }}>
              Cari Vendor <ArrowRight size={15} />
            </Link>
            <Link href="/vendor/register" className="btn-secondary" style={{ fontSize: 14, padding: '11px 24px' }}>
              Daftarkan Layanan
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 8 }}>5 Langkah Mudah</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Dari pencarian hingga event sukses — semua terpandu di Findor.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }} className="how-steps-grid">
            {HOW_STEPS.map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {i < HOW_STEPS.length - 1 && (
                  <div className="step-connector" style={{ position: 'absolute', top: 28, left: '60%', right: '-40%', height: 2, background: 'linear-gradient(to right, var(--amber), var(--gray-200))', zIndex: 0 }} />
                )}
                <div className="how-step-card" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '24px 18px', border: '1px solid var(--gray-100)', textAlign: 'center', position: 'relative', zIndex: 1, transition: 'transform 0.25s, box-shadow 0.25s' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--forest)', margin: '0 auto 14px', display: 'grid', placeItems: 'center', color: 'var(--amber)' }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{s.num}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <div style={{ marginBottom: 64 }}>
            <SectionHeader icon={<Users size={20} />} title="Aturan untuk User" sub="Berlaku untuk semua pengguna yang mencari dan memesan vendor di Findor." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="rules-grid">
              {USER_RULES.map((r, i) => <RuleCard key={i} rule={r} />)}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--gray-100)', marginBottom: 64 }} />

          <div style={{ marginBottom: 64 }}>
            <SectionHeader icon={<Store size={20} />} title="Aturan untuk Vendor" sub="Berlaku untuk semua vendor yang terdaftar dan aktif di platform Findor." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="rules-grid">
              {VENDOR_RULES.map((r, i) => <RuleCard key={i} rule={r} />)}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--gray-100)', marginBottom: 64 }} />

          <div style={{ marginBottom: 64 }}>
            <SectionHeader icon={<Star size={20} />} title="Proses Verifikasi 5 Tahap" sub="Setiap vendor melewati seleksi ketat sebelum tampil di platform." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {VERIFICATION_STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', paddingBottom: i < VERIFICATION_STEPS.length - 1 ? 24 : 0 }}>
                  {i < VERIFICATION_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: 21, top: 46, width: 2, height: 'calc(100% - 16px)', background: 'var(--gray-100)' }} />
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0, zIndex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--amber)' }}>{s.step}</span>
                  </div>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '16px 20px', flex: 1, border: '1px solid var(--gray-100)' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.title}</p>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-xl)', padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 64 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: '#ffedd5', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <AlertTriangle size={22} color="#ea580c" />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>Sanksi Pelanggaran</h3>
              <p style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.7, marginBottom: 12 }}>Pelanggaran terhadap aturan di atas dapat mengakibatkan:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {SANCTIONS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Ban size={12} color="#ea580c" />
                    <span style={{ fontSize: 14, color: '#7c2d12' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--forest)', borderRadius: 'var(--radius-xl)', padding: '40px 48px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <img src="/how-it-works/cta.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(13,59,46,0.95) 40%, rgba(13,59,46,0.5) 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: 'var(--white)', marginBottom: 6, letterSpacing: '-0.3px' }}>Ada pertanyaan soal aturan ini?</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Tim Findor siap membantu Anda memahami standar platform kami.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13, padding: '10px 20px' }}>Kembali ke Beranda</Link>
              <a href="https://wa.me/628001234567" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', borderRadius: 100, background: '#25D366', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={14} /> Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .how-steps-grid { grid-template-columns: repeat(5, 1fr); }
        .how-step-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .rules-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 1024px) {
          .how-steps-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .step-connector { display: none; }
        }
        @media (max-width: 640px) {
          .how-steps-grid { grid-template-columns: 1fr !important; }
          .rules-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}