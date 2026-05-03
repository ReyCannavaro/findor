'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp, Star, Calendar, CheckCircle, Clock,
  XCircle, ArrowRight, BarChart2, Package,
  ChevronUp, ChevronDown, AlertCircle, Loader2,
  RefreshCw, Award, MapPin,
} from 'lucide-react';
import Navbar from '@/components/navbar';

interface AnalyticsData {
  vendor: {
    id: string;
    store_name: string;
    city: string;
    category: string;
    is_verified: boolean;
  };
  summary: {
    total: number;
    pending: number;
    confirmed: number;
    waiting_payment: number;
    dp_verified: number;
    completed: number;
    rejected: number;
    cancelled: number;
    completion_rate: number;
  };
  growth: {
    current_month: number;
    prev_month: number;
    pct: number;
  };
  monthly_bookings: {
    month: string;
    label: string;
    total: number;
    completed: number;
  }[];
  status_distribution: { status: string; count: number }[];
  services_performance: {
    id: string;
    name: string;
    category: string;
    price_min: number;
    price_max: number | null;
    is_active: boolean;
    total_bookings: number;
    completed_bookings: number;
  }[];
  reviews: {
    rating_avg: number;
    review_count: number;
    rating_distribution: { star: number; count: number }[];
    recent: {
      id: string;
      rating: number;
      comment: string | null;
      created_at: string;
      user: { id: string; full_name: string | null; avatar_url: string | null } | null;
    }[];
  };
  upcoming: {
    id: string;
    event_date: string;
    event_name: string;
    event_location: string;
    status: string;
    service: { id: string; name: string; category: string } | null;
    user: { id: string; full_name: string | null } | null;
  }[];
  booking_by_day: { label: string; count: number }[];
  meta: {
    year: number;
    months: number;
    generated_at: string;
  };
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)     return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30)  return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function Sparkline({ data, color = '#0d3b2e' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 80, H = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  }).join(' ');
  const lastPt = pts.split(' ')[pts.split(' ').length - 1];
  const [lx, ly] = lastPt.split(',');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={3} fill={color} />
    </svg>
  );
}

function GrowthBadge({ pct }: { pct: number }) {
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5,
      fontWeight: 700, padding: '3px 8px', borderRadius: 999,
      background: up ? '#f0fdf4' : '#fef2f2',
      color: up ? '#16a34a' : '#dc2626',
    }}>
      {up ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      {up ? '+' : ''}{pct}%
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, sparkData, color = '#0d3b2e', badge }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string; value: string | number; sub?: string;
  sparkData?: number[]; color?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px 22px',
      border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'grid', placeItems: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        {badge}
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1, fontFamily: 'Fraunces, serif' }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</p>}
      </div>
      {sparkData && <Sparkline data={sparkData} color={color} />}
    </div>
  );
}

function SectionCard({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f8fafc' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Fraunces, serif' }}>{title}</h3>
        {action}
      </div>
      <div style={{ padding: '16px 22px' }}>{children}</div>
    </div>
  );
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:         { label: 'Menunggu',       color: '#d97706' },
  confirmed:       { label: 'Dikonfirmasi',   color: '#2563eb' },
  waiting_payment: { label: 'Bayar DP',       color: '#7c3aed' },
  dp_verified:     { label: 'DP Verified',    color: '#059669' },
  completed:       { label: 'Selesai',        color: '#16a34a' },
  rejected:        { label: 'Ditolak',        color: '#dc2626' },
  cancelled:       { label: 'Dibatalkan',     color: '#6b7280' },
};

export default function VendorAnalyticsPage() {
  const router = useRouter();
  const [data, setData]           = useState<AnalyticsData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [months, setMonths]       = useState(6);

  const fetchAnalytics = useCallback(async (m = months) => {
    try {
      setError(null);
      const res  = await fetch(`/api/v1/vendors/analytics?months=${m}`);
      const json = await res.json();
      if (res.status === 401) { router.push('/login?redirect=/vendor/analytics'); return; }
      if (res.status === 403) { router.push('/vendor/register'); return; }
      if (!json.success) throw new Error(json.error ?? 'Gagal memuat data');
      setData(json.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
    }
  }, [router, months]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAnalytics();
      setLoading(false);
    })();
  }, [fetchAnalytics]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleMonthsChange = async (m: number) => {
    setMonths(m);
    setRefreshing(true);
    await fetchAnalytics(m);
    setRefreshing(false);
  };

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '110px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 140, borderRadius: 16, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ height: 220, borderRadius: 16, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 16 }} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </main>
  );

  if (error) return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#dc2626" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Gagal Memuat Data</p>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>{error}</p>
        <button onClick={handleRefresh} style={{ padding: '10px 24px', background: '#0d3b2e', color: 'white', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>
          Coba Lagi
        </button>
      </div>
    </main>
  );

  if (!data) return null;

  const { summary, growth, monthly_bookings, services_performance, reviews, upcoming, booking_by_day } = data;
  const sparkData = monthly_bookings.map(m => m.total);
  const maxBarCount = Math.max(...monthly_bookings.map(m => m.total), 1);
  const maxDayCount = Math.max(...booking_by_day.map(d => d.count), 1);
  const maxServiceCount = Math.max(...services_performance.map(s => s.total_bookings), 1);

  return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&display=swap');
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>
          <Link href="/vendor/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
          <ArrowRight size={12} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Statistik Toko</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0d3b2e', display: 'grid', placeItems: 'center' }}>
                <BarChart2 size={18} color="white" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', fontFamily: 'Fraunces, serif' }}>
                Statistik Toko
              </h1>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              {data.vendor.store_name}
              {data.vendor.is_verified && (
                <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>
                  ✓ Terverifikasi
                </span>
              )}
              <span style={{ color: '#cbd5e1', fontSize: 10 }}>·</span>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> {data.vendor.city}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4, background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 4 }}>
              {[3, 6, 12].map(m => (
                <button key={m} onClick={() => handleMonthsChange(m)}
                  style={{
                    padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    background: months === m ? '#0d3b2e' : 'transparent',
                    color: months === m ? 'white' : '#64748b',
                    transition: 'all 0.15s',
                  }}>
                  {m}B
                </button>
              ))}
            </div>

            <button onClick={handleRefresh} disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 10, background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 13, fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}>
              {refreshing
                ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} color="#9ca3af" />
                : <RefreshCw size={14} />}
              Refresh
            </button>
          </div>
        </div>

        {summary.total === 0 && reviews.review_count === 0 && (
          <div style={{ background: 'white', borderRadius: 20, border: '1.5px dashed #e5e7eb', padding: '56px 24px', textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <BarChart2 size={26} color="#0d3b2e" />
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6, fontFamily: 'Fraunces, serif' }}>Statistik Belum Tersedia</p>
            <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 360, margin: '0 auto' }}>
              Data statistik akan muncul setelah kamu menerima booking pertama dari klien.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard
            icon={TrendingUp} label="Total Booking" value={summary.total}
            sub={`${growth.current_month} bulan ini`} color="#0d3b2e"
            sparkData={sparkData}
            badge={<GrowthBadge pct={growth.pct} />}
          />
          <StatCard
            icon={CheckCircle} label="Selesai" value={summary.completed}
            sub={`${summary.completion_rate}% completion rate`} color="#16a34a"
            badge={summary.completed > 0
              ? <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: summary.completion_rate >= 70 ? '#f0fdf4' : '#fef3c7', color: summary.completion_rate >= 70 ? '#16a34a' : '#d97706' }}>{summary.completion_rate}%</span>
              : null}
          />
          <StatCard
            icon={Clock} label="Aktif" value={summary.pending + summary.confirmed + summary.waiting_payment + summary.dp_verified}
            sub="Pending + Confirmed + DP" color="#0369a1"
            badge={(summary.pending + summary.confirmed + summary.waiting_payment + summary.dp_verified) > 0
              ? <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#eff6ff', color: '#2563eb' }}>Live</span>
              : null}
          />
          <StatCard
            icon={Star} label="Rating" value={Number(reviews.rating_avg).toFixed(1)}
            sub={`${reviews.review_count} ulasan`} color="#f97316"
            badge={reviews.review_count > 0
              ? <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: reviews.rating_avg >= 4.5 ? '#fff7ed' : '#f8fafc', color: reviews.rating_avg >= 4.5 ? '#ea580c' : '#64748b' }}>
                  {reviews.rating_avg >= 4.5 ? '★ Top' : `${Number(reviews.rating_avg).toFixed(1)}★`}
                </span>
              : null}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
          <SectionCard title={`Booking ${months} Bulan Terakhir`}>
            {monthly_bookings.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Belum ada data</p>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, marginBottom: 10 }}>
                  {monthly_bookings.map(m => (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{m.total || ''}</span>
                      <div style={{ width: '100%', position: 'relative', borderRadius: '6px 6px 0 0', overflow: 'hidden', height: `${Math.max((m.total / maxBarCount) * 100, m.total > 0 ? 8 : 0)}%`, minHeight: m.total > 0 ? 6 : 0, background: '#e2e8f0' }}>
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: `${m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0}%`,
                          background: '#0d3b2e', borderRadius: '4px 4px 0 0',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {monthly_bookings.map(m => (
                    <div key={m.month} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: '#94a3b8' }}>{m.label}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0d3b2e' }} /> Selesai
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#e2e8f0' }} /> Total
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Distribusi Status">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.status_distribution.map(s => {
                const pctVal = summary.total > 0 ? Math.round((s.count / summary.total) * 100) : 0;
                const cfg = STATUS_LABEL[s.status] ?? { label: s.status, color: '#94a3b8' };
                return (
                  <div key={s.status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{s.count} ({pctVal}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pctVal}%`, background: cfg.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
              {data.status_distribution.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Belum ada booking</p>
              )}
            </div>
          </SectionCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>
          <SectionCard title="Performa Layanan">
            {services_performance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Package size={28} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8', fontSize: 13 }}>Belum ada layanan aktif</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {services_performance.slice(0, 6).map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', width: 20, textAlign: 'right', flexShrink: 0 }}>#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{s.name}</span>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#0d3b2e' }}>{s.total_bookings} booking</span>
                          {!s.is_active && <span style={{ fontSize: 10, color: '#9ca3af', background: '#f3f4f6', borderRadius: 4, padding: '1px 6px' }}>Nonaktif</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.round((s.total_bookings / maxServiceCount) * 100)}%`, background: '#0d3b2e', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
                          {s.total_bookings > 0 ? Math.round((s.completed_bookings / s.total_bookings) * 100) : 0}% selesai
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {formatPrice(s.price_min)}{s.price_max ? ` – ${formatPrice(s.price_max)}` : '+'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Booking per Hari">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {booking_by_day.map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', width: 28, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((d.count / maxDayCount) * 100)}%`, background: '#0d3b2e', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', width: 20, textAlign: 'right', flexShrink: 0 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <SectionCard
            title="Event Mendatang"
            action={<Link href="/vendor/bookings" style={{ fontSize: 12, color: '#0d3b2e', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Lihat Semua <ArrowRight size={12} /></Link>}
          >
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Calendar size={24} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Tidak ada event mendatang</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(b => {
                  const dl = daysLeft(b.event_date);
                  const urgency = dl <= 3 ? '#dc2626' : dl <= 7 ? '#d97706' : '#0d3b2e';
                  return (
                    <div key={b.id} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, flex: 1 }}>
                          {b.event_name.length > 26 ? b.event_name.slice(0, 26) + '…' : b.event_name}
                        </p>
                        <span style={{ fontSize: 11, fontWeight: 700, color: urgency, background: `${urgency}18`, padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>
                          {dl === 0 ? 'Hari ini' : dl === 1 ? 'Besok' : `${dl}h lagi`}
                        </span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                        {new Date(b.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        {b.service && ` · ${b.service.name.length > 18 ? b.service.name.slice(0, 18) + '…' : b.service.name}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Ulasan Terbaru">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: 'Fraunces, serif' }}>{Number(reviews.rating_avg).toFixed(1)}</p>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', margin: '4px 0' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} fill={s <= Math.round(reviews.rating_avg) ? '#f97316' : '#e2e8f0'} color={s <= Math.round(reviews.rating_avg) ? '#f97316' : '#e2e8f0'} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>{reviews.review_count} ulasan</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {reviews.rating_distribution.map(d => (
                  <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8', width: 16, textAlign: 'right' }}>{d.star}</span>
                    <Star size={9} fill="#f97316" color="#f97316" />
                    <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${reviews.review_count > 0 ? Math.round((d.count / reviews.review_count) * 100) : 0}%`, background: '#f97316', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8', width: 16 }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {reviews.recent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <Award size={24} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada ulasan</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.recent.slice(0, 3).map(r => (
                  <div key={r.id} style={{ paddingBottom: 12, borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0d3b2e', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {(r.user?.full_name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                          {r.user?.full_name ?? 'Pengguna'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ display: 'flex', gap: 1 }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={10} fill={s <= r.rating ? '#f97316' : '#e2e8f0'} color={s <= r.rating ? '#f97316' : '#e2e8f0'} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(r.created_at)}</span>
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, overflow: 'hidden', maxHeight: '2.8em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          Data diperbarui: {data.meta.generated_at ? new Date(data.meta.generated_at).toLocaleString('id-ID') : '-'}
          <span style={{ margin: '0 8px', color: '#e2e8f0' }}>·</span>
          Menampilkan {data.meta.months} bulan terakhir
        </p>

      </div>
    </main>
  );
}