'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, CalendarCheck, Package, CalendarDays,
  BarChart2, LogOut, Star, MapPin, Clock, CheckCircle2,
  XCircle, AlertCircle, ArrowRight, TrendingUp, Users,
  ChevronRight, Menu, X, Store, ExternalLink, Loader2,
  ShieldCheck, ShieldAlert, Receipt, Zap,
} from 'lucide-react';
import type { BookingStatus } from '@/types';

interface VendorProfile {
  id: string;
  store_name: string;
  slug: string;
  category: string;
  city: string;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  review_count: number;
  created_at: string;
}

interface BookingItem {
  id: string;
  event_date: string;
  event_name: string;
  event_location: string;
  status: BookingStatus;
  created_at: string;
  service: { id: string; name: string; category: string } | null;
  user: { id: string; full_name: string | null; email: string };
}

interface DashboardStats {
  total_bookings: number;
  pending: number;
  confirmed: number;
  completed: number;
  rating_avg: number;
  review_count: number;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:         { label: 'Menunggu',         color: '#92400E', bg: '#FEF3C7', icon: <Clock size={11} /> },
  confirmed:       { label: 'Dikonfirmasi',      color: '#1E40AF', bg: '#DBEAFE', icon: <CheckCircle2 size={11} /> },
  waiting_payment: { label: 'Bayar DP',          color: '#7C3AED', bg: '#EDE9FE', icon: <AlertCircle size={11} /> },
  dp_verified:     { label: 'DP Terverifikasi',  color: '#065F46', bg: '#D1FAE5', icon: <CheckCircle2 size={11} /> },
  completed:       { label: 'Selesai',           color: '#064E3B', bg: '#D1FAE5', icon: <CheckCircle2 size={11} /> },
  rejected:        { label: 'Ditolak',           color: '#991B1B', bg: '#FEE2E2', icon: <XCircle size={11} /> },
  cancelled:       { label: 'Dibatalkan',        color: '#374151', bg: '#F3F4F6', icon: <XCircle size={11} /> },
};

const NAV_ITEMS = [
  { href: '/vendor/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/vendor/bookings',     icon: <CalendarCheck size={18} />,   label: 'Booking Masuk' },
  { href: '/vendor/services',     icon: <Package size={18} />,         label: 'Layanan Saya' },
  { href: '/vendor/availability', icon: <CalendarDays size={18} />,    label: 'Ketersediaan' },
  { href: '/vendor/analytics',    icon: <BarChart2 size={18} />,       label: 'Statistik' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  return formatDate(d);
}

function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #f0efeb 25%, #e8e7e3 50%, #f0efeb 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color, loading }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
  color: string; loading: boolean;
}) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '20px 22px', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {icon}
        </div>
      </div>
      {loading
        ? <Skeleton h={32} r={6} />
        : <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
      }
      {sub && !loading && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  );
}

function Sidebar({ active, onLogout, vendor, sidebarOpen, setSidebarOpen }: {
  active: string; onLogout: () => void;
  vendor: VendorProfile | null;
  sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void;
}) {
  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30, backdropFilter: 'blur(2px)' }} />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: 240,
        background: 'var(--forest)', display: 'flex', flexDirection: 'column',
        zIndex: 40, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
      }}
        className="vendor-sidebar"
      >
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <img src="/logo_findor.jpg" alt="Findor" style={{ height: 30, objectFit: 'contain', borderRadius: 6 }} />
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            VENDOR PORTAL
          </div>
          {vendor ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {vendor.store_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {vendor.is_verified
                  ? <><ShieldCheck size={12} color="#34d399" /><span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>Terverifikasi</span></>
                  : <><ShieldAlert size={12} color="#fbbf24" /><span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>Belum Terverifikasi</span></>
                }
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton h={14} r={4} />
              <Skeleton w="60%" h={12} r={4} />
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = active === item.href;
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                  fontWeight: isActive ? 600 : 400, fontSize: 14,
                  transition: 'all 0.15s',
                  borderLeft: isActive ? '3px solid var(--amber)' : '3px solid transparent',
                }}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {vendor && (
            <Link href={`/vendor/${vendor.slug}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', marginBottom: 6 }}>
              <ExternalLink size={14} /> Lihat Halaman Toko
            </Link>
          )}
          <button onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 13, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          .vendor-sidebar { transform: translateX(0) !important; box-shadow: none !important; }
          .vendor-main { margin-left: 240px !important; }
        }
      `}</style>
    </>
  );
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const meRes = await fetch('/api/v1/auth/me');
      const meData = await meRes.json();

      if (!meData.success) { router.replace('/login'); return; }
      if (meData.data.role !== 'vendor') { router.replace('/dashboard'); return; }
      if (!meData.data.vendor) { router.replace('/dashboard'); return; }

      const v = meData.data.vendor as VendorProfile;
      setVendor(v);
      const bookRes = await fetch('/api/v1/bookings?role=vendor&per_page=8');
      const bookData = await bookRes.json();
      const bookings: BookingItem[] = bookData.success ? (bookData.data?.data ?? []) : [];
      setRecentBookings(bookings);
      const pending   = bookings.filter(b => b.status === 'pending').length;
      const confirmed = bookings.filter(b => ['confirmed', 'waiting_payment', 'dp_verified'].includes(b.status)).length;
      const completed = bookings.filter(b => b.status === 'completed').length;

      setStats({
        total_bookings: bookData.data?.total ?? bookings.length,
        pending,
        confirmed,
        completed,
        rating_avg: v.rating_avg,
        review_count: v.review_count,
      });

    } catch {
      setError('Gagal memuat data. Coba refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const needAction = recentBookings.filter(b => b.status === 'pending');
  const activeBookings = recentBookings.filter(b =>
    ['confirmed', 'waiting_payment', 'dp_verified'].includes(b.status)
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar
        active="/vendor/dashboard"
        onLogout={handleLogout}
        vendor={vendor}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="vendor-main" style={{ marginLeft: 0, minHeight: '100vh', transition: 'margin-left 0.3s' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(249,249,247,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--gray-100)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 10, padding: 9, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', boxShadow: 'var(--shadow-sm)' }}>
              <Menu size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Dashboard</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ringkasan performa toko Anda</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {vendor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 12, padding: '8px 14px', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  <Store size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {vendor.store_name.length > 18 ? vendor.store_name.slice(0, 18) + '…' : vendor.store_name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{vendor.category}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main style={{ padding: '28px 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={16} /> {error}
              <button onClick={loadDashboard} style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Coba lagi</button>
            </div>
          )}

          {vendor && (!vendor.is_active || !vendor.is_verified) && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <ShieldAlert size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>
                  {!vendor.is_verified ? 'Akun sedang dalam proses verifikasi' : 'Toko Anda belum aktif'}
                </div>
                <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
                  {!vendor.is_verified
                    ? 'Tim Findor sedang mereview dokumen Anda. Proses biasanya memakan waktu 1–2 hari kerja. Anda akan mendapat notifikasi setelah disetujui.'
                    : 'Hubungi admin Findor untuk mengaktifkan toko Anda.'}
                </div>
              </div>
            </div>
          )}

          {needAction.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-light) 100%)', borderRadius: 16, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={20} color="var(--forest)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {needAction.length} booking baru menunggu konfirmasi
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>Segera konfirmasi sebelum klien menunggu terlalu lama</div>
                </div>
              </div>
              <Link href="/vendor/bookings" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--amber)', color: 'var(--forest)', borderRadius: 100, padding: '9px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                Lihat Sekarang <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}
            className="stats-grid">
            <StatCard icon={<Receipt size={16} />} label="Total Booking" loading={loading}
              value={loading ? '—' : (stats?.total_bookings ?? 0)}
              sub="Sepanjang waktu" color="var(--forest)" />
            <StatCard icon={<Clock size={16} />} label="Menunggu Aksi" loading={loading}
              value={loading ? '—' : (stats?.pending ?? 0)}
              sub={stats?.pending ? 'Perlu dikonfirmasi' : 'Semua sudah ditangani'} color="#f59e0b" />
            <StatCard icon={<CalendarCheck size={16} />} label="Booking Aktif" loading={loading}
              value={loading ? '—' : (stats?.confirmed ?? 0)}
              sub="Confirmed & DP" color="#3b82f6" />
            <StatCard icon={<Star size={16} />} label="Rating Toko" loading={loading}
              value={loading ? '—' : (stats?.rating_avg ? stats.rating_avg.toFixed(1) : '—')}
              sub={stats?.review_count ? `dari ${stats.review_count} ulasan` : 'Belum ada ulasan'} color="#8b5cf6" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}
            className="dashboard-cols">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Booking Terbaru</h2>
                <Link href="/vendor/bookings" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
                  Lihat Semua <ChevronRight size={15} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Skeleton h={14} r={6} />
                      <Skeleton w="60%" h={12} r={6} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Skeleton w={80} h={24} r={12} />
                        <Skeleton w={100} h={24} r={12} />
                      </div>
                    </div>
                  ))
                ) : recentBookings.length === 0 ? (
                  <div style={{ background: 'white', borderRadius: 16, padding: '40px 24px', border: '1px solid var(--gray-100)', textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <CalendarCheck size={22} color="var(--text-muted)" />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Belum ada booking</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Booking dari klien akan muncul di sini</p>
                  </div>
                ) : (
                  recentBookings.map(b => (
                    <div key={b.id}
                      style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                      onClick={() => router.push('/vendor/bookings')}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.event_name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            dari <strong style={{ color: 'var(--text-secondary)' }}>{b.user?.full_name ?? b.user?.email ?? 'Klien'}</strong>
                          </div>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        {b.service && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Package size={11} color="var(--text-muted)" /> {b.service.name}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CalendarDays size={11} color="var(--text-muted)" /> {formatDate(b.event_date)}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {timeAgo(b.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-light) 100%)', padding: '20px 20px 36px', position: 'relative' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Profil Toko</div>
                  {loading
                    ? <Skeleton h={18} r={6} />
                    : <div style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendor?.store_name}</div>
                  }
                </div>
                <div style={{ padding: '0 20px 20px', marginTop: -18 }}>
                  <div style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid var(--gray-100)', marginBottom: 14 }}>
                    {loading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Skeleton h={12} r={4} /><Skeleton w="70%" h={12} r={4} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 20 }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{vendor?.rating_avg?.toFixed(1) ?? '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rating</div>
                        </div>
                        <div style={{ width: 1, background: 'var(--gray-100)' }} />
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{vendor?.review_count ?? 0}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ulasan</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {!loading && vendor && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Store size={12} color="var(--text-muted)" /> {vendor.category}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <MapPin size={12} color="var(--text-muted)" /> {vendor.city}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: '18px 18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Aksi Cepat</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { href: '/vendor/bookings', icon: <CalendarCheck size={15} />, label: 'Kelola Booking', desc: 'Konfirmasi & lacak status', color: '#dbeafe', ic: '#1d4ed8' },
                    { href: '/vendor/services', icon: <Package size={15} />, label: 'Kelola Layanan', desc: 'Tambah atau edit paket', color: '#dcfce7', ic: '#16a34a' },
                    { href: '/vendor/availability', icon: <CalendarDays size={15} />, label: 'Set Ketersediaan', desc: 'Tandai tanggal available', color: '#ede9fe', ic: '#7c3aed' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--gray-50)', border: '1px solid var(--gray-100)', textDecoration: 'none', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = item.color; (e.currentTarget as HTMLElement).style.borderColor = item.color; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gray-50)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gray-100)'; }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.ic, flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </Link>
                  ))}
                </div>
              </div>

              {!loading && activeBookings.length > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: 'var(--radius-lg)', border: '1px solid #bfdbfe', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <TrendingUp size={15} color="#1d4ed8" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a' }}>{activeBookings.length} Booking Sedang Berjalan</span>
                  </div>
                  {activeBookings.slice(0, 3).map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#1e40af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{b.event_name}</span>
                      <span style={{ fontSize: 11, color: '#3b82f6', whiteSpace: 'nowrap', flexShrink: 0 }}>{formatDate(b.event_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dashboard-cols { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}