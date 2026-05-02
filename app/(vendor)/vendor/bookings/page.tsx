'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, CalendarCheck, Package, CalendarDays, BarChart2,
  LogOut, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  Menu, X, ExternalLink, Search, Filter, RefreshCw, MapPin,
  User, Phone, Mail, MessageCircle, ChevronLeft, ChevronDown,
  CheckCheck, Ban, ShieldCheck, Loader2, Eye, FileImage,
} from 'lucide-react';
import type { BookingStatus } from '@/types';

interface BookingItem {
  id: string;
  event_date: string;
  event_name: string;
  event_location: string;
  setup_time: string | null;
  notes: string | null;
  status: BookingStatus;
  rejection_reason: string | null;
  dp_proof_url: string | null;
  dp_verified_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  service: { id: string; name: string; category: string } | null;
  user: { id: string; full_name: string | null; email: string; phone: string | null } | null;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending:         { label: 'Menunggu',          color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', icon: <Clock size={12} /> },
  confirmed:       { label: 'Dikonfirmasi',       color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', icon: <CheckCircle2 size={12} /> },
  waiting_payment: { label: 'Menunggu DP',        color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: <AlertCircle size={12} /> },
  dp_verified:     { label: 'DP Terverifikasi',   color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', icon: <ShieldCheck size={12} /> },
  completed:       { label: 'Selesai',            color: '#064E3B', bg: '#D1FAE5', border: '#6EE7B7', icon: <CheckCheck size={12} /> },
  rejected:        { label: 'Ditolak',            color: '#991B1B', bg: '#FFF1F2', border: '#FECDD3', icon: <XCircle size={12} /> },
  cancelled:       { label: 'Dibatalkan',         color: '#374151', bg: '#F9FAFB', border: '#E5E7EB', icon: <Ban size={12} /> },
};

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'all',             label: 'Semua' },
  { key: 'pending',         label: 'Menunggu' },
  { key: 'confirmed',       label: 'Dikonfirmasi' },
  { key: 'waiting_payment', label: 'Menunggu DP' },
  { key: 'dp_verified',     label: 'DP Verified' },
  { key: 'completed',       label: 'Selesai' },
  { key: 'rejected',        label: 'Ditolak' },
];

const NAV_ITEMS = [
  { href: '/vendor/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/vendor/bookings',     icon: <CalendarCheck size={18} />,   label: 'Booking Masuk' },
  { href: '/vendor/services',     icon: <Package size={18} />,         label: 'Layanan Saya' },
  { href: '/vendor/availability', icon: <CalendarDays size={18} />,    label: 'Ketersediaan' },
  { href: '/vendor/analytics',    icon: <BarChart2 size={18} />,       label: 'Statistik' },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return fmtDateShort(d);
}

function Skeleton({ w = '100%', h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f0efeb 25%,#e8e7e3 50%,#f0efeb 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: type === 'success' ? '#064E3B' : '#991B1B', color: 'white', borderRadius: 14, padding: '13px 22px', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.22)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420, animation: 'slideUp 0.3s ease' }}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: 4 }}><X size={14} /></button>
    </div>
  );
}

function RejectModal({ booking, onClose, onDone }: {
  booking: BookingItem; onClose: () => void; onDone: (id: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const PRESETS = ['Tanggal tidak tersedia', 'Peralatan sedang dalam perawatan', 'Kapasitas tidak mencukupi', 'Di luar jangkauan area layanan', 'Budget tidak sesuai'];

  const handleReject = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/bookings/${booking.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) { onDone(booking.id); onClose(); }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px', maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ban size={18} color="#DC2626" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Tolak Booking</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Booking dari <strong>{booking.user?.full_name ?? 'klien'}</strong> untuk <strong>{booking.event_name}</strong> akan ditolak.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', marginLeft: 'auto' }}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Pilih alasan cepat:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => setReason(p)}
                style={{ padding: '5px 11px', borderRadius: 100, fontSize: 12, border: `1.5px solid ${reason === p ? 'var(--forest)' : 'var(--gray-200)'}`, background: reason === p ? '#f0fdf4' : 'white', color: reason === p ? 'var(--forest)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: reason === p ? 700 : 400, transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Atau tulis alasan lain: *</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Jelaskan alasan penolakan kepada klien..."
            style={{ width: '100%', minHeight: 90, padding: '11px 14px', borderRadius: 12, border: `1.5px solid ${reason ? 'var(--forest)' : '#e5e7eb'}`, outline: 'none', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', color: 'var(--text-primary)', background: '#fafafa', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--gray-200)', background: 'white', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
          <button onClick={handleReject} disabled={!reason.trim() || loading}
            style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: reason.trim() && !loading ? '#DC2626' : '#e5e7eb', color: reason.trim() && !loading ? 'white' : 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: reason.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Menolak...</> : 'Tolak Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingDrawer({ booking, onClose, onAction, actionLoading }: {
  booking: BookingItem; onClose: () => void;
  onAction: (type: 'confirm' | 'reject' | 'verify_dp' | 'complete', booking: BookingItem) => void;
  actionLoading: string | null;
}) {
  const whatsappUrl = booking.user?.phone
    ? `https://wa.me/${booking.user.phone.replace(/\D/g, '')}?text=Halo ${booking.user.full_name ?? ''}, terkait booking event "${booking.event_name}"`
    : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1 }} />
      <div
        style={{ width: '100%', maxWidth: 480, background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 48px rgba(0,0,0,0.15)', animation: 'slideRight 0.3s cubic-bezier(0.22,1,0.36,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid var(--gray-100)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
          <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><X size={16} /></button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Detail Booking</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{booking.id.slice(0, 8).toUpperCase()}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--gray-50)', borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Info Event</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.3px' }}>{booking.event_name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Row icon={<CalendarDays size={13} color="var(--text-muted)" />} label="Tanggal" value={fmtDate(booking.event_date)} />
              <Row icon={<MapPin size={13} color="var(--text-muted)" />} label="Lokasi" value={booking.event_location} />
              {booking.setup_time && <Row icon={<Clock size={13} color="var(--text-muted)" />} label="Setup jam" value={booking.setup_time} />}
              {booking.service && <Row icon={<Package size={13} color="var(--text-muted)" />} label="Layanan" value={`${booking.service.name} (${booking.service.category})`} />}
            </div>
            {booking.notes && (
              <div style={{ marginTop: 12, background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Catatan klien:</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{booking.notes}</div>
              </div>
            )}
          </div>

          {booking.user && (
            <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', marginBottom: 16, border: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Data Klien</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                  {(booking.user.full_name ?? booking.user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{booking.user.full_name ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking.user.email}</div>
                </div>
              </div>
              {booking.user.phone && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Phone size={12} /> {booking.user.phone}
                </div>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, background: '#dcfce7', color: '#16a34a', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  <MessageCircle size={14} /> Chat WhatsApp
                </a>
              )}
            </div>
          )}

          {booking.dp_proof_url && (
            <div style={{ background: '#f5f3ff', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Bukti DP Pembayaran</div>
              <a href={booking.dp_proof_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, background: '#7c3aed', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <FileImage size={14} /> Lihat Bukti DP
              </a>
              {booking.dp_verified_at && (
                <div style={{ fontSize: 12, color: '#6d28d9', marginTop: 8 }}>✓ Diverifikasi pada {fmtDateShort(booking.dp_verified_at)}</div>
              )}
            </div>
          )}

          {booking.rejection_reason && (
            <div style={{ background: '#fff1f2', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid #fecdd3' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#be185d', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Alasan Penolakan</div>
              <div style={{ fontSize: 13, color: '#9f1239', lineHeight: 1.6 }}>{booking.rejection_reason}</div>
            </div>
          )}

          <div style={{ background: 'var(--gray-50)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Timeline</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: 5 }}>📤 Dibuat: {timeAgo(booking.created_at)}</div>
              <div style={{ marginBottom: 5 }}>🔄 Diupdate: {timeAgo(booking.updated_at)}</div>
              {booking.dp_verified_at && <div style={{ marginBottom: 5 }}>✅ DP Verified: {fmtDateShort(booking.dp_verified_at)}</div>}
              {booking.completed_at && <div>🎉 Selesai: {fmtDateShort(booking.completed_at)}</div>}
            </div>
          </div>

          <ActionButtons booking={booking} onAction={onAction} actionLoading={actionLoading} />
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
      <span style={{ marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{value}</span>
    </div>
  );
}

function ActionButtons({ booking, onAction, actionLoading }: {
  booking: BookingItem;
  onAction: (type: 'confirm' | 'reject' | 'verify_dp' | 'complete', booking: BookingItem) => void;
  actionLoading: string | null;
}) {
  const isLoading = (type: string) => actionLoading === `${booking.id}-${type}`;

  const BtnLoader = () => <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />;

  if (booking.status === 'pending') return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button onClick={() => onAction('reject', booking)} disabled={!!actionLoading}
        style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #fecdd3', background: 'white', color: '#DC2626', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Ban size={14} /> Tolak
      </button>
      <button onClick={() => onAction('confirm', booking)} disabled={!!actionLoading}
        style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--forest)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {isLoading('confirm') ? <BtnLoader /> : <CheckCircle2 size={14} />}
        {isLoading('confirm') ? 'Mengkonfirmasi...' : 'Konfirmasi Booking'}
      </button>
    </div>
  );

  if (booking.status === 'waiting_payment') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!booking.dp_proof_url && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={14} /> Klien belum mengupload bukti DP
        </div>
      )}
      {booking.dp_proof_url && (
        <button onClick={() => onAction('verify_dp', booking)} disabled={!!actionLoading}
          style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#7c3aed', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {isLoading('verify_dp') ? <BtnLoader /> : <ShieldCheck size={14} />}
          {isLoading('verify_dp') ? 'Memverifikasi...' : 'Verifikasi DP & Kunci Tanggal'}
        </button>
      )}
    </div>
  );

  if (booking.status === 'dp_verified') return (
    <button onClick={() => onAction('complete', booking)} disabled={!!actionLoading}
      style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
      {isLoading('complete') ? <BtnLoader /> : <CheckCheck size={14} />}
      {isLoading('complete') ? 'Memproses...' : 'Tandai Event Selesai'}
    </button>
  );

  return null;
}

function Sidebar({ sidebarOpen, setSidebarOpen, storeName, onLogout }: {
  sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void;
  storeName: string; onLogout: () => void;
}) {
  return (
    <>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30, backdropFilter: 'blur(2px)' }} />}
      <aside style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: 240, background: 'var(--forest)', display: 'flex', flexDirection: 'column', zIndex: 40, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }} className="vendor-sidebar">
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Link href="/"><img src="/logo_findor.jpg" alt="Findor" style={{ height: 30, objectFit: 'contain', borderRadius: 6 }} /></Link>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}><X size={16} /></button>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>VENDOR PORTAL</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{storeName}</div>
        </div>
        <nav style={{ flex: 1, padding: '12px' }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/vendor/bookings';
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent', color: isActive ? 'white' : 'rgba(255,255,255,0.55)', fontWeight: isActive ? 600 : 400, fontSize: 14, borderLeft: isActive ? '3px solid var(--amber)' : '3px solid transparent' }}>
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>
      <style>{`@media(min-width:1024px){.vendor-sidebar{transform:translateX(0)!important}.vendor-main{margin-left:240px!important}}`}</style>
    </>
  );
}

export default function VendorBookingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BookingItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const loadBookings = useCallback(async (tab: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'vendor', page: String(pg), per_page: '15' });
      if (tab !== 'all') params.set('status', tab);
      const res = await fetch(`/api/v1/bookings?${params}`);
      const data = await res.json();
      if (!data.success) { router.replace('/login'); return; }
      const d = data.data;
      setBookings(d.bookings ?? []);
      setTotal(d.total ?? 0);
      setTotalPages(d.total_pages ?? 1);
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    fetch('/api/v1/auth/me').then(r => r.json()).then(d => {
      if (d.success && d.data.vendor) setStoreName(d.data.vendor.store_name);
      else if (!d.success) router.replace('/login');
    });
    loadBookings('all', 1);
  }, [loadBookings, router]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab); setPage(1); loadBookings(tab, 1);
  };

  const handleAction = async (type: 'confirm' | 'reject' | 'verify_dp' | 'complete', booking: BookingItem) => {
    if (type === 'reject') { setRejectTarget(booking); return; }

    const endpointMap = { confirm: 'confirm', verify_dp: 'verify-payment', complete: 'complete' };
    const endpoint = endpointMap[type];
    const key = `${booking.id}-${type}`;
    setActionLoading(key);

    try {
      const body = type === 'verify_dp' ? JSON.stringify({ action: 'verify' }) : undefined;
      const res = await fetch(`/api/v1/bookings/${booking.id}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body } : {}),
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.data?.message ?? 'Berhasil!', 'success');
        setBookings(prev => prev.map(b =>
          b.id === booking.id ? { ...b, status: data.data.booking.status, dp_verified_at: data.data.booking.dp_verified_at ?? b.dp_verified_at, completed_at: data.data.booking.completed_at ?? b.completed_at } : b
        ));
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking(prev => prev ? { ...prev, status: data.data.booking.status } : null);
        }
      } else {
        showToast(data.error ?? 'Gagal memproses aksi.', 'error');
      }
    } finally { setActionLoading(null); }
  };

  const handleRejectDone = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' as BookingStatus } : b));
    if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, status: 'rejected' } : null);
    showToast('Booking berhasil ditolak.', 'success');
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const filtered = bookings.filter(b =>
    !search || b.event_name.toLowerCase().includes(search.toLowerCase()) ||
    (b.user?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.user?.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} storeName={storeName} onLogout={handleLogout} />

      <div className="vendor-main" style={{ marginLeft: 0, minHeight: '100vh' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(249,249,247,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--gray-100)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 10, padding: 9, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
            <Menu size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Booking Masuk
              {pendingCount > 0 && (
                <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} total booking</p>
          </div>
          <button onClick={() => loadBookings(activeTab, page)} title="Refresh"
            style={{ marginLeft: 'auto', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 10, padding: 9, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', boxShadow: 'var(--shadow-sm)' }}>
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          </button>
        </header>

        <main style={{ padding: '24px 24px 60px', maxWidth: 1000, margin: '0 auto' }}>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 14, padding: '10px 16px', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
            <Search size={15} color="var(--text-muted)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama event atau klien..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', background: 'transparent', fontFamily: 'inherit' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}><X size={14} /></button>}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
            {STATUS_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              const cnt = tab.key === 'all' ? total : bookings.filter(b => b.status === tab.key).length;
              return (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                  style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${isActive ? 'var(--forest)' : 'var(--gray-200)'}`, background: isActive ? 'var(--forest)' : 'white', color: isActive ? 'white' : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', flexShrink: 0 }}>
                  {tab.label}
                  {cnt > 0 && isActive && <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 99, padding: '1px 6px', fontSize: 10 }}>{cnt}</span>}
                  {cnt > 0 && !isActive && tab.key === 'pending' && <span style={{ background: '#fef3c7', color: '#d97706', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{cnt}</span>}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <Skeleton w="45%" h={15} />
                    <Skeleton w={80} h={24} r={12} />
                  </div>
                  <Skeleton w="30%" h={12} />
                  <div style={{ display: 'flex', gap: 8 }}><Skeleton w={100} h={12} /><Skeleton w={80} h={12} /></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: 16, border: '1px solid var(--gray-100)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CalendarCheck size={22} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {search ? 'Booking tidak ditemukan' : 'Belum ada booking'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {search ? `Tidak ada hasil untuk "${search}"` : 'Booking dari klien akan muncul di sini'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(b => (
                <div key={b.id}
                  style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: `1px solid ${b.status === 'pending' ? '#fde68a' : 'var(--gray-100)'}`, boxShadow: b.status === 'pending' ? '0 0 0 2px rgba(245,166,35,0.12)' : 'var(--shadow-sm)', cursor: 'pointer', transition: 'all 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = b.status === 'pending' ? '0 0 0 2px rgba(245,166,35,0.12)' : 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                  onClick={() => setSelectedBooking(b)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.event_name}</span>
                        {b.status === 'pending' && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#d97706', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.06em' }}>PERLU AKSI</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        dari <strong style={{ color: 'var(--text-secondary)' }}>{b.user?.full_name ?? b.user?.email ?? 'Klien'}</strong>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarDays size={11} /> {fmtDateShort(b.event_date)}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {b.event_location}
                    </span>
                    {b.service && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Package size={11} /> {b.service.name}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(b.created_at)}</span>
                  </div>

                  {b.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleAction('reject', b)} disabled={!!actionLoading}
                        style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #fecdd3', background: 'white', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Ban size={12} /> Tolak
                      </button>
                      <button onClick={() => handleAction('confirm', b)} disabled={!!actionLoading}
                        style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--forest)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {actionLoading === `${b.id}-confirm`
                          ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Konfirmasi...</>
                          : <><CheckCircle2 size={12} /> Konfirmasi</>
                        }
                      </button>
                      <button onClick={() => setSelectedBooking(b)}
                        style={{ marginLeft: 'auto', padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--gray-200)', background: 'white', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Eye size={12} /> Detail
                      </button>
                    </div>
                  )}

                  {b.status === 'waiting_payment' && b.dp_proof_url && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleAction('verify_dp', b)} disabled={!!actionLoading}
                        style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#7c3aed', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {actionLoading === `${b.id}-verify_dp`
                          ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Memverifikasi...</>
                          : <><ShieldCheck size={12} /> Verifikasi DP</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 }}>
              <button onClick={() => { setPage(p => p - 1); loadBookings(activeTab, page - 1); }} disabled={page === 1 || loading}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--gray-200)', background: 'white', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                <ChevronLeft size={15} /> Prev
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 8px' }}>Halaman {page} / {totalPages}</span>
              <button onClick={() => { setPage(p => p + 1); loadBookings(activeTab, page + 1); }} disabled={page === totalPages || loading}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--gray-200)', background: 'white', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </main>
      </div>

      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}

      {rejectTarget && (
        <RejectModal
          booking={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onDone={handleRejectDone}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}