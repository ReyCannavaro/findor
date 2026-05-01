'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays, Heart, Star, ChevronRight, MapPin,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
  User, Store, ArrowRight, Package, Receipt,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import type { BookingStatus } from '@/types';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  vendor?: {
    id: string;
    store_name: string;
    slug: string;
    category: string;
    city: string;
    is_verified: boolean;
    is_active: boolean;
    rating_avg: number;
    review_count: number;
  } | null;
}

interface BookingItem {
  id: string;
  event_date: string;
  event_name: string;
  event_location: string;
  status: BookingStatus;
  created_at: string;
  service: { id: string; name: string; category: string };
  vendor: { id: string; store_name: string; slug: string; whatsapp_number: string; city: string };
}

interface BookmarkItem {
  id: string;
  created_at: string;
  vendor: {
    id: string;
    store_name: string;
    slug: string;
    category: string;
    city: string;
    rating_avg: number;
    review_count: number;
    is_verified: boolean;
  };
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:         { label: 'Menunggu',       color: '#92400E', bg: '#FEF3C7', icon: <Clock size={12} /> },
  confirmed:       { label: 'Dikonfirmasi',   color: '#1E40AF', bg: '#DBEAFE', icon: <CheckCircle2 size={12} /> },
  waiting_payment: { label: 'Bayar DP',       color: '#7C3AED', bg: '#EDE9FE', icon: <AlertCircle size={12} /> },
  dp_verified:     { label: 'DP Terverifikasi', color: '#065F46', bg: '#D1FAE5', icon: <CheckCircle2 size={12} /> },
  completed:       { label: 'Selesai',         color: '#064E3B', bg: '#D1FAE5', icon: <CheckCircle2 size={12} /> },
  rejected:        { label: 'Ditolak',         color: '#991B1B', bg: '#FEE2E2', icon: <XCircle size={12} /> },
  cancelled:       { label: 'Dibatalkan',      color: '#374151', bg: '#F3F4F6', icon: <XCircle size={12} /> },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, padding: '4px 10px',
      borderRadius: 100, background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  return formatDate(dateStr);
}

function Skeleton({ w = '100%', h = 16, radius = 8 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, #f0f0ec 25%, #e8e8e4 50%, #f0f0ec 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

function StatCard({ icon, label, value, sub, href }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        className="stat-card"
        style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #EBEBEB',
          padding: '20px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'all 0.22s',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#F3F9F5', display: 'grid', placeItems: 'center',
          color: '#1C3D2E', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1, fontFamily: 'Fraunces, serif' }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{sub}</div>}
        </div>
        <ChevronRight size={16} color="#D1D5DB" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, bookingsRes, bookmarksRes] = await Promise.all([
          fetch('/api/v1/auth/me'),
          fetch('/api/v1/bookings?per_page=5'),
          fetch('/api/v1/bookmarks?per_page=3'),
        ]);

        if (meRes.status === 401) { router.push('/login'); return; }

        const [meData, bookingsData, bookmarksData] = await Promise.all([
          meRes.json(), bookingsRes.json(), bookmarksRes.json(),
        ]);

        if (!meData.success) throw new Error(meData.error ?? 'Gagal memuat profil');

        setUser(meData.data);
        setBookings(bookingsData.data?.bookings ?? []);
        setBookmarks(bookmarksData.data?.bookmarks ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const stats = bookings.reduce(
    (acc, b) => {
      acc.total++;
      if (b.status === 'completed') acc.completed++;
      if (['pending', 'confirmed', 'waiting_payment', 'dp_verified'].includes(b.status)) acc.active++;
      return acc;
    },
    { total: 0, completed: 0, active: 0 }
  );

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,300&display=swap');
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .stat-card:hover { border-color: #C7DDD1 !important; box-shadow: 0 4px 20px rgba(28,61,46,0.09); transform: translateY(-2px); }
        .booking-row:hover { background: #FAFAF8 !important; }
        .bookmark-card:hover { border-color: #C7DDD1 !important; box-shadow: 0 4px 20px rgba(28,61,46,0.08); transform: translateY(-2px); }
        .section-animate { animation: fadeUp 0.5s ease both; }
      `}</style>

      <Navbar />

      <main style={{ minHeight: '100vh', background: '#F7F7F4', paddingTop: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#991B1B', fontSize: 14 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingTop: 12 }} className="section-animate">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1C3D2E 0%, #2D6A4F 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0,
                boxShadow: '0 2px 12px rgba(28,61,46,0.25)',
              }}>
                {loading ? '?' : initials}
              </div>
              <div>
                {loading ? (
                  <>
                    <Skeleton w={160} h={22} />
                    <div style={{ marginTop: 6 }}><Skeleton w={120} h={14} /></div>
                  </>
                ) : (
                  <>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif' }}>
                      Halo, {user?.full_name?.split(' ')[0] ?? 'Pengguna'} 👋
                    </h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '2px 0 0' }}>{user?.email}</p>
                  </>
                )}
              </div>
            </div>

            <Link href="/profile" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontSize: 13, fontWeight: 600, color: '#1C3D2E',
              background: '#fff', border: '1px solid #EBEBEB',
              borderRadius: 100, padding: '9px 18px',
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              <User size={14} /> Edit Profil
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }} className="section-animate">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '20px 22px' }}>
                  <Skeleton w={44} h={44} radius={12} />
                  <div style={{ marginTop: 12 }}><Skeleton w="60%" h={14} /></div>
                  <div style={{ marginTop: 8 }}><Skeleton w="40%" h={24} /></div>
                </div>
              ))
            ) : (
              <>
                <StatCard icon={<Receipt size={20} />} label="Total Booking" value={stats.total} sub="Sepanjang waktu" href="/bookings" />
                <StatCard icon={<CalendarDays size={20} />} label="Booking Aktif" value={stats.active} sub="Sedang berjalan" href="/bookings" />
                <StatCard icon={<Heart size={20} />} label="Tersimpan" value={bookmarks.length} sub="Vendor favorit" href="/bookmarks" />
              </>
            )}
          </div>

          {!loading && user?.vendor && (
            <div style={{
              background: 'linear-gradient(115deg, #1C3D2E 0%, #2D6A4F 100%)',
              borderRadius: 16, padding: '20px 24px', marginBottom: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }} className="section-animate">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Store size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{user.vendor.store_name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={11} fill="#F5A623" color="#F5A623" /> {user.vendor.rating_avg.toFixed(1)}
                    <span style={{ opacity: 0.4 }}>·</span>
                    {user.vendor.review_count} ulasan
                    <span style={{ opacity: 0.4 }}>·</span>
                    {user.vendor.city}
                    {user.vendor.is_verified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 100, padding: '2px 8px', fontSize: 11, color: '#86EFAC' }}>
                        <CheckCircle2 size={10} /> Terverifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link href="/vendor/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#F5A623', color: '#1C3D2E', fontWeight: 700, fontSize: 13,
                borderRadius: 100, padding: '10px 18px', textDecoration: 'none',
                flexShrink: 0,
              }}>
                Dashboard Vendor <ArrowRight size={14} />
              </Link>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB', overflow: 'hidden' }} className="section-animate">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif' }}>Booking Terbaru</h2>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>5 booking terakhir kamu</p>
                </div>
                <Link href="/bookings" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#1C3D2E', textDecoration: 'none' }}>
                  Lihat Semua <ChevronRight size={15} />
                </Link>
              </div>

              {loading ? (
                <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12 }}>
                      <Skeleton w={40} h={40} radius={10} />
                      <div style={{ flex: 1 }}>
                        <Skeleton w="70%" h={14} />
                        <div style={{ marginTop: 6 }}><Skeleton w="50%" h={12} /></div>
                      </div>
                      <Skeleton w={80} h={24} radius={100} />
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div style={{ padding: '48px 22px', textAlign: 'center' }}>
                  <Package size={32} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Belum ada booking</div>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Temukan vendor event terbaik dan mulai pesan sekarang.</p>
                  <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#1C3D2E', background: '#F3F9F5', borderRadius: 100, padding: '9px 18px', textDecoration: 'none' }}>
                    Cari Vendor <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div>
                  {bookings.map((b, i) => (
                    <Link key={b.id} href={`/bookings`} style={{ textDecoration: 'none' }}>
                      <div
                        className="booking-row"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 22px',
                          borderBottom: i < bookings.length - 1 ? '1px solid #F9F9F7' : 'none',
                          transition: 'background 0.15s', cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: '#F3F9F5', display: 'grid', placeItems: 'center',
                          color: '#1C3D2E',
                        }}>
                          <CalendarDays size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {b.event_name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>{b.vendor?.store_name}</span>
                            <span style={{ fontSize: 10, color: '#D1D5DB' }}>·</span>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>{formatDate(b.event_date)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <StatusBadge status={b.status} />
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(b.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB', padding: '20px 22px' }} className="section-animate">
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 14px', fontFamily: 'Fraunces, serif' }}>Akses Cepat</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: <CalendarDays size={16} />, label: 'Semua Booking', sub: 'Kelola jadwal event', href: '/bookings' },
                    { icon: <Heart size={16} />, label: 'Wishlist Vendor', sub: 'Vendor tersimpan', href: '/bookmarks' },
                    { icon: <User size={16} />, label: 'Profil Saya', sub: 'Edit info akun', href: '/profile' },
                    { icon: <Store size={16} />, label: 'Daftar Vendor', sub: 'Kelola toko kamu', href: '/vendor/dashboard' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 12,
                        transition: 'background 0.15s', cursor: 'pointer',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F7F7F4')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F3F9F5', display: 'grid', placeItems: 'center', color: '#1C3D2E', flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.sub}</div>
                        </div>
                        <ChevronRight size={14} color="#D1D5DB" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB', overflow: 'hidden' }} className="section-animate">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F3F4F6' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif' }}>Vendor Tersimpan</h2>
                  <Link href="/bookmarks" style={{ fontSize: 12, fontWeight: 600, color: '#1C3D2E', textDecoration: 'none' }}>Lihat Semua</Link>
                </div>

                {loading ? (
                  <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10 }}>
                        <Skeleton w={40} h={40} radius={10} />
                        <div style={{ flex: 1 }}><Skeleton w="80%" h={13} /><div style={{ marginTop: 5 }}><Skeleton w="55%" h={11} /></div></div>
                      </div>
                    ))}
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                    <Heart size={24} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Belum ada vendor tersimpan.</p>
                  </div>
                ) : (
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {bookmarks.map(bm => (
                      <Link key={bm.id} href={`/vendor/${bm.vendor.slug}`} style={{ textDecoration: 'none' }}>
                        <div
                          className="bookmark-card"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px', borderRadius: 12,
                            border: '1px solid transparent',
                            transition: 'all 0.2s', cursor: 'pointer',
                          }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, background: '#F3F9F5',
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                            fontSize: 16, fontWeight: 700, color: '#1C3D2E',
                            fontFamily: 'Fraunces, serif',
                          }}>
                            {bm.vendor.store_name.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {bm.vendor.store_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                              <MapPin size={10} color="#9CA3AF" />
                              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{bm.vendor.city}</span>
                              <span style={{ fontSize: 10, color: '#D1D5DB' }}>·</span>
                              <Star size={10} fill="#F5A623" color="#F5A623" />
                              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{bm.vendor.rating_avg.toFixed(1)}</span>
                            </div>
                          </div>
                          <ChevronRight size={13} color="#D1D5DB" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div style={{
            marginTop: 32,
            background: 'linear-gradient(115deg, #1C3D2E 0%, #2D6A4F 100%)',
            borderRadius: 20, padding: '28px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }} className="section-animate">
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: '0 0 6px', fontFamily: 'Fraunces, serif' }}>
                Cari vendor untuk event selanjutnya?
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                Temukan ratusan vendor terverifikasi dari seluruh Indonesia.
              </p>
            </div>
            <Link href="/search" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#F5A623', color: '#1C3D2E', fontWeight: 700, fontSize: 14,
              borderRadius: 100, padding: '12px 24px', textDecoration: 'none', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
            }}>
              Jelajahi Vendor <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}