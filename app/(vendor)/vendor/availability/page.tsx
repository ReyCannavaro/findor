'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, CheckCircle, X, Loader2,
  AlertCircle, Calendar, Info, ArrowRight, Lock,
  RotateCcw, Save, TriangleAlert,
} from 'lucide-react';
import Navbar from '@/components/navbar';

type DayStatus = 'available' | 'full' | 'off' | 'past' | 'empty';
type SetStatus = 'available' | 'off';

interface VendorProfile {
  id: string;
  store_name: string;
  is_verified: boolean;
}

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDayOfWeek(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function isToday(y: number, m: number, d: number) {
  const t = new Date();
  return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 900, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 14, background: type === 'success' ? '#0d3b2e' : '#dc2626', color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.22)', fontSize: 14, fontWeight: 600, maxWidth: 380, animation: 'slideUp 0.3s ease' }}>
      {type === 'success' ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', padding: 0 }}><X size={15} /></button>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

export default function VendorAvailabilityPage() {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [serverData, setServerData] = useState<Record<string, string>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, SetStatus | null>>({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selectMode, setSelectMode] = useState<SetStatus>('off');
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        const data = await res.json();
        if (!data.success) { router.push('/login?redirect=/vendor/availability'); return; }
        if (data.data.role !== 'vendor' && data.data.role !== 'admin') { router.push('/profile'); return; }
        if (!data.data.vendor) { router.push('/profile'); return; }
        setVendor(data.data.vendor);
      } catch { /* silent */ }
      finally { setPageLoading(false); }
    })();
  }, [router]);

  const fetchMonth = useCallback(async (d: Date, vendorId: string) => {
    setFetchLoading(true);
    setPendingChanges({});
    setSelectedDates(new Set());
    try {
      const res = await fetch(`/api/v1/vendors/${vendorId}/availability?month=${getMonthKey(d)}`);
      const data = await res.json();
      if (data.success) setServerData(data.data.availability ?? {});
    } catch { /* silent */ }
    finally { setFetchLoading(false); }
  }, []);

  useEffect(() => {
    if (vendor) fetchMonth(viewDate, vendor.id);
  }, [viewDate, vendor, fetchMonth]);

  function getEffectiveStatus(dateStr: string): DayStatus {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    if (d < today) return 'past';
    if (pendingChanges[dateStr] !== undefined && pendingChanges[dateStr] !== null) {
      return pendingChanges[dateStr] as DayStatus;
    }
    const s = serverData[dateStr];
    if (s === 'full') return 'full';
    if (s === 'off') return 'off';
    return 'available';
  }

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  function canSelect(dateStr: string): boolean {
    const s = getEffectiveStatus(dateStr);
    return s !== 'past' && s !== 'full' && s !== 'empty';
  }

  function toggleDate(dateStr: string) {
    if (!canSelect(dateStr)) return;
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
      return next;
    });
  }

  function handleMouseDown(dateStr: string) {
    if (!canSelect(dateStr)) return;
    const willSelect = !selectedDates.has(dateStr);
    setDragValue(willSelect);
    setIsDragging(true);
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (willSelect) next.add(dateStr); else next.delete(dateStr);
      return next;
    });
  }

  function handleMouseEnter(dateStr: string) {
    if (!isDragging || !canSelect(dateStr)) return;
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (dragValue) next.add(dateStr); else next.delete(dateStr);
      return next;
    });
  }

  useEffect(() => {
    const up = () => setIsDragging(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  function applyToSelected() {
    if (selectedDates.size === 0) return;
    const updates: Record<string, SetStatus> = {};
    selectedDates.forEach(d => { updates[d] = selectMode; });
    setPendingChanges(prev => ({ ...prev, ...updates }));
    setSelectedDates(new Set());
    setToast({ msg: `${selectedDates.size} tanggal ditandai "${selectMode === 'off' ? 'Libur' : 'Tersedia'}" (belum tersimpan)`, type: 'success' });
  }

  function resetSelected() {
    const resets: Record<string, null> = {};
    selectedDates.forEach(d => { resets[d] = null; });
    setPendingChanges(prev => {
      const next = { ...prev };
      Object.keys(resets).forEach(k => { delete next[k]; });
      return next;
    });
    setSelectedDates(new Set());
    setToast({ msg: `${selectedDates.size} tanggal dikembalikan ke status awal.`, type: 'success' });
  }

  function discardAll() {
    setPendingChanges({});
    setSelectedDates(new Set());
  }

  async function handleSave() {
    if (!vendor) return;
    const toSave = Object.entries(pendingChanges).filter(([, v]) => v !== null) as [string, SetStatus][];
    if (toSave.length === 0) { setToast({ msg: 'Tidak ada perubahan untuk disimpan.', type: 'error' }); return; }
    const byStatus: Record<SetStatus, string[]> = { available: [], off: [] };
    toSave.forEach(([d, s]) => byStatus[s].push(d));

    setSaveLoading(true);
    let savedCount = 0;
    let errorMsg = '';

    for (const [status, dates] of Object.entries(byStatus) as [SetStatus, string[]][]) {
      if (dates.length === 0) continue;
      try {
        const res = await fetch(`/api/v1/vendors/${vendor.id}/availability`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates, status }),
        });
        const data = await res.json();
        if (data.success) {
          savedCount += dates.length;
          setServerData(prev => {
            const next = { ...prev };
            dates.forEach(d => { next[d] = status; });
            return next;
          });
        } else {
          errorMsg = data.error ?? 'Terjadi kesalahan.';
        }
      } catch { errorMsg = 'Tidak dapat terhubung ke server.'; }
    }

    setSaveLoading(false);
    setPendingChanges({});
    setSelectedDates(new Set());

    if (errorMsg) setToast({ msg: errorMsg, type: 'error' });
    else setToast({ msg: `${savedCount} tanggal berhasil disimpan!`, type: 'success' });
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const pendingCount = Object.values(pendingChanges).filter(v => v !== null).length;

  const monthStats = { available: 0, off: 0, full: 0, past: 0 };
  for (let d = 1; d <= daysInMonth; d++) {
    const s = getEffectiveStatus(toDateStr(year, month, d));
    if (s in monthStats) monthStats[s as keyof typeof monthStats]++;
  }

  function getDayStyle(status: DayStatus, isSelected: boolean, todayFlag: boolean): React.CSSProperties {
    const base: React.CSSProperties = {
      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      aspectRatio: '1', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'default',
      userSelect: 'none', transition: 'all 0.12s', border: '2px solid transparent',
    };
    if (status === 'empty') return { ...base, cursor: 'default' };
    if (status === 'past') return { ...base, color: '#d1d5db', background: 'transparent' };
    if (status === 'full') return { ...base, color: '#dc2626', background: '#fee2e2', fontWeight: 700, cursor: 'not-allowed' };
    if (isSelected) return { ...base, background: selectMode === 'off' ? '#fed7aa' : '#bbf7d0', border: `2px solid ${selectMode === 'off' ? '#ea580c' : '#16a34a'}`, fontWeight: 700, color: selectMode === 'off' ? '#c2410c' : '#15803d', cursor: 'pointer', transform: 'scale(1.06)' };
    if (status === 'off') return { ...base, background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' };
    // available
    return { ...base, background: todayFlag ? '#0d3b2e' : '#dcfce7', color: todayFlag ? 'white' : '#15803d', fontWeight: todayFlag ? 700 : 600, cursor: 'pointer', border: todayFlag ? '2px solid #0d3b2e' : '2px solid transparent' };
  }

  if (pageLoading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
        <Navbar />
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '110px 24px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: 14, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 14 }} />
          ))}
        </div>
        <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      </main>
    );
  }

  if (!vendor) return null;

  return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5' }} onMouseUp={() => setIsDragging(false)}>
      <Navbar />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '96px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>
          <Link href="/vendor/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
          <ArrowRight size={12} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Kalender Ketersediaan</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0d3b2e', display: 'grid', placeItems: 'center' }}>
                <Calendar size={18} color="white" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>Kalender Ketersediaan</h1>
            </div>
            <p style={{ fontSize: 14, color: '#64748b' }}>{vendor.store_name} · Klik atau drag tanggal untuk memilih</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {pendingCount > 0 && (
              <button onClick={discardAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'white', color: '#64748b', fontSize: 13.5, fontWeight: 600, border: '1.5px solid #e5e7eb', cursor: 'pointer', fontFamily: 'inherit' }}>
                <RotateCcw size={14} /> Batalkan
              </button>
            )}
            <button onClick={handleSave} disabled={saveLoading || pendingCount === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 10, background: pendingCount === 0 ? '#e5e7eb' : '#0d3b2e', color: pendingCount === 0 ? '#9ca3af' : 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: pendingCount === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: pendingCount > 0 ? '0 4px 14px rgba(13,59,46,0.25)' : 'none' }}>
              {saveLoading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : <><Save size={15} /> Simpan{pendingCount > 0 ? ` (${pendingCount})` : ''}</>}
            </button>
          </div>
        </div>

        {pendingCount > 0 && (
          <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a', marginBottom: 20, alignItems: 'center' }}>
            <TriangleAlert size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13.5, color: '#92400e', flex: 1 }}>
              <strong>{pendingCount} perubahan belum disimpan.</strong> Klik <strong>Simpan</strong> untuk menerapkan ke kalender publik.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }} className="avail-layout">

          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
              <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.18s' }}>
                <ChevronLeft size={18} color="#374151" />
              </button>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  {fetchLoading && <Loader2 size={14} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} />}
                  {monthLabel}
                </p>
                {viewDate.getMonth() !== today.getMonth() || viewDate.getFullYear() !== today.getFullYear() ? (
                  <button onClick={goToday} style={{ fontSize: 11.5, color: '#0d3b2e', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>
                    ← Ke bulan ini
                  </button>
                ) : (
                  <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Bulan ini</p>
                )}
              </div>
              <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.18s' }}>
                <ChevronRight size={18} color="#374151" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, padding: '14px 16px 6px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, padding: '4px 16px 18px', opacity: fetchLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = toDateStr(year, month, day);
                const status = getEffectiveStatus(dateStr);
                const isSelected = selectedDates.has(dateStr);
                const todayFlag = isToday(year, month, day);
                const isPending = pendingChanges[dateStr] != null;

                return (
                  <div
                    key={i}
                    style={getDayStyle(status, isSelected, todayFlag)}
                    onMouseDown={() => handleMouseDown(dateStr)}
                    onMouseEnter={() => handleMouseEnter(dateStr)}
                    onClick={() => { if (!isDragging) toggleDate(dateStr); }}
                    title={status === 'full' ? 'Terkunci — ada booking aktif' : status === 'past' ? 'Sudah lewat' : dateStr}
                  >
                    <span style={{ fontSize: 13, lineHeight: 1 }}>{day}</span>
                    {/* Pending indicator dot */}
                    {isPending && !isSelected && (
                      <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: pendingChanges[dateStr] === 'off' ? '#ea580c' : '#16a34a' }} />
                    )}
                    {status === 'full' && (
                      <Lock size={9} color="#dc2626" style={{ position: 'absolute', top: 3, right: 3 }} />
                    )}
                    {todayFlag && status !== 'past' && !isSelected && (
                      <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 16, padding: '12px 20px 16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
              {[
                { color: '#dcfce7', border: 'transparent', label: 'Tersedia', dot: '#16a34a' },
                { color: '#f3f4f6', border: 'transparent', label: 'Libur', dot: '#6b7280' },
                { color: '#fee2e2', border: 'transparent', label: 'Penuh (terkunci)', dot: '#dc2626' },
                { color: '#0d3b2e', border: 'transparent', label: 'Hari ini', dot: 'white' },
              ].map(({ color, label, dot }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '18px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Ringkasan Bulan</p>
              {[
                { label: 'Tersedia', count: monthStats.available, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Libur / Off', count: monthStats.off, color: '#6b7280', bg: '#f3f4f6' },
                { label: 'Penuh (booking)', count: monthStats.full, color: '#dc2626', bg: '#fef2f2' },
                { label: 'Sudah lewat', count: monthStats.past, color: '#94a3b8', bg: '#f8fafc' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 9, background: count > 0 ? bg : 'transparent', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: count > 0 ? color : '#d1d5db', fontWeight: count > 0 ? 600 : 400 }}>{label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: count > 0 ? color : '#d1d5db' }}>{count}</span>
                </div>
              ))}
              {pendingCount > 0 && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: '#fffbeb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#d97706', fontWeight: 600 }}>Belum disimpan</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#d97706' }}>{pendingCount}</span>
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '18px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Mode Pengaturan</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {([['off', 'Tandai Libur', '#ea580c', '#fff7ed', '#fed7aa'], ['available', 'Tandai Tersedia', '#16a34a', '#f0fdf4', '#bbf7d0']] as const).map(([mode, label, color, bg, border]) => (
                  <button key={mode} onClick={() => setSelectMode(mode)}
                    style={{ padding: '12px 14px', borderRadius: 10, border: `2px solid ${selectMode === mode ? color : '#e5e7eb'}`, background: selectMode === mode ? bg : 'white', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectMode === mode && <div style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: selectMode === mode ? color : '#374151' }}>{label}</p>
                      <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>
                        {mode === 'off' ? 'Blokir tanggal (istirahat, dll.)' : 'Buka tanggal yang sebelumnya off'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${selectedDates.size > 0 ? '#0d3b2e' : '#f1f5f9'}`, padding: '18px 18px', transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tanggal Dipilih</p>
                {selectedDates.size > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0d3b2e', background: '#f0fdf4', padding: '2px 9px', borderRadius: 999 }}>{selectedDates.size}</span>
                )}
              </div>

              {selectedDates.size === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Calendar size={18} color="#d1d5db" />
                  </div>
                  <p style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }}>Klik atau drag pada kalender untuk memilih tanggal</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
                    {[...selectedDates].sort().map(d => (
                      <span key={d} style={{ fontSize: 11.5, background: '#f0fdf4', color: '#0d3b2e', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                        {new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    ))}
                  </div>
                  <button onClick={applyToSelected}
                    style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: selectMode === 'off' ? '#ea580c' : '#0d3b2e', color: 'white', fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' }}>
                    <CheckCircle size={15} />
                    Tandai {selectMode === 'off' ? 'Libur' : 'Tersedia'} ({selectedDates.size})
                  </button>
                  <button onClick={resetSelected}
                    style={{ width: '100%', padding: '10px 0', borderRadius: 10, background: '#f1f5f9', color: '#64748b', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <RotateCcw size={13} /> Reset ke Status Awal
                  </button>
                  <button onClick={() => setSelectedDates(new Set())}
                    style={{ width: '100%', padding: '8px 0', borderRadius: 10, background: 'transparent', color: '#94a3b8', fontSize: 12.5, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Batalkan Pilihan
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Info size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Cara Menggunakan</p>
                <ul style={{ fontSize: 12, color: '#166534', lineHeight: 1.7, paddingLeft: 14, margin: 0 }}>
                  <li>Pilih mode: <strong>Libur</strong> atau <strong>Tersedia</strong></li>
                  <li>Klik atau <strong>drag</strong> untuk pilih banyak tanggal sekaligus</li>
                  <li>Klik <strong>Tandai</strong> untuk menerapkan ke tanggal dipilih</li>
                  <li>Klik <strong>Simpan</strong> untuk menyimpan ke server</li>
                  <li>Tanggal <strong>Penuh 🔒</strong> tidak bisa diubah manual</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .avail-layout { grid-template-columns: 1fr 280px; }
        @media (max-width: 768px) { .avail-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}