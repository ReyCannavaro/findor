"use client";

import { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { toast, ToastContainer } from "@/components/ui/Toast";

type UserRole = "user" | "vendor" | "admin";

interface UserItem {
  id: string; email: string; full_name: string | null;
  phone: string | null; role: UserRole; created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="text-gray-400 text-sm">Tidak ada user ditemukan.</p>
    </div>
  );
}

function ChangeRoleModal({ user, onClose, onDone }: {
  user: UserItem; onClose: () => void; onDone: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [loading, setLoading]           = useState(false);

  const ROLES: { value: UserRole; label: string; desc: string; color: string }[] = [
    { value: "user",   label: "User",   desc: "Dapat mencari dan booking vendor.",              color: "border-gray-300 hover:border-gray-400" },
    { value: "vendor", label: "Vendor", desc: "Dapat mengelola toko dan menerima booking.",     color: "border-indigo-300 hover:border-indigo-500" },
    { value: "admin",  label: "Admin",  desc: "Akses penuh ke semua fitur admin panel.",        color: "border-purple-300 hover:border-purple-500" },
  ];

  const handleSave = async () => {
    if (selectedRole === user.role) { onClose(); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/admin/users", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, role: selectedRole }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Gagal mengubah role.");
      toast.success(`Role ${user.email} berhasil diubah ke "${selectedRole}".`);
      onDone(); onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <p className="text-gray-500 mb-1">User</p>
        <p className="font-semibold text-gray-900">{user.full_name ?? "-"}</p>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Pilih Role Baru:</p>
        {ROLES.map((r) => (
          <button key={r.value} onClick={() => setSelectedRole(r.value)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-colors ${
              selectedRole === r.value
                ? r.value === "admin" ? "border-purple-500 bg-purple-50"
                  : r.value === "vendor" ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-400 bg-gray-50"
                : r.color + " bg-white"
            }`}>
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              selectedRole === r.value ? "border-indigo-600" : "border-gray-300"
            }`}>
              {selectedRole === r.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{r.label}</p>
              <p className="text-xs text-gray-500">{r.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedRole === "admin" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          Memberikan akses admin akan memberikan kontrol penuh ke semua fitur platform. Pastikan keputusan ini disengaja.
        </div>
      )}

      {selectedRole !== user.role && selectedRole === "user" && user.role === "vendor" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
          Menurunkan role vendor ke user akan otomatis menonaktifkan toko vendor mereka.
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          Batal
        </button>
        <button onClick={handleSave} disabled={loading || selectedRole === user.role}
          className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<UserItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);

  const fetchUsers = useCallback(async (p: number, role: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "20" });
      if (role) params.set("role", role);
      if (q)    params.set("q", q);
      const res  = await fetch(`/api/v1/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.total_pages);
        setTotal(data.data.total);
      }
    } catch { toast.error("Gagal memuat data user."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setPage(1); fetchUsers(1, roleFilter, search); }, [roleFilter, search, fetchUsers]);
  useEffect(() => { fetchUsers(page, roleFilter, search); }, [page, roleFilter, search, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const ROLE_TABS: { value: string; label: string }[] = [
    { value: "", label: "Semua" },
    { value: "user", label: "User" },
    { value: "vendor", label: "Vendor" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <>
      <ToastContainer />
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total User Terdaftar</p>
            <p className="text-3xl font-bold text-gray-900">{total.toLocaleString("id-ID")}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
            <input
              type="text" value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama atau email..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
              Cari
            </button>
          </form>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
            {ROLE_TABS.map((t) => (
              <button key={t.value} onClick={() => { setRoleFilter(t.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  roleFilter === t.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["User", "Email", "Telepon", "Role", "Bergabung", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                          {(u.full_name ?? u.email)[0].toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-900">{u.full_name ?? "-"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role} label={u.role.charAt(0).toUpperCase() + u.role.slice(1)} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditTarget(u)}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                        Ubah Role
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
            <p className="text-xs text-gray-500">
              Halaman {page} dari {totalPages} · {total} user
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)}
        title="Ubah Role User" size="sm">
        {editTarget && (
          <ChangeRoleModal user={editTarget} onClose={() => setEditTarget(null)}
            onDone={() => fetchUsers(page, roleFilter, search)} />
        )}
      </Modal>
    </>
  );
}