'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays, MapPin, Clock, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, Package, ArrowRight,
  Upload, Star, X, Loader2, FileText, Phone,
  MessageSquare, RefreshCw, TriangleAlert, Send,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import type { BookingStatus } from '@/types';

interface ServiceInfo  { id: string; name: string; category: string; }
interface VendorInfo   { id: string; store_name: string; slug: string; whatsapp_number: string; city: string; }

interface Booking {
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
  clarification_message: string | null;
  clarification_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  service: ServiceInfo;
  vendor: VendorInfo;
}

interface ReviewPayload { rating: number; comment: string; }

const STATUS_CONFIG: Record<BookingStatus, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode;
}> = {
  pending:         { label: 'Menunggu Konfirmasi', color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', icon: <Clock size={13} /> },
  confirmed:       { label: 'Dikonfirmasi',        color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', icon: <CheckCircle2 size={13} /> },
  waiting_payment: { label: 'Upload Bukti DP',     color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE', icon: <Upload size={13} /> },
  dp_verified:     { label: 'DP Terverifikasi',    color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', icon: <CheckCircle2 size={13} /> },
  completed:       { label: 'Selesai',             color: '#064E3B', bg: '#D1FAE5', border: '#6EE7B7', icon: <CheckCircle2 size={13} /> },
  rejected:        { label: 'Ditolak',             color: '#991B1B', bg: '#FEF2F2', border: '#FECACA', icon: <XCircle size={13} /> },
  cancelled:       { label: 'Dibatalkan',          color: '#374151', bg: '#F9FAFB', border: '#E5E7EB', icon: <XCircle size={13} /> },
};

const TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all',             label: 'Semua' },
  { key: 'pending',         label: 'Menunggu' },
  { key: 'confirmed',       label: 'Dikonfirmasi' },
  { key: 'waiting_payment', label: 'Upload DP' },
  { key: 'dp_verified',     label: 'Berlangsung' },
  { key: 'completed',       label: 'Selesai' },
  { key: 'rejected',        label: 'Ditolak' },
];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDateShort(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timeAgo(s: string) {
  const d = Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
  if (d === 0) return 'Hari ini';
  if (d === 1) return 'Kemarin';
  if (d < 30)  return `${d} hari lalu`;
  return formatDateShort(s);
}
function waLink(number: string, vendorName: string) {
  const text = encodeURIComponent(`Halo ${vendorName}, saya ingin bertanya mengenai booking saya di Findor.`);
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${text}`;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '5px 11px',
      borderRadius: 100,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #f0f0ec 25%, #e8e8e4 50%, #f0f0ec 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  );
}

function UploadDPModal({ booking, onClose, onSuccess }: {
  booking: Booking; onClose: () => void; onSuccess: () => void;
}) {
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5MB.'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) { setError('Format: JPG, PNG, WEBP, atau PDF.'); return; }
    setError('');
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Pilih file terlebih dahulu.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch(`/api/v1/bookings/${booking.id}/proof`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Gagal upload.');
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally { setLoading(false); }
  };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Upload Bukti Transfer DP</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' }}>{booking.event_name} · {booking.vendor.store_name}</p>
          </div>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 10, padding: '12px 14px', marginBottom: 18,
            fontSize: 13, color: '#92400E', display: 'flex', gap: 10,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              Pastikan kamu sudah negosiasi dan sepakat harga dengan vendor via WhatsApp sebelum upload bukti DP.
            </div>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${file ? '#1C3D2E' : '#D1D5DB'}`,
              borderRadius: 12, padding: '28px 20px',
              textAlign: 'center', cursor: 'pointer',
              background: file ? '#F3F9F5' : '#FAFAFA',
              transition: 'all 0.2s',
              marginBottom: 16,
            }}
          >
            <input
              ref={inputRef} type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
            ) : file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <FileText size={36} color="#1C3D2E" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1C3D2E' }}>{file.name}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Upload size={28} color="#9CA3AF" />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Klik atau seret file ke sini</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>JPG, PNG, WEBP, PDF · Maks 5MB</span>
              </div>
            )}
          </div>

          {file && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={() => { setFile(null); setPreview(null); }}
                style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <X size={13} /> Ganti file
              </button>
            </div>
          )}

          {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} disabled={loading} style={btnOutline}>Batal</button>
            <button onClick={handleSubmit} disabled={!file || loading} style={{
              ...btnPrimary, flex: 2,
              opacity: !file || loading ? 0.6 : 1,
              cursor: !file || loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Mengupload...</> : <><Upload size={14} /> Upload Bukti DP</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ booking, onClose, onSuccess }: {
  booking: Booking; onClose: () => void; onSuccess: () => void;
}) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Pilih rating bintang terlebih dahulu.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/v1/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id, rating, comment: comment.trim() || null }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Gagal mengirim ulasan.');
      onSuccess(); onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally { setLoading(false); }
  };

  const activeRating = hovered || rating;

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...modalStyle, maxWidth: 460 }}>
        <div style={modalHeaderStyle}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Beri Ulasan</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' }}>{booking.vendor.store_name}</p>
          </div>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Vendor info */}
          <div style={{
            background: '#F7F7F4', borderRadius: 10, padding: '12px 14px',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#1C3D2E',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              fontSize: 16, fontWeight: 700, color: 'white',
            }}>
              {booking.vendor.store_name[0]}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{booking.vendor.store_name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{booking.service.name} · {formatDate(booking.event_date)}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Seberapa puas kamu dengan layanan ini?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => { setRating(n); setError(''); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    transition: 'transform 0.15s',
                    transform: hovered >= n || rating >= n ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <Star
                    size={36}
                    fill={activeRating >= n ? '#F5A623' : 'none'}
                    color={activeRating >= n ? '#F5A623' : '#D1D5DB'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            {activeRating > 0 && (
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
                {['', 'Sangat Buruk', 'Kurang Memuaskan', 'Cukup Baik', 'Memuaskan', 'Luar Biasa!'][activeRating]}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              Komentar <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Ceritakan pengalaman kamu dengan vendor ini..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #E5E7EB', fontSize: 14, color: '#111827',
                resize: 'none', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#1C3D2E'; }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
            />
            <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 }}>
              {comment.length}/300
            </p>
          </div>

          {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} disabled={loading} style={btnOutline}>Batal</button>
            <button onClick={handleSubmit} disabled={rating === 0 || loading} style={{
              ...btnPrimary, flex: 2,
              opacity: rating === 0 || loading ? 0.6 : 1,
              cursor: rating === 0 || loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Mengirim...</> : <><Star size={14} /> Kirim Ulasan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...modalStyle, maxWidth: 500 }}>
        <div style={modalHeaderStyle}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Detail Booking</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' }}>ID: {booking.id.slice(0, 8)}...</p>
          </div>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StatusBadge status={booking.status} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Nama Event', val: booking.event_name },
              { label: 'Layanan', val: booking.service.name },
              { label: 'Tanggal Event', val: formatDate(booking.event_date) },
              { label: 'Vendor', val: booking.vendor.store_name },
              { label: 'Lokasi', val: booking.event_location },
              ...(booking.setup_time ? [{ label: 'Jam Setup', val: booking.setup_time }] : []),
            ].map(item => (
              <div key={item.label} style={{ gridColumn: item.label === 'Lokasi' ? '1 / -1' : undefined }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                <p style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{item.val}</p>
              </div>
            ))}
          </div>

          {booking.notes && (
            <div style={{ background: '#F7F7F4', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catatan</p>
              <p style={{ fontSize: 13, color: '#374151' }}>{booking.notes}</p>
            </div>
          )}

          {booking.status === 'rejected' && booking.rejection_reason && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#991B1B', fontWeight: 700, marginBottom: 4 }}>ALASAN PENOLAKAN</p>
              <p style={{ fontSize: 13, color: '#DC2626' }}>{booking.rejection_reason}</p>
            </div>
          )}

          <a
            href={waLink(booking.vendor.whatsapp_number, booking.vendor.store_name)}
            target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', borderRadius: 10,
              background: '#25D366', color: 'white',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}
          >
            <Phone size={15} /> Hubungi Vendor via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function CancelConfirmedModal({
  booking,
  onClose,
  onCancelled,
}: {
  booking: Booking;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [reason, setReason]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const waLink = `https://wa.me/${booking.vendor.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Halo ${booking.vendor.store_name}, saya ingin membatalkan booking untuk event "${booking.event_name}". Mohon bantuannya.`
  )}`;

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('Alasan pembatalan wajib diisi.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/v1/bookings/${booking.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellation_reason: reason.trim() }),
      });
      const data = await res.json();
      if (data.success) { onCancelled(); onClose(); }
      else setError(data.error ?? 'Terjadi kesalahan.');
    } catch { setError('Tidak dapat terhubung ke server.'); }
    finally { setLoading(false); }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fef2f2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <TriangleAlert size={20} color="#dc2626" />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>Batalkan Booking?</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>{booking.event_name} · {booking.vendor.store_name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={16} color="#374151" />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>Perhatian:</strong> Booking ini sudah <strong>dikonfirmasi vendor</strong>. Pembatalan di tahap ini belum melibatkan DP, namun sebaiknya kamu menghubungi vendor terlebih dahulu untuk koordinasi.
            </div>
          </div>

          <a href={waLink} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', textDecoration: 'none', color: '#15803d', fontSize: 13.5, fontWeight: 600 }}>
            <MessageSquare size={16} color="#16a34a" />
            Hubungi {booking.vendor.store_name} via WhatsApp dulu
          </a>

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 7 }}>
              Alasan Pembatalan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Contoh: Ada perubahan tanggal acara, vendor lain sudah dipilih, dll."
              maxLength={500}
              rows={3}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${error ? '#fca5a5' : '#e5e7eb'}`, fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a', background: '#fafafa', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 0.18s' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#0d3b2e'; }}
              onBlur={e => { e.currentTarget.style.borderColor = error ? '#fca5a5' : '#e5e7eb'; }}
            />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>{reason.length}/500</p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', fontSize: 13, color: '#dc2626', display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: '#f1f5f9', color: '#374151', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Kembali
            </button>
            <button onClick={handleSubmit} disabled={loading || !reason.trim()}
              style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: loading || !reason.trim() ? '#9ca3af' : '#dc2626', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: loading || !reason.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', transition: 'background 0.2s' }}>
              {loading
                ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Membatalkan...</>
                : <><Send size={14} /> Ya, Batalkan Booking</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking, onRefresh,
}: {
  booking: Booking;
  onRefresh: () => void;
}) {
  const [uploadOpen, setUploadOpen]         = useState(false);
  const [reviewOpen, setReviewOpen]         = useState(false);
  const [detailOpen, setDetailOpen]         = useState(false);
  const [cancelling, setCancelling]         = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    setCancelling(true);
    try {
      const res  = await fetch(`/api/v1/bookings/${booking.id}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Gagal membatalkan booking.');
    } finally { setCancelling(false); }
  };

  const cfg = STATUS_CONFIG[booking.status];

  return (
    <>
      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid #EBEBEB',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(28,61,46,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ height: 4, background: cfg.border }} />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                <StatusBadge status={booking.status} />
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(booking.created_at)}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {booking.event_name}
              </h3>
            </div>
            <button onClick={() => setDetailOpen(true)} style={{
              flexShrink: 0, background: '#F7F7F4', border: 'none', borderRadius: 8,
              padding: '7px 12px', fontSize: 12, fontWeight: 600, color: '#6B7280',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EDEDE9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F7F7F4'; }}
            >
              <FileText size={13} /> Detail
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginBottom: 16 }}>
            <span style={infoChip}>
              <CalendarDays size={13} color="#9CA3AF" />
              {formatDate(booking.event_date)}
            </span>
            <span style={infoChip}>
              <MapPin size={13} color="#9CA3AF" />
              {booking.event_location.length > 35 ? booking.event_location.slice(0, 35) + '...' : booking.event_location}
            </span>
          </div>

          <div style={{
            background: '#F7F7F4', borderRadius: 10, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9, background: '#1C3D2E',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              fontSize: 15, fontWeight: 700, color: 'white',
            }}>
              {booking.vendor.store_name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {booking.vendor.store_name}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{booking.service.name}</div>
            </div>
            <a
              href={waLink(booking.vendor.whatsapp_number, booking.vendor.store_name)}
              target="_blank" rel="noreferrer"
              title="Hubungi via WhatsApp"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: '#25D36620', display: 'grid', placeItems: 'center',
                flexShrink: 0, textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <MessageSquare size={16} color="#25D366" />
            </a>
          </div>

          {booking.status === 'rejected' && booking.rejection_reason && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              fontSize: 13, color: '#DC2626',
            }}>
              <span style={{ fontWeight: 700 }}>Alasan:</span> {booking.rejection_reason}
            </div>
          )}

          {booking.status === 'waiting_payment' && (
            <div style={{
              background: booking.clarification_message ? '#fff7ed' : '#F5F3FF',
              border: `1px solid ${booking.clarification_message ? '#fed7aa' : '#DDD6FE'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              fontSize: 13,
              color: booking.clarification_message ? '#9a3412' : '#6D28D9',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              {booking.clarification_message
                ? <TriangleAlert size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                : <Clock size={14} style={{ flexShrink: 0, marginTop: 1 }} />}
              <div>
                {booking.clarification_message ? (
                  <>
                    <strong style={{ display: 'block', marginBottom: 4 }}>⚠️ Vendor meminta klarifikasi bukti DP kamu</strong>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{booking.clarification_message}</p>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#c2410c', fontWeight: 600 }}>
                      Mohon upload ulang bukti DP yang valid menggunakan tombol di bawah.
                    </p>
                  </>
                ) : (
                  <>
                    Bukti DP kamu sedang menunggu verifikasi dari vendor.{' '}
                    <span style={{ color: '#7c3aed', fontWeight: 600 }}>
                      Untuk membatalkan di tahap ini, hubungi vendor langsung via WhatsApp karena sudah melibatkan DP.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {booking.status === 'dp_verified' && (
            <div style={{
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              fontSize: 13, color: '#065F46', display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                DP terverifikasi! Tanggal event sudah dikunci.{' '}
                <span style={{ color: '#065F46', fontWeight: 600 }}>
                  Jika perlu membatalkan, hubungi vendor via WhatsApp — pembatalan dan pengembalian DP diselesaikan secara langsung.
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {booking.status === 'pending' && (
              <button onClick={handleCancel} disabled={cancelling} style={{
                ...btnDanger, flex: 1, opacity: cancelling ? 0.6 : 1,
              }}>
                {cancelling ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Membatalkan...</> : <><XCircle size={13} /> Batalkan</>}
              </button>
            )}

            {booking.status === 'confirmed' && (
              <>
                <button onClick={() => setUploadOpen(true)} style={{ ...btnPrimary, flex: 1 }}>
                  <Upload size={13} /> Upload Bukti DP
                </button>
                <button onClick={() => setCancelModalOpen(true)}
                  style={{ ...btnDanger, paddingLeft: 14, paddingRight: 14, flexShrink: 0 }}
                  title="Batalkan booking ini">
                  <XCircle size={14} />
                </button>
              </>
            )}

            {(booking.status === 'waiting_payment' || booking.status === 'dp_verified') && (
              <a
                href={`https://wa.me/${booking.vendor.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${booking.vendor.store_name}, saya ingin mendiskusikan pembatalan booking untuk event "${booking.event_name}".`)}`}
                target="_blank" rel="noreferrer"
                style={{ ...btnOutline, flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                <MessageSquare size={13} color="#25D366" /> Hubungi Vendor untuk Batalkan
              </a>
            )}

            {booking.status === 'completed' && (
              <button onClick={() => setReviewOpen(true)} style={{ ...btnForest, flex: 1 }}>
                <Star size={13} /> Beri Ulasan
              </button>
            )}

            <Link href={`/vendor/${booking.vendor.slug}`} style={{
              ...btnOutline,
              flex: booking.status === 'waiting_payment' || booking.status === 'dp_verified' ? 1 : undefined,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <ChevronRight size={13} /> Lihat Vendor
            </Link>
          </div>
        </div>
      </div>

      {uploadOpen && (
        <UploadDPModal booking={booking} onClose={() => setUploadOpen(false)} onSuccess={onRefresh} />
      )}
      {reviewOpen && (
        <ReviewModal booking={booking} onClose={() => setReviewOpen(false)} onSuccess={onRefresh} />
      )}
      {detailOpen && (
        <DetailModal booking={booking} onClose={() => setDetailOpen(false)} />
      )}
      {cancelModalOpen && (
        <CancelConfirmedModal
          booking={booking}
          onClose={() => setCancelModalOpen(false)}
          onCancelled={onRefresh}
        />
      )}
    </>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab]   = useState<BookingStatus | 'all'>('all');
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [counts, setCounts]         = useState<Partial<Record<BookingStatus | 'all', number>>>({});

  const fetchBookings = useCallback(async (status: BookingStatus | 'all', p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'user', page: String(p), per_page: '10' });
      if (status !== 'all') params.set('status', status);
      const res  = await fetch(`/api/v1/bookings?${params}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings ?? []);
        setTotalPages(data.data.total_pages ?? 1);
        setTotal(data.data.total ?? 0);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    const statuses: BookingStatus[] = ['pending', 'confirmed', 'waiting_payment', 'dp_verified', 'completed', 'rejected'];
    Promise.all([
      fetch('/api/v1/bookings?role=user&per_page=1').then(r => r.json()),
      ...statuses.map(s => fetch(`/api/v1/bookings?role=user&status=${s}&per_page=1`).then(r => r.json())),
    ]).then(([allData, ...statusData]) => {
      const c: Partial<Record<BookingStatus | 'all', number>> = { all: allData.data?.total ?? 0 };
      statuses.forEach((s, i) => { c[s] = statusData[i].data?.total ?? 0; });
      setCounts(c);
    }).catch(() => { /* silent */ });
  }, []);

  useEffect(() => {
    setPage(1);
    fetchBookings(activeTab, 1);
  }, [activeTab, fetchBookings]);

  useEffect(() => {
    fetchBookings(activeTab, page);
  }, [page, activeTab, fetchBookings]);

  const handleRefresh = () => {
    fetchBookings(activeTab, page);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,300&display=swap');
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .tab-btn:hover { background: #F3F9F5 !important; color: #1C3D2E !important; }
        .page-btn:hover:not(:disabled) { background: #F3F9F5 !important; border-color: #C7DDD1 !important; }
      `}</style>

      <Navbar />

      <main style={{ minHeight: '100vh', background: '#F7F7F4', paddingTop: 100 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 80px' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, paddingTop: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 5px', fontFamily: 'Fraunces, serif', letterSpacing: '-0.5px' }}>
                Transaksi Saya
              </h1>
              <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>
                {loading ? 'Memuat...' : `${total} booking ditemukan`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleRefresh} disabled={loading} style={{
                background: '#fff', border: '1px solid #EBEBEB',
                borderRadius: 100, padding: '9px 16px',
                fontSize: 13, fontWeight: 600, color: '#6B7280',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <RefreshCw size={14} style={loading ? { animation: 'spin 0.7s linear infinite' } : {}} />
                Refresh
              </button>
              <Link href="/search" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 13, fontWeight: 700, color: '#1C3D2E',
                background: '#fff', border: '1px solid #EBEBEB',
                borderRadius: 100, padding: '9px 18px', textDecoration: 'none',
              }}>
                + Booking Baru
              </Link>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto',
            paddingBottom: 2, marginBottom: 24,
            scrollbarWidth: 'none',
          }}>
            {TABS.map(t => {
              const count = counts[t.key];
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  className="tab-btn"
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    flexShrink: 0, padding: '8px 16px',
                    borderRadius: 100,
                    border: active ? '1.5px solid #1C3D2E' : '1.5px solid #E5E7EB',
                    background: active ? '#1C3D2E' : '#fff',
                    color: active ? '#fff' : '#6B7280',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {t.label}
                  {count !== undefined && count > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      background: active ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                      color: active ? 'white' : '#6B7280',
                      borderRadius: 100, padding: '1px 6px',
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '20px', animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.08}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <Skeleton w={120} h={22} r={100} />
                    <Skeleton w={80} h={30} r={8} />
                  </div>
                  <Skeleton w="60%" h={20} r={6} />
                  <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                    <Skeleton w={160} h={14} r={6} />
                    <Skeleton w={120} h={14} r={6} />
                  </div>
                  <div style={{ marginTop: 14 }}><Skeleton w="100%" h={58} r={10} /></div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    <Skeleton w="100%" h={38} r={100} />
                    <Skeleton w={100} h={38} r={100} />
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB',
              padding: '64px 32px', textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: '#F3F9F5', display: 'grid', placeItems: 'center',
                margin: '0 auto 16px', color: '#1C3D2E',
              }}>
                <Package size={28} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 8px', fontFamily: 'Fraunces, serif' }}>
                {activeTab === 'all' ? 'Belum ada booking' : `Tidak ada booking ${STATUS_CONFIG[activeTab as BookingStatus]?.label?.toLowerCase() ?? ''}`}
              </h3>
              <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>
                {activeTab === 'all'
                  ? 'Temukan vendor terbaik dan mulai booking event impian kamu.'
                  : 'Coba pilih tab lain atau buat booking baru.'}
              </p>
              <Link href="/search" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1C3D2E', color: '#d8f3dc',
                fontSize: 14, fontWeight: 700, borderRadius: 100,
                padding: '12px 24px', textDecoration: 'none',
              }}>
                Cari Vendor <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map((b, i) => (
                <div key={b.id} style={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.06}s` }}>
                  <BookingCard booking={b} onRefresh={handleRefresh} />
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 }}>
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '9px 18px', borderRadius: 100,
                  border: '1px solid #E5E7EB', background: '#fff',
                  fontSize: 13, fontWeight: 600, color: page === 1 ? '#D1D5DB' : '#374151',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                ← Sebelumnya
              </button>
              <span style={{ fontSize: 13, color: '#9CA3AF', padding: '0 8px' }}>
                {page} / {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '9px 18px', borderRadius: 100,
                  border: '1px solid #E5E7EB', background: '#fff',
                  fontSize: 13, fontWeight: 600, color: page === totalPages ? '#D1D5DB' : '#374151',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                Berikutnya →
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 50,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px', backdropFilter: 'blur(2px)',
};
const modalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  width: '100%', maxWidth: 520,
  maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const modalHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start',
  justifyContent: 'space-between', gap: 12,
  padding: '20px 24px',
  borderBottom: '1px solid #F3F4F6',
  position: 'sticky', top: 0, background: '#fff', zIndex: 1,
};
const closeBtn: React.CSSProperties = {
  background: '#F7F7F4', border: 'none', borderRadius: 8,
  padding: 6, cursor: 'pointer', color: '#6B7280',
  display: 'flex', flexShrink: 0,
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  padding: '11px 18px', borderRadius: 100,
  background: '#F5A623', color: '#1C3D2E',
  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
  transition: 'all 0.18s', fontFamily: 'inherit',
};
const btnForest: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  padding: '11px 18px', borderRadius: 100,
  background: '#1C3D2E', color: '#d8f3dc',
  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
  transition: 'all 0.18s', fontFamily: 'inherit',
};
const btnOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  padding: '11px 18px', borderRadius: 100,
  background: '#fff', color: '#374151',
  fontSize: 13, fontWeight: 600,
  border: '1.5px solid #E5E7EB', cursor: 'pointer',
  transition: 'all 0.18s', fontFamily: 'inherit',
};
const btnDanger: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  padding: '11px 18px', borderRadius: 100,
  background: '#FEF2F2', color: '#DC2626',
  fontSize: 13, fontWeight: 700,
  border: '1.5px solid #FECACA', cursor: 'pointer',
  transition: 'all 0.18s', fontFamily: 'inherit',
};
const infoChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 13, color: '#6B7280',
};