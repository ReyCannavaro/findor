/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { toast, ToastContainer } from "@/components/ui/Toast";
import {
  Clock, CheckCircle2, XCircle, MinusCircle, RefreshCw,
  Store, MapPin, Phone, Mail, User, Calendar,
  FileText, Star, ChevronLeft, ChevronRight, Eye,
} from "lucide-react";

type VendorAction = "approve" | "reject" | "deactivate" | "reactivate";
type TabType      = "pending" | "active" | "inactive";

interface VendorUser   { id: string; email: string; full_name: string | null; phone: string | null; }
interface VendorItem {
  id: string; store_name: string; slug: string; category: string; city: string;
  whatsapp_number: string; description: string | null; is_verified: boolean;
  is_active: boolean; created_at: string; user: VendorUser;
  rating_avg: number; review_count: number;
}
interface VendorDetail extends VendorItem {
  address: string | null; ktp_signed_url: string | null; selfie_signed_url: string | null;
}

const TAB_CONFIG: Record<TabType, { label: string; apiStatus: string; emptyMsg: string; icon: React.ReactNode }> = {
  pending:  { label: "Menunggu Review", apiStatus: "pending",  emptyMsg: "Tidak ada vendor yang menunggu review.", icon: <Clock size={14} /> },
  active:   { label: "Aktif",           apiStatus: "verified", emptyMsg: "Belum ada vendor aktif.",                icon: <CheckCircle2 size={14} /> },
  inactive: { label: "Nonaktif",        apiStatus: "inactive", emptyMsg: "Tidak ada vendor yang dinonaktifkan.",   icon: <MinusCircle size={14} /> },
};

const ACTION_CONFIG: Record<VendorAction, {
  label: string; confirmLabel: string;
  color: string; bg: string; border: string;
  needsReason: boolean; reasonLabel?: string; reasonPlaceholder?: string;
}> = {
  approve: {
    label: "Setujui", confirmLabel: "Konfirmasi Setujui",
    color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0",
    needsReason: false,
  },
  reactivate: {
    label: "Aktifkan Kembali", confirmLabel: "Konfirmasi Aktifkan",
    color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE",
    needsReason: false,
  },
  deactivate: {
    label: "Nonaktifkan", confirmLabel: "Konfirmasi Nonaktifkan",
    color: "#92400E", bg: "#FFFBEB", border: "#FDE68A",
    needsReason: true, reasonLabel: "Alasan Nonaktivasi",
    reasonPlaceholder: "Contoh: Vendor melanggar ketentuan layanan.",
  },
  reject: {
    label: "Tolak", confirmLabel: "Konfirmasi Tolak",
    color: "#991B1B", bg: "#FEF2F2", border: "#FECACA",
    needsReason: true, reasonLabel: "Alasan Penolakan",
    reasonPlaceholder: "Contoh: Foto KTP tidak jelas, selfie tidak sesuai.",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getVendorState(v: VendorItem): { label: string; color: string; bg: string; border: string; icon: React.ReactNode } {
  if (!v.is_verified && !v.is_active) return { label: "Menunggu Review", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A",  icon: <Clock size={11} /> };
  if (v.is_verified  && v.is_active)  return { label: "Aktif",           color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0",  icon: <CheckCircle2 size={11} /> };
  if (v.is_verified  && !v.is_active) return { label: "Nonaktif",        color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB",  icon: <MinusCircle size={11} /> };
  return                                    { label: "Unknown",           color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB",  icon: <XCircle size={11} /> };
}

function getAvailableActions(v: VendorItem): VendorAction[] {
  if (!v.is_verified && !v.is_active) return ["approve", "reject"];
  if (v.is_verified  && v.is_active)  return ["deactivate"];
  if (v.is_verified  && !v.is_active) return ["reactivate", "reject"];
  return ["approve", "reject"];
}

function StatCard({ label, value, icon, color, bg }: {
  label: string; value: number; icon: React.ReactNode; color: string; bg: string;
}) {
  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #EBEBEB", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "grid", placeItems: "center", flexShrink: 0, color }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 3px", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1, fontFamily: "Fraunces, serif" }}>{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ v }: { v: VendorItem }) {
  const s = getVendorState(v);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      {s.icon} {s.label}
    </span>
  );
}

function DocImage({ url, label }: { url: string | null; label: string }) {
  if (!url) return (
    <div style={{ aspectRatio: "16/9", background: "#F7F7F4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <FileText size={28} color="#D1D5DB" style={{ margin: "0 auto 6px" }} />
        <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Dokumen tidak tersedia</p>
      </div>
    </div>
  );
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</p>
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={label} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 12, border: "1px solid #EBEBEB", display: "block" }} />
        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center" as const, marginTop: 4 }}>Klik untuk buka ukuran penuh</p>
      </a>
    </div>
  );
}

function ReviewModal({ vendor, onClose, onActionDone }: {
  vendor: VendorDetail; onClose: () => void; onActionDone: () => void;
}) {
  const [action, setAction]           = useState<VendorAction | null>(null);
  const [reason, setReason]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [reasonError, setReasonError] = useState("");

  const availableActions = getAvailableActions(vendor);
  const stateInfo        = getVendorState(vendor);
  const cfg              = action ? ACTION_CONFIG[action] : null;

  const handleSubmit = async () => {
    if (!action) return;
    if (cfg?.needsReason && !reason.trim()) { setReasonError(`${cfg.reasonLabel ?? "Alasan"} wajib diisi.`); return; }
    setReasonError(""); setLoading(true);
    try {
      const body = cfg?.needsReason ? { action, reason: reason.trim() } : { action };
      const res  = await fetch(`/api/v1/admin/vendors/${vendor.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Gagal");
      const msgs: Record<VendorAction, string> = {
        approve:    `Vendor "${vendor.store_name}" berhasil diverifikasi.`,
        reactivate: `Vendor "${vendor.store_name}" berhasil diaktifkan kembali.`,
        deactivate: `Vendor "${vendor.store_name}" telah dinonaktifkan.`,
        reject:     `Vendor "${vendor.store_name}" ditolak.`,
      };
      toast.success(msgs[action]);
      onActionDone(); onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 100, color: stateInfo.color, background: stateInfo.bg, border: `1px solid ${stateInfo.border}` }}>
          {stateInfo.icon} {stateInfo.label}
        </span>
        {vendor.review_count > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6B7280" }}>
            <Star size={13} fill="#F5A623" color="#F5A623" />
            {Number(vendor.rating_avg).toFixed(1)} · {vendor.review_count} ulasan
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
        {[
          { icon: <Store size={13} />,   label: "Nama Toko",  val: vendor.store_name },
          { icon: <FileText size={13} />, label: "Kategori",   val: vendor.category },
          { icon: <MapPin size={13} />,  label: "Kota",        val: vendor.city },
          { icon: <Phone size={13} />,   label: "WhatsApp",    val: vendor.whatsapp_number },
        ].map(item => (
          <div key={item.label}>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 4 }}>{item.icon} {item.label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{item.val}</p>
          </div>
        ))}
        {vendor.address && (
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 3px" }}>Alamat</p>
            <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{vendor.address}</p>
          </div>
        )}
        {vendor.description && (
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 3px" }}>Deskripsi</p>
            <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>{vendor.description}</p>
          </div>
        )}
      </div>

      <div style={{ background: "#F7F7F4", borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 10px" }}>Data Pemilik</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
          {[
            { icon: <User size={12} />,     label: "Nama",    val: vendor.user.full_name ?? "-" },
            { icon: <Mail size={12} />,     label: "Email",   val: vendor.user.email },
            { icon: <Phone size={12} />,    label: "Telepon", val: vendor.user.phone ?? "-" },
            { icon: <Calendar size={12} />, label: "Daftar",  val: formatDate(vendor.created_at) },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ color: "#9CA3AF", marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 13, color: "#111827", margin: 0, fontWeight: 500 }}>{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(vendor.ktp_signed_url || vendor.selfie_signed_url) && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 12px" }}>Dokumen Verifikasi</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <DocImage url={vendor.ktp_signed_url}    label="Foto KTP" />
            <DocImage url={vendor.selfie_signed_url} label="Selfie + KTP" />
          </div>
          <p style={{ fontSize: 11, color: "#D1D5DB", marginTop: 6 }}>* Link dokumen berlaku 15 menit.</p>
        </div>
      )}

      <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 12px" }}>Keputusan Admin:</p>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${availableActions.length}, 1fr)`, gap: 8, marginBottom: 14 }}>
          {availableActions.map((a) => {
            const c = ACTION_CONFIG[a];
            const selected = action === a;
            return (
              <button key={a}
                onClick={() => { setAction(a); setReason(""); setReasonError(""); }}
                style={{
                  padding: "10px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: `2px solid ${selected ? c.border : "#E5E7EB"}`,
                  background: selected ? c.bg : "white",
                  color: selected ? c.color : "#6B7280",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {action === "reactivate" && (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#1E40AF" }}>
            Vendor sudah pernah terverifikasi. Mengaktifkan kembali akan memulihkan akses tanpa upload dokumen ulang.
          </div>
        )}
        {action === "deactivate" && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#92400E" }}>
            Vendor dapat diaktifkan kembali kapan saja tanpa proses verifikasi ulang.
          </div>
        )}
        {action === "reject" && vendor.is_verified && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#991B1B" }}>
            Menolak vendor yang sudah terverifikasi akan mencabut status verifikasi dan mengubah role akun kembali ke user biasa.
          </div>
        )}

        {action && cfg?.needsReason && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 7 }}>
              {cfg.reasonLabel} <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
              placeholder={cfg.reasonPlaceholder}
              rows={3}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
                border: `1.5px solid ${reasonError ? "#FCA5A5" : "#E5E7EB"}`,
                outline: "none", fontFamily: "inherit", resize: "vertical",
                transition: "border-color 0.2s", boxSizing: "border-box" as const,
              }}
              onFocus={e => { e.target.style.borderColor = "#0D3B2E"; }}
              onBlur={e => { e.target.style.borderColor = reasonError ? "#FCA5A5" : "#E5E7EB"; }}
            />
            {reasonError && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{reasonError}</p>}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={!action || loading}
            style={{
              flex: 2, padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              border: "none", cursor: !action || loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              background: !action ? "#F3F4F6" : action === "approve" || action === "reactivate" ? "#0D3B2E" : action === "deactivate" ? "#F59E0B" : "#DC2626",
              color: !action ? "#9CA3AF" : "white",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Memproses..." : cfg?.confirmLabel ?? "Pilih Keputusan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorsPage() {
  const [tab,         setTab]         = useState<TabType>("pending");
  const [vendors,     setVendors]     = useState<VendorItem[]>([]);
  const [stats,       setStats]       = useState({ pending: 0, active: 0, inactive: 0 });
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [reviewTarget, setReviewTarget] = useState<VendorDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchVendors = useCallback(async (t: TabType, p: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/v1/admin/vendors?status=${TAB_CONFIG[t].apiStatus}&page=${p}&per_page=15`);
      const data = await res.json();
      if (data.success) { setVendors(data.data.vendors); setTotalPages(data.data.total_pages); }
    } catch { toast.error("Gagal memuat data vendor."); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [pr, ar, ir] = await Promise.all([
        fetch("/api/v1/admin/vendors?status=pending&per_page=1"),
        fetch("/api/v1/admin/vendors?status=verified&per_page=1"),
        fetch("/api/v1/admin/vendors?status=inactive&per_page=1"),
      ]);
      const [pd, ad, id_] = await Promise.all([pr.json(), ar.json(), ir.json()]);
      setStats({ pending: pd.data?.total ?? 0, active: ad.data?.total ?? 0, inactive: id_.data?.total ?? 0 });
    } catch { toast.error("Gagal memuat statistik."); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { fetchVendors(tab, page); }, [page, tab, fetchVendors]);

  const openReview = async (id: string) => {
    setModalLoading(true);
    try {
      const res  = await fetch(`/api/v1/admin/vendors/${id}`);
      const data = await res.json();
      if (data.success) setReviewTarget(data.data);
      else toast.error("Gagal memuat detail vendor.");
    } catch { toast.error("Terjadi kesalahan."); }
    finally { setModalLoading(false); }
  };

  const handleActionDone = () => { fetchVendors(tab, page); fetchStats(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .vendor-row:hover { background: #F7F7F4 !important; }
        .tab-btn:hover { color: #0D3B2E !important; }
        .kelola-btn:hover { background: #0D3B2E !important; color: white !important; }
      `}</style>
      <ToastContainer />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Menunggu Review" value={stats.pending}  icon={<Clock size={20} />}        color="#92400E" bg="#FEF3C7" />
        <StatCard label="Vendor Aktif"    value={stats.active}   icon={<CheckCircle2 size={20} />} color="#065F46" bg="#D1FAE5" />
        <StatCard label="Nonaktif"        value={stats.inactive} icon={<MinusCircle size={20} />}  color="#374151" bg="#F3F4F6" />
      </div>

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #EBEBEB", overflow: "hidden" }}>

        <div style={{ display: "flex", borderBottom: "1px solid #F3F4F6", padding: "0 4px" }}>
          {(Object.keys(TAB_CONFIG) as TabType[]).map((t) => {
            const active = tab === t;
            const cfg    = TAB_CONFIG[t];
            return (
              <button key={t} onClick={() => setTab(t)} className="tab-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "14px 18px", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                  border: "none", borderBottom: `2px solid ${active ? "#0D3B2E" : "transparent"}`,
                  background: "none", cursor: "pointer", transition: "all 0.18s",
                  color: active ? "#0D3B2E" : "#9CA3AF",
                }}>
                <span style={{ color: active ? "#0D3B2E" : "#D1D5DB" }}>{cfg.icon}</span>
                {cfg.label}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                  background: active
                    ? t === "pending" ? "#FEF3C7" : t === "active" ? "#D1FAE5" : "#F3F4F6"
                    : "#F3F4F6",
                  color: active
                    ? t === "pending" ? "#92400E" : t === "active" ? "#065F46" : "#374151"
                    : "#9CA3AF",
                }}>
                  {stats[t]}
                </span>
              </button>
            );
          })}

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14 }}>
            <button onClick={() => { fetchVendors(tab, page); fetchStats(); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 100, border: "1px solid #EBEBEB", background: "white", fontSize: 12, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: "inherit" }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ height: 52, borderRadius: 10, background: "linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)", backgroundSize: "200% 100%", animation: `shimmer 1.5s infinite`, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F7F7F4", display: "grid", placeItems: "center", marginBottom: 14, color: "#D1D5DB" }}>
              <Store size={26} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Tidak Ada Vendor</p>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>{TAB_CONFIG[tab].emptyMsg}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F7F7F4" }}>
                  {["Vendor", "Kategori", "Kota", "Pemilik", "Terdaftar", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr key={v.id} className="vendor-row"
                    style={{ borderTop: "1px solid #F3F4F6", transition: "background 0.12s", animation: `fadeUp 0.3s ease both`, animationDelay: `${i * 0.04}s` }}>
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>{v.store_name}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>/{v.slug}</p>
                    </td>
                    <td style={{ padding: "13px 16px", color: "#6B7280" }}>{v.category}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6B7280" }}>
                        <MapPin size={12} color="#D1D5DB" /> {v.city}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ color: "#374151", margin: "0 0 2px", fontWeight: 500 }}>{v.user.full_name ?? "-"}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{v.user.email}</p>
                    </td>
                    <td style={{ padding: "13px 16px", color: "#9CA3AF", whiteSpace: "nowrap" as const }}>{formatDate(v.created_at)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <StatusBadge v={v} />
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button onClick={() => openReview(v.id)} disabled={modalLoading} className="kelola-btn"
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "7px 13px", borderRadius: 100,
                          border: "1px solid #EBEBEB", background: "#F7F7F4",
                          fontSize: 12, fontWeight: 600, color: "#374151",
                          cursor: modalLoading ? "not-allowed" : "pointer",
                          fontFamily: "inherit", transition: "all 0.18s",
                          opacity: modalLoading ? 0.6 : 1,
                          whiteSpace: "nowrap" as const,
                        }}>
                        <Eye size={13} /> Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #F3F4F6" }}>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
              Halaman <strong style={{ color: "#374151" }}>{page}</strong> dari {totalPages}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 13px", borderRadius: 100, border: "1px solid #EBEBEB", background: "white", fontSize: 12, fontWeight: 600, color: page === 1 ? "#D1D5DB" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                <ChevronLeft size={14} /> Sebelumnya
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 13px", borderRadius: 100, border: "1px solid #EBEBEB", background: "white", fontSize: 12, fontWeight: 600, color: page === totalPages ? "#D1D5DB" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                Berikutnya <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)}
        title={`Kelola Vendor — ${reviewTarget?.store_name ?? ""}`} size="xl">
        {reviewTarget && (
          <ReviewModal vendor={reviewTarget} onClose={() => setReviewTarget(null)} onActionDone={handleActionDone} />
        )}
      </Modal>
    </>
  );
}