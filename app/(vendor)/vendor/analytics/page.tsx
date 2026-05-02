'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp, Star, Calendar, CheckCircle, Clock,
  XCircle, ArrowRight, BarChart2, Users, Package,
  ChevronUp, ChevronDown, Minus, AlertCircle, Loader2,
  RefreshCw, Award, ThumbsUp,
} from 'lucide-react';
import Navbar from '@/components/navbar';

interface Booking {
  id: string;
  event_date: string;
  status: string;
  created_at: string;
  service: { id: string; name: string; category: string } | null;
  user: { id: string; full_name: string | null; email: string } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: { id: string; full_name: string | null } | null;
}

interface VendorProfile {
  id: string;
  store_name: string;
  rating_avg: number;
  review_count: number;
  is_verified: boolean;
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}rb`;
  return n.toLocaleString('id-ID');
}

function getMonthKey(iso: string) { return iso.slice(0, 7); }

function monthLabel(key: string) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}

function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round((a / b) * 100);
}

function diffBadge(current: number, prev: number) {
  if (prev === 0 && current === 0) return null;
  if (prev === 0) return { label: '+100%', up: true };
  const d = current - prev;
  const p = Math.round(Math.abs(d / prev) * 100);
  return { label: `${d >= 0 ? '+' : '-'}${p}%`, up: d >= 0 };
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

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(' ').at(-1)!.split(',')[0]} cy={pts.split(' ').at(-1)!.split(',')[1]} r={3} fill={color} />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, sub, sparkData, color = '#0d3b2e', badge }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string; value: string | number; sub?: string;
  sparkData?: number[]; color?: string;
  badge?: { label: string; up: boolean } | null;
}) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'grid', placeItems: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        {badge && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: badge.up ? '#f0fdf4' : '#fef2f2', color: badge.up ? '#16a34a' : '#dc2626' }}>
            {badge.up ? <ChevronUp size={11} /> : <ChevronDown size={11} />} {badge.label}
          </span>
        )}
        {badge === null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: '#f8fafc', color: '#94a3b8' }}>
            <Minus size={11} /> —
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>{value}</p>
        <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{sub}</p>}
      </div>
      {sparkData && sparkData.some(v => v > 0) && (
        <div style={{ marginTop: -4 }}>
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}

function BarChart({ data, label, color = '#0d3b2e' }: {
  data: { key: string; value: number; label: string }[];
  label: string; color?: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map(({ key, value, label: lbl }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b', width: 64, flexShrink: 0, textAlign: 'right', fontWeight: 500 }}>{lbl}</span>
            <div style={{ flex: 1, height: 22, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct(value, max)}%`, background: color, borderRadius: 6, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)', minWidth: value > 0 ? 4 : 0 }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', width: 28, textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada data</p>
    </div>
  );

  const R = 48, CX = 60, CY = 60, stroke = 18;
  let cumAngle = -90;
  const arcs = segments.filter(s => s.value > 0).map(seg => {
    const angle = (seg.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    const startRad = (start * Math.PI) / 180;
    const endRad = (cumAngle * Math.PI) / 180;
    const x1 = CX + R * Math.cos(startRad);
    const y1 = CY + R * Math.sin(startRad);
    const x2 = CX + R * Math.cos(endRad);
    const y2 = CY + R * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    return { ...seg, d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z` };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill={arc.color} opacity={0.9} />
        ))}
        <circle cx={CX} cy={CY} r={R - stroke} fill="white" />
        <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={800} fill="#0f172a">{total}</text>
        <text x={CX} y={CY + 15} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#94a3b8">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {segments.map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: '#475569', flex: 1 }}>{label}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{value}</span>
            <span style={{ fontSize: 11, color: '#94a3b8', width: 32, textAlign: 'right' }}>{pct(value, total)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} fill={i <= Math.round(rating) ? '#f97316' : 'none'} color={i <= Math.round(rating) ? '#f97316' : '#d1d5db'} />
      ))}
    </span>
  );
}

export default function VendorAnalyticsPage() {
  const router = useRouter();

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetchAll = useCallback(async (vendorId: string) => {
    try {
      const [bRes, rRes] = await Promise.all([
        fetch('/api/v1/bookings?role=vendor&per_page=50'),
        fetch(`/api/v1/reviews/vendor/${vendorId}?per_page=50`),
      ]);
      const [bData, rData] = await Promise.all([bRes.json(), rRes.json()]);
      if (bData.success) setBookings(bData.data.bookings ?? []);
      if (rData.success) setReviews(rData.data.reviews ?? []);
      setLastUpdated(new Date());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        const data = await res.json();
        if (!data.success) { router.push('/login?redirect=/vendor/analytics'); return; }
        if (data.data.role !== 'vendor' && data.data.role !== 'admin') { router.push('/profile'); return; }
        if (!data.data.vendor) { router.push('/profile'); return; }
        setVendor(data.data.vendor);
        await fetchAll(data.data.vendor.id);
      } catch { /* silent */ }
      finally { setPageLoading(false); }
    })();
  }, [router, fetchAll]);

  const handleRefresh = async () => {
    if (!vendor || refreshing) return;
    setRefreshing(true);
    await fetchAll(vendor.id);
    setRefreshing(false);
  };
  const byStatus = {
    pending:         bookings.filter(b => b.status === 'pending').length,
    confirmed:       bookings.filter(b => b.status === 'confirmed').length,
    waiting_payment: bookings.filter(b => b.status === 'waiting_payment').length,
    dp_verified:     bookings.filter(b => b.status === 'dp_verified').length,
    completed:       bookings.filter(b => b.status === 'completed').length,
    rejected:        bookings.filter(b => b.status === 'rejected').length,
    cancelled:       bookings.filter(b => b.status === 'cancelled').length,
  };

  const activeBookings = byStatus.pending + byStatus.confirmed + byStatus.waiting_payment + byStatus.dp_verified;
  const completionRate = pct(byStatus.completed, bookings.length);
  const rejectionRate  = pct(byStatus.rejected, bookings.length);
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return getMonthKey(d.toISOString());
  });

  const monthlyBookings = last6Months.map(mk => ({
    key: mk,
    label: monthLabel(mk),
    value: bookings.filter(b => getMonthKey(b.created_at) === mk).length,
    completed: bookings.filter(b => getMonthKey(b.created_at) === mk && b.status === 'completed').length,
  }));

  const sparkBookings = monthlyBookings.map(m => m.value);
  const currentMonth  = monthlyBookings.at(-1)?.value ?? 0;
  const prevMonth     = monthlyBookings.at(-2)?.value ?? 0;
  const serviceCounts: Record<string, { name: string; count: number; completed: number }> = {};
  bookings.forEach(b => {
    if (!b.service) return;
    const key = b.service.id;
    if (!serviceCounts[key]) serviceCounts[key] = { name: b.service.name, count: 0, completed: 0 };
    serviceCounts[key].count++;
    if (b.status === 'completed') serviceCounts[key].completed++;
  });
  const topServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    key: String(n), label: `${n}★`, value: reviews.filter(r => Math.round(r.rating) === n).length,
  }));
  const recentReviews = reviews.slice(0, 5);
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter(b => b.event_date >= todayStr && ['confirmed', 'dp_verified', 'waiting_payment'].includes(b.status))
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 5);

  if (pageLoading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '110px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 130, borderRadius: 14, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ height: 220, borderRadius: 16, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 16 }} />
          ))}
        </div>
        <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      </main>
    );
  }

  if (!vendor) return null;

  return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />

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
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>Statistik Toko</h1>
            </div>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              {vendor.store_name}
              {lastUpdated && <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>· Diperbarui {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>}
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 13.5, fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}>
            {refreshing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} color="#9ca3af" /> : <RefreshCw size={15} />}
            Refresh
          </button>
        </div>

        {bookings.length === 0 && reviews.length === 0 && (
          <div style={{ background: 'white', borderRadius: 20, border: '1.5px dashed #e5e7eb', padding: '56px 24px', textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <BarChart2 size={26} color="#0d3b2e" />
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Statistik Belum Tersedia</p>
            <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 360, margin: '0 auto' }}>
              Data statistik akan muncul setelah kamu menerima booking pertama dari klien.
            </p>
          </div>
        )}

        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard
            icon={TrendingUp} label="Total Booking" value={bookings.length}
            sub={`${currentMonth} bulan ini`} color="#0d3b2e"
            sparkData={sparkBookings}
            badge={diffBadge(currentMonth, prevMonth)}
          />
          <StatCard
            icon={CheckCircle} label="Selesai" value={byStatus.completed}
            sub={`${completionRate}% completion rate`} color="#16a34a"
            badge={byStatus.completed > 0 ? { label: `${completionRate}%`, up: completionRate >= 70 } : null}
          />
          <StatCard
            icon={Clock} label="Aktif" value={activeBookings}
            sub="Pending + Confirmed + DP" color="#0369a1"
            badge={activeBookings > 0 ? { label: 'Live', up: true } : null}
          />
          <StatCard
            icon={Star} label="Rating" value={Number(vendor.rating_avg).toFixed(1)}
            sub={`${vendor.review_count} ulasan`} color="#f97316"
            badge={vendor.rating_avg >= 4.5 ? { label: 'Top', up: true } : vendor.rating_avg > 0 ? { label: `${Number(vendor.rating_avg).toFixed(1)}★`, up: vendor.rating_avg >= 4 } : null}
          />
        </div>

        <div className="row2-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: '24px 24px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} color="#0d3b2e" />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Status Booking</p>
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{bookings.length} total</span>
            </div>
            <DonutChart segments={[
              { label: 'Selesai',       value: byStatus.completed,       color: '#16a34a' },
              { label: 'DP Verified',   value: byStatus.dp_verified,     color: '#0d3b2e' },
              { label: 'Menunggu DP',   value: byStatus.waiting_payment, color: '#0369a1' },
              { label: 'Dikonfirmasi',  value: byStatus.confirmed,       color: '#7c3aed' },
              { label: 'Pending',       value: byStatus.pending,         color: '#d97706' },
              { label: 'Ditolak',       value: byStatus.rejected,        color: '#dc2626' },
              { label: 'Dibatalkan',    value: byStatus.cancelled,       color: '#9ca3af' },
            ].filter(s => s.value > 0)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
              {[
                { label: 'Completion Rate', value: `${completionRate}%`, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Rejection Rate',  value: `${rejectionRate}%`,  color: rejectionRate > 20 ? '#dc2626' : '#6b7280', bg: rejectionRate > 20 ? '#fef2f2' : '#f8fafc' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ padding: '10px 12px', background: bg, borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color }}>{value}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 18, padding: '24px 24px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <TrendingUp size={16} color="#0d3b2e" />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Tren Booking (6 Bulan)</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginBottom: 8 }}>
              {monthlyBookings.map(({ key, label: lbl, value, completed }) => {
                const maxVal = Math.max(...monthlyBookings.map(m => m.value), 1);
                const h = Math.max((value / maxVal) * 100, value > 0 ? 8 : 0);
                const hC = Math.max((completed / maxVal) * 100, completed > 0 ? 4 : 0);
                const isCurrent = key === getMonthKey(new Date().toISOString());
                return (
                  <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${lbl}: ${value} booking, ${completed} selesai`}>
                    <span style={{ fontSize: 10, color: value > 0 ? '#0d3b2e' : '#94a3b8', fontWeight: 700 }}>{value || ''}</span>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 90, gap: 1 }}>
                      {completed > 0 && (
                        <div style={{ width: '100%', height: `${hC}%`, background: '#16a34a', borderRadius: '3px 3px 0 0', opacity: 0.85, transition: 'height 0.5s ease' }} />
                      )}
                      <div style={{ width: '100%', height: `${Math.max(h - hC, 0)}%`, background: isCurrent ? '#0d3b2e' : '#dcfce7', borderRadius: completed > 0 ? 0 : '3px 3px 0 0', transition: 'height 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 10, color: isCurrent ? '#0d3b2e' : '#9ca3af', fontWeight: isCurrent ? 700 : 400 }}>{lbl}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              {[['#0d3b2e', 'Masuk'], ['#16a34a', 'Selesai']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{l}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{currentMonth}</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Bulan ini</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {currentMonth > prevMonth ? <ChevronUp size={18} color="#16a34a" /> : currentMonth < prevMonth ? <ChevronDown size={18} color="#dc2626" /> : <Minus size={18} color="#9ca3af" />}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#94a3b8' }}>{prevMonth}</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Bulan lalu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row3-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: '24px 22px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Award size={16} color="#0d3b2e" />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Layanan Terpopuler</p>
            </div>
            {topServices.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>Belum ada data</p>
            ) : (
              <BarChart
                data={topServices.map(s => ({ key: s.name, value: s.count, label: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name }))}
                label="Jumlah booking per layanan"
                color="#0d3b2e"
              />
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 18, padding: '24px 22px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Calendar size={16} color="#0d3b2e" />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Event Mendatang</p>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle size={24} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Tidak ada event mendatang</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(b => {
                  const daysLeft = Math.ceil((new Date(b.event_date).getTime() - Date.now()) / 86400000);
                  const urgency = daysLeft <= 3 ? '#dc2626' : daysLeft <= 7 ? '#d97706' : '#0d3b2e';
                  return (
                    <div key={b.id} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, flex: 1 }}>
                          {b.event_name.length > 22 ? b.event_name.slice(0, 22) + '…' : b.event_name}
                        </p>
                        <span style={{ fontSize: 11, fontWeight: 700, color: urgency, background: `${urgency}18`, padding: '2px 7px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {daysLeft === 0 ? 'Hari ini' : daysLeft === 1 ? 'Besok' : `${daysLeft}h lagi`}
                        </span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                        {new Date(b.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        {b.service && ` · ${b.service.name.length > 16 ? b.service.name.slice(0, 16) + '…' : b.service.name}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 18, padding: '24px 22px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <ThumbsUp size={16} color="#0d3b2e" />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Distribusi Rating</p>
            </div>

            {vendor.review_count === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>Belum ada ulasan</p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, padding: '14px 16px', background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{Number(vendor.rating_avg).toFixed(1)}</p>
                    <StarRating rating={vendor.rating_avg} />
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{vendor.review_count} ulasan</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {ratingDist.map(({ key, label, value }) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#64748b', width: 20 }}>{label}</span>
                        <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct(value, vendor.review_count)}%`, height: '100%', background: '#f97316', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', width: 16, textAlign: 'right' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Ulasan Terbaru</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentReviews.map(r => (
                    <div key={r.id} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{r.user?.full_name ?? 'Pengguna'}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.comment && <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {(byStatus.pending > 0 || rejectionRate > 25 || activeBookings > 5) && (
          <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertCircle size={16} color="#d97706" />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Perhatian & Insight</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byStatus.pending > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a' }}>
                  <Clock size={16} color="#d97706" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13.5, color: '#92400e', flex: 1 }}>
                    <strong>{byStatus.pending} booking pending</strong> menunggu konfirmasi kamu.
                  </p>
                  <Link href="/vendor/bookings" style={{ fontSize: 13, fontWeight: 700, color: '#d97706', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Lihat <ArrowRight size={13} />
                  </Link>
                </div>
              )}
              {byStatus.waiting_payment > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                  <AlertCircle size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13.5, color: '#1e40af', flex: 1 }}>
                    <strong>{byStatus.waiting_payment} booking</strong> menunggu verifikasi bukti DP kamu.
                  </p>
                  <Link href="/vendor/bookings?status=waiting_payment" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Verifikasi <ArrowRight size={13} />
                  </Link>
                </div>
              )}
              {rejectionRate > 25 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                  <XCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13.5, color: '#991b1b', flex: 1 }}>
                    Rejection rate <strong>{rejectionRate}%</strong> — pertimbangkan untuk mengatur ketersediaan kalender agar lebih akurat.
                  </p>
                  <Link href="/vendor/availability" style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Kalender <ArrowRight size={13} />
                  </Link>
                </div>
              )}
              {vendor.review_count === 0 && byStatus.completed > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                  <Star size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13.5, color: '#15803d', flex: 1 }}>
                    Kamu sudah punya <strong>{byStatus.completed} event selesai</strong> tapi belum ada ulasan. Minta klien untuk memberi ulasan!
                  </p>
                </div>
              )}
              {!vendor.is_verified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <Users size={16} color="#64748b" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13.5, color: '#475569', flex: 1 }}>
                    Toko kamu <strong>belum terverifikasi</strong>. Profil tidak tampil di pencarian publik hingga admin memverifikasi.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-grid  { grid-template-columns: repeat(4,1fr); }
        .row2-grid  { grid-template-columns: 1fr 1fr; }
        .row3-grid  { grid-template-columns: 1fr 1fr 1fr; }
        @media (max-width: 1024px) {
          .stat-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .row3-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .stat-grid  { grid-template-columns: 1fr !important; }
          .row2-grid  { grid-template-columns: 1fr !important; }
          .row3-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}