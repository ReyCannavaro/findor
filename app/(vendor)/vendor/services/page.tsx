'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, AlertCircle, CheckCircle, Loader2,
  X, ChevronDown, Package, Tag, DollarSign, FileText, Ruler,
  LayoutGrid, ShoppingBag, ArrowRight, TriangleAlert,
} from 'lucide-react';
import Navbar from '@/components/navbar';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price_min: number;
  price_max: number | null;
  unit: string | null;
  is_active: boolean;
  created_at: string;
}

interface VendorProfile {
  id: string;
  store_name: string;
  is_verified: boolean;
  is_active: boolean;
}

interface FormState {
  name: string;
  category: string;
  description: string;
  price_min: string;
  price_max: string;
  unit: string;
}

const BLANK_FORM: FormState = {
  name: '', category: '', description: '',
  price_min: '', price_max: '', unit: '',
};

const KATEGORI_LAYANAN = [
  'Sound System', 'Stage & Rigging', 'Lighting Design',
  'Dekorasi & Florist', 'Catering', 'Dokumentasi',
  'Photography', 'Hiburan & Musik', 'MC & Host',
  'Tenda & Venue', 'Transportasi', 'Makeup & Salon',
  'Undangan Digital', 'Wedding Organizer', 'Lainnya',
];

const UNIT_OPTIONS = ['hari', 'jam', 'event', 'paket', 'pax', 'unit', 'set', 'buah'];

function formatPrice(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function parsePriceInput(v: string): number {
  return parseInt(v.replace(/\D/g, ''), 10) || 0;
}
function formatPriceInput(v: string): string {
  const n = v.replace(/\D/g, '');
  if (!n) return '';
  return parseInt(n, 10).toLocaleString('id-ID');
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 900, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 14, background: type === 'success' ? '#0d3b2e' : '#dc2626', color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.22)', fontSize: 14, fontWeight: 600, maxWidth: 360, animation: 'slideUp 0.3s ease' }}>
      {type === 'success' ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', padding: 0 }}><X size={15} /></button>
    </div>
  );
}

function Dropdown({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${open ? '#0d3b2e' : '#e5e7eb'}`, background: open ? '#f0fdf4' : '#fafafa', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: value ? '#0f172a' : '#9ca3af', textAlign: 'left', transition: 'all 0.18s' }}>
        <span style={{ flex: 1 }}>{value || placeholder}</span>
        <ChevronDown size={14} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {options.map((opt, i) => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                style={{ width: '100%', padding: '10px 14px', background: opt === value ? '#f0fdf4' : 'transparent', border: 'none', borderBottom: i < options.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: opt === value ? 700 : 400, color: opt === value ? '#0d3b2e' : '#374151', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {opt}
                {opt === value && <CheckCircle size={13} color="#0d3b2e" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceModal({
  mode, initial, vendorId, onClose, onSaved,
}: {
  mode: 'add' | 'edit';
  initial: FormState & { id?: string };
  vendorId: string;
  onClose: () => void;
  onSaved: (svc: Service) => void;
}) {
  const [form, setForm] = useState<FormState>({ ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Nama layanan wajib diisi.'); return; }
    if (!form.category) { setError('Kategori wajib dipilih.'); return; }
    const priceMin = parsePriceInput(form.price_min);
    if (!priceMin) { setError('Harga minimal wajib diisi.'); return; }
    const priceMax = form.price_max ? parsePriceInput(form.price_max) : null;
    if (priceMax && priceMax < priceMin) { setError('Harga maksimal tidak boleh lebih kecil dari harga minimal.'); return; }

    setLoading(true); setError('');
    const body = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || null,
      price_min: priceMin,
      price_max: priceMax,
      unit: form.unit.trim() || null,
    };

    try {
      let res: Response;
      if (mode === 'add') {
        res = await fetch(`/api/v1/vendors/${vendorId}/services`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await fetch(`/api/v1/vendors/${vendorId}/services/${initial.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      const data = await res.json();
      if (data.success) { onSaved(mode === 'add' ? data.data : data.data); onClose(); }
      else setError(data.error ?? 'Terjadi kesalahan.');
    } catch { setError('Tidak dapat terhubung ke server.'); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', color: '#0f172a', background: '#fafafa', outline: 'none', transition: 'border-color 0.18s', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
              {mode === 'add' ? 'Tambah Layanan Baru' : 'Edit Layanan'}
            </p>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              {mode === 'add' ? 'Isi detail layanan yang ingin kamu tawarkan' : 'Perbarui informasi layanan'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <X size={18} color="#374151" />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div style={{ padding: '11px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', fontSize: 13, color: '#dc2626', display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div>
            <label style={labelStyle}><Package size={14} color="#0d3b2e" /> Nama Layanan <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={form.name} onChange={e => set('name')(e.target.value)}
              placeholder="Contoh: Sound System Profesional 20K Watt"
              maxLength={100} style={inputStyle} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>{form.name.length}/100</p>
          </div>

          <div>
            <label style={labelStyle}><Tag size={14} color="#0d3b2e" /> Kategori <span style={{ color: '#ef4444' }}>*</span></label>
            <Dropdown value={form.category} onChange={set('category')} options={KATEGORI_LAYANAN} placeholder="Pilih kategori layanan" />
          </div>

          <div>
            <label style={labelStyle}><FileText size={14} color="#0d3b2e" /> Deskripsi <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 12 }}>(opsional)</span></label>
            <textarea value={form.description} onChange={e => set('description')(e.target.value)}
              placeholder="Jelaskan detail layanan: spesifikasi teknis, apa yang termasuk, dll."
              maxLength={500} rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, minHeight: 90 }} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>{form.description.length}/500</p>
          </div>

          <div>
            <label style={labelStyle}><DollarSign size={14} color="#0d3b2e" /> Rentang Harga <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#64748b', fontWeight: 600, pointerEvents: 'none' }}>Rp</span>
                <input
                  value={form.price_min}
                  onChange={e => set('price_min')(formatPriceInput(e.target.value))}
                  placeholder="1.000.000"
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>
              <span style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', userSelect: 'none' }}>s/d</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#64748b', fontWeight: 600, pointerEvents: 'none' }}>Rp</span>
                <input
                  value={form.price_max}
                  onChange={e => set('price_max')(formatPriceInput(e.target.value))}
                  placeholder="Opsional"
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 5 }}>
              Harga maksimal bersifat opsional. Kosongkan jika harga tetap.
            </p>
          </div>

          <div>
            <label style={labelStyle}><Ruler size={14} color="#0d3b2e" /> Satuan <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 12 }}>(opsional)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Dropdown value={form.unit} onChange={set('unit')} options={UNIT_OPTIONS} placeholder="Pilih satuan" />
              <input value={form.unit} onChange={e => set('unit')(e.target.value)}
                placeholder="Atau ketik sendiri…"
                maxLength={50}
                style={inputStyle} />
            </div>
          </div>

          {(form.name || form.price_min) && (
            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Preview Kartu Layanan</p>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{form.name || '(nama layanan)'}</p>
              {form.category && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{form.category}{form.unit ? ` · per ${form.unit}` : ''}</p>}
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0d3b2e' }}>
                {form.price_min ? formatPrice(parsePriceInput(form.price_min)) : 'Rp —'}
                {form.price_max ? ` – ${formatPrice(parsePriceInput(form.price_max))}` : ''}
              </p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: '14px 0', borderRadius: 12, background: loading ? '#9ca3af' : '#0d3b2e', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'background 0.2s' }}>
            {loading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</>
              : <><CheckCircle size={16} /> {mode === 'add' ? 'Tambah Layanan' : 'Simpan Perubahan'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ service, vendorId, onClose, onDeleted }: {
  service: Service; vendorId: string; onClose: () => void; onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/v1/vendors/${vendorId}/services/${service.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { onDeleted(service.id); onClose(); }
      else setError(data.error ?? 'Terjadi kesalahan.');
    } catch { setError('Tidak dapat terhubung ke server.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, padding: '28px 26px', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
          <TriangleAlert size={24} color="#dc2626" />
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Hapus Layanan?</p>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 6 }}>
          Layanan <strong>"{service.name}"</strong> akan dinonaktifkan dan tidak lagi tampil di profil toko kamu.
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, lineHeight: 1.5 }}>
          Layanan dengan booking aktif tidak dapat dihapus.
        </p>
        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', fontSize: 13, color: '#dc2626', marginBottom: 14, display: 'flex', gap: 8 }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: '#f1f5f9', color: '#374151', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button onClick={handleDelete} disabled={loading}
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: loading ? '#9ca3af' : '#dc2626', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Menghapus...</> : <><Trash2 size={14} /> Ya, Hapus</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ svc, onEdit, onDelete }: { svc: Service; onEdit: () => void; onDelete: () => void; }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg, #0d3b2e, #1a6b4e)' }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15.5, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.name}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, background: '#f0fdf4', color: '#15803d', padding: '3px 9px', borderRadius: 999, fontWeight: 600 }}>{svc.category}</span>
              {svc.unit && <span style={{ fontSize: 11.5, background: '#f8fafc', color: '#64748b', padding: '3px 9px', borderRadius: 999, fontWeight: 500 }}>per {svc.unit}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={onEdit}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.18s' }}
              title="Edit layanan"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f0fdf4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d3b2e'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; }}>
              <Pencil size={14} color="#0d3b2e" />
            </button>
            <button onClick={onDelete}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.18s' }}
              title="Hapus layanan"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#dc2626'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; }}>
              <Trash2 size={14} color="#dc2626" />
            </button>
          </div>
        </div>

        {svc.description && (
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {svc.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 1 }}>Harga</p>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#0d3b2e', lineHeight: 1 }}>
              {formatPrice(svc.price_min)}
              {svc.price_max && <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}> – {formatPrice(svc.price_max)}</span>}
            </p>
          </div>
          <p style={{ fontSize: 11.5, color: '#94a3b8' }}>Ditambahkan {formatDate(svc.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: 20, border: '2px dashed #e5e7eb' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <ShoppingBag size={32} color="#0d3b2e" />
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Belum Ada Layanan</p>
      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 24px' }}>
        Tambahkan layanan yang kamu tawarkan agar calon klien bisa melihat harga dan memesan langsung dari profil tokomu.
      </p>
      <button onClick={onAdd}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 12, background: '#0d3b2e', color: 'white', fontSize: 14.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <Plus size={17} /> Tambah Layanan Pertama
      </button>
    </div>
  );
}

export default function VendorServicesPage() {
  const router = useRouter();

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/v1/auth/me');
        const meData = await meRes.json();

        if (!meData.success) { router.push('/login?redirect=/vendor/services'); return; }
        if (meData.data.role !== 'vendor' && meData.data.role !== 'admin') {
          router.push('/profile'); return;
        }

        const v = meData.data.vendor;
        if (!v) { router.push('/profile'); return; }
        setVendor(v);

        const svcRes = await fetch(`/api/v1/vendors/${v.id}/services`);
        const svcData = await svcRes.json();
        if (svcData.success) setServices(svcData.data ?? []);
      } catch { /* silent */ }
      finally { setPageLoading(false); }
    })();
  }, [router]);

  const handleAdded = (svc: Service) => {
    setServices(prev => [svc, ...prev]);
    setToast({ msg: `Layanan "${svc.name}" berhasil ditambahkan!`, type: 'success' });
  };

  const handleEdited = (updated: Service) => {
    setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
    setToast({ msg: `Layanan "${updated.name}" berhasil diperbarui.`, type: 'success' });
  };

  const handleDeleted = (id: string) => {
    const name = services.find(s => s.id === id)?.name ?? 'Layanan';
    setServices(prev => prev.filter(s => s.id !== id));
    setToast({ msg: `"${name}" berhasil dihapus.`, type: 'success' });
  };

  const openEdit = (svc: Service) => {
    setEditTarget(svc);
    setModal('edit');
  };

  if (pageLoading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f7f7f5' }}>
        <Navbar />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '110px 24px 60px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 140, borderRadius: 16, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 16 }} />
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>
          <Link href="/vendor/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
          <ArrowRight size={12} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Kelola Layanan</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0d3b2e', display: 'grid', placeItems: 'center' }}>
                <LayoutGrid size={18} color="white" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>Katalog Layanan</h1>
            </div>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              {services.length > 0
                ? `${services.length} layanan aktif · ${vendor.store_name}`
                : `Belum ada layanan · ${vendor.store_name}`}
            </p>
          </div>
          <button onClick={() => setModal('add')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: '#0d3b2e', color: 'white', fontSize: 14.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(13,59,46,0.25)', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a5c44'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0d3b2e'; }}>
            <Plus size={18} /> Tambah Layanan
          </button>
        </div>

        {!vendor.is_verified && (
          <div style={{ display: 'flex', gap: 12, padding: '14px 18px', background: '#fffbeb', borderRadius: 14, border: '1px solid #fde68a', marginBottom: 24, alignItems: 'flex-start' }}>
            <TriangleAlert size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Toko belum terverifikasi</p>
              <p style={{ fontSize: 13, color: '#a16207', lineHeight: 1.5 }}>
                Layanan kamu tersimpan, tapi tidak akan tampil ke publik hingga admin memverifikasi toko kamu. Proses verifikasi maksimal 1×24 jam.
              </p>
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total Layanan', value: services.length, color: '#0d3b2e', bg: '#f0fdf4' },
              { label: 'Harga Terendah', value: formatPrice(Math.min(...services.map(s => s.price_min))), color: '#0d3b2e', bg: '#f0fdf4' },
              { label: 'Harga Tertinggi', value: formatPrice(Math.max(...services.map(s => s.price_max ?? s.price_min))), color: '#0d3b2e', bg: '#f0fdf4' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {services.length === 0 ? (
          <EmptyState onAdd={() => setModal('add')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }} className="svc-grid">
            {services.map(svc => (
              <ServiceCard
                key={svc.id}
                svc={svc}
                onEdit={() => openEdit(svc)}
                onDelete={() => setDeleteTarget(svc)}
              />
            ))}
          </div>
        )}
      </div>

      {modal === 'add' && vendor && (
        <ServiceModal
          mode="add"
          initial={BLANK_FORM}
          vendorId={vendor.id}
          onClose={() => setModal(null)}
          onSaved={handleAdded}
        />
      )}
      {modal === 'edit' && editTarget && vendor && (
        <ServiceModal
          mode="edit"
          initial={{
            id: editTarget.id,
            name: editTarget.name,
            category: editTarget.category,
            description: editTarget.description ?? '',
            price_min: editTarget.price_min.toLocaleString('id-ID'),
            price_max: editTarget.price_max ? editTarget.price_max.toLocaleString('id-ID') : '',
            unit: editTarget.unit ?? '',
          }}
          vendorId={vendor.id}
          onClose={() => { setModal(null); setEditTarget(null); }}
          onSaved={handleEdited}
        />
      )}
      {deleteTarget && vendor && (
        <DeleteModal
          service={deleteTarget}
          vendorId={vendor.id}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .svc-grid { grid-template-columns: repeat(2,1fr); }
        @media (max-width: 640px) { .svc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}