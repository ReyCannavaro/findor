"use client";

import { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { toast, ToastContainer } from "@/components/ui/Toast";

interface VendorUser { id: string; email: string; full_name: string | null; phone: string | null; }
interface VendorItem {
  id: string; store_name: string; slug: string; category: string; city: string;
  whatsapp_number: string; description: string | null; is_verified: boolean;
  is_active: boolean; created_at: string; user: VendorUser;
}
interface VendorDetail extends VendorItem {
  address: string | null; ktp_signed_url: string | null; selfie_signed_url: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

function DocImage({ url, label }: { url: string | null; label: string }) {
  if (!url) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-xs text-gray-400">Dokumen tidak tersedia</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <a href={url} target="_blank" rel="noreferrer" className="block group">
        <img src={url} alt={label}
          className="w-full aspect-video object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity"
        />
        <p className="text-xs text-gray-400 mt-1 text-center">Klik untuk buka ukuran penuh</p>
      </a>
    </div>
  );
}

function ReviewModal({ vendor, onClose, onActionDone }: {
  vendor: VendorDetail; onClose: () => void; onActionDone: () => void;
}) {
  const [action, setAction]           = useState<"approve" | "reject" | null>(null);
  const [reason, setReason]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [reasonError, setReasonError] = useState("");

  const handleSubmit = async () => {
    if (action === "reject" && !reason.trim()) { setReasonError("Alasan wajib diisi."); return; }
    setReasonError(""); setLoading(true);
    try {
      const body = action === "approve" ? { action: "approve" } : { action: "reject", reason: reason.trim() };
      const res  = await fetch(`/api/v1/admin/vendors/${vendor.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Gagal");
      toast.success(action === "approve" ? `Vendor "${vendor.store_name}" diverifikasi!` : `Vendor "${vendor.store_name}" ditolak.`);
      onActionDone(); onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[["Nama Toko", vendor.store_name], ["Kategori", vendor.category], ["Kota", vendor.city], ["WhatsApp", vendor.whatsapp_number]].map(([l, v]) => (
          <div key={l}><p className="text-xs text-gray-500 mb-0.5">{l}</p><p className="text-sm font-medium text-gray-900">{v}</p></div>
        ))}
        <div className="col-span-2"><p className="text-xs text-gray-500 mb-0.5">Alamat</p><p className="text-sm text-gray-900">{vendor.address ?? "-"}</p></div>
        {vendor.description && <div className="col-span-2"><p className="text-xs text-gray-500 mb-0.5">Deskripsi</p><p className="text-sm text-gray-700">{vendor.description}</p></div>}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data Pemilik</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Nama: </span><span className="text-gray-900">{vendor.user.full_name ?? "-"}</span></div>
          <div><span className="text-gray-500">Email: </span><span className="text-gray-900">{vendor.user.email}</span></div>
          <div><span className="text-gray-500">Telepon: </span><span className="text-gray-900">{vendor.user.phone ?? "-"}</span></div>
          <div><span className="text-gray-500">Daftar: </span><span className="text-gray-900">{formatDate(vendor.created_at)}</span></div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dokumen Verifikasi</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DocImage url={vendor.ktp_signed_url} label="Foto KTP" />
          <DocImage url={vendor.selfie_signed_url} label="Selfie + KTP" />
        </div>
        <p className="text-xs text-gray-400 mt-2">* Link dokumen berlaku 15 menit.</p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Keputusan:</p>
        <div className="flex gap-3 mb-4">
          {(["approve", "reject"] as const).map((a) => (
            <button key={a} onClick={() => { setAction(a); setReasonError(""); }}
              className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                action === a
                  ? a === "approve" ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
                  : a === "approve" ? "border-gray-200 text-gray-600 hover:border-green-300" : "border-gray-200 text-gray-600 hover:border-red-300"
              }`}>
              {a === "approve" ? "✅ Setujui Vendor" : "❌ Tolak Vendor"}
            </button>
          ))}
        </div>
        {action === "reject" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea value={reason} onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
              placeholder="Contoh: Foto KTP tidak jelas, selfie tidak sesuai."
              rows={3} className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 ${reasonError ? "border-red-400" : "border-gray-300"}`}
            />
            {reasonError && <p className="text-xs text-red-500 mt-1">{reasonError}</p>}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={!action || loading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors ${
              action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}>
            {loading ? "Memproses..." : action === "approve" ? "Konfirmasi Setujui" : action === "reject" ? "Konfirmasi Tolak" : "Pilih Keputusan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorsPage() {
  const [tab, setTab]               = useState<"pending" | "verified">("pending");
  const [vendors, setVendors]       = useState<VendorItem[]>([]);
  const [stats, setStats]           = useState({ pending: 0, verified: 0 });
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewTarget, setReviewTarget] = useState<VendorDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchVendors = useCallback(async (status: string, p: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/v1/admin/vendors?status=${status}&page=${p}&per_page=15`);
      const data = await res.json();
      if (data.success) { setVendors(data.data.vendors); setTotalPages(data.data.total_pages); }
    } catch { toast.error("Gagal memuat data vendor."); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [pr, vr] = await Promise.all([
        fetch("/api/v1/admin/vendors?status=pending&per_page=1"),
        fetch("/api/v1/admin/vendors?status=verified&per_page=1"),
      ]);
      const [pd, vd] = await Promise.all([pr.json(), vr.json()]);
      setStats({ pending: pd.data?.total ?? 0, verified: vd.data?.total ?? 0 });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); fetchVendors(tab, 1); }, [tab, fetchVendors]);
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
      <ToastContainer />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Menunggu Review"     value={stats.pending}  color="text-yellow-600" />
        <StatCard label="Sudah Terverifikasi" value={stats.verified} color="text-green-600" />
        <div className="bg-white rounded-xl border border-gray-200 p-5 hidden lg:block">
          <p className="text-sm text-gray-500 mb-1">Total Vendor</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pending + stats.verified}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(["pending", "verified"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t === "pending" ? "⏳ Menunggu Review" : "✅ Terverifikasi"}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${t === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                {t === "pending" ? stats.pending : stats.verified}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : vendors.length === 0 ? (
          <EmptyState message={tab === "pending" ? "Tidak ada vendor yang menunggu review." : "Belum ada vendor terverifikasi."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Vendor", "Kategori", "Kota", "Pemilik", "Tanggal Daftar", "Status", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{v.store_name}</p>
                      <p className="text-xs text-gray-400">@{v.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.category}</td>
                    <td className="px-4 py-3 text-gray-600">{v.city}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{v.user.full_name ?? "-"}</p>
                      <p className="text-xs text-gray-400">{v.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(v.created_at)}</td>
                    <td className="px-4 py-3"><Badge variant={v.is_verified ? "verified" : "unverified"} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => openReview(v.id)} disabled={modalLoading}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50">
                        {modalLoading ? "..." : tab === "pending" ? "Review →" : "Lihat Detail"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)}
        title={`Review Vendor — ${reviewTarget?.store_name ?? ""}`} size="xl">
        {reviewTarget && (
          <ReviewModal vendor={reviewTarget} onClose={() => setReviewTarget(null)} onActionDone={handleActionDone} />
        )}
      </Modal>
    </>
  );
}