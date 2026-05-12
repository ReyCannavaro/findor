"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Users, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { label: "Verifikasi Vendor", href: "/admin/vendors", icon: <ShieldCheck size={18} /> },
  { label: "Manajemen User",    href: "/admin/users",   icon: <Users size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const [user, setUser]               = useState<{ email: string; full_name: string | null } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || d.data?.role !== "admin") router.replace("/login");
        else setUser(d.data);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F7F4", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #E5E7EB", borderTopColor: "#0D3B2E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 14, color: "#9CA3AF" }}>Memuat panel admin...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const displayName = user.full_name ?? user.email;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F7F7F4", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .anl { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:12px; font-size:14px; font-weight:500; text-decoration:none; transition:all 0.18s; color:#6B7280; }
        .anl:hover { background:#F3F9F5; color:#0D3B2E; }
        .anl.act  { background:#0D3B2E; color:white; box-shadow:0 2px 10px rgba(13,59,46,0.22); }
        .logout-btn:hover { background:#FEF2F2 !important; color:#DC2626 !important; }
        @media (max-width:1023px) {
          .sidebar  { transform:translateX(-100%) !important; }
          .sidebar.open { transform:translateX(0) !important; box-shadow: 4px 0 32px rgba(0,0,0,0.12); }
          .main-area { margin-left:0 !important; }
          .mob-btn  { display:flex !important; }
        }
        @media (min-width:1024px) {
          .sidebar  { transform:translateX(0) !important; position:static !important; height:100vh !important; }
          .mob-btn  { display:none !important; }
        }
      `}</style>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 20, backdropFilter: "blur(2px)" }} />
      )}

      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        style={{
          position: "fixed", top: 0, left: 0, height: "100%", width: 256,
          background: "white", borderRight: "1px solid #EBEBEB",
          display: "flex", flexDirection: "column", zIndex: 30,
          transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #F3F4F6" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/logo_findor.jpg" alt="Findor" style={{ height: 36, width: "auto", objectFit: "contain", borderRadius: 8 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", background: "#0D3B2E", color: "#D1FAE5", padding: "3px 10px", borderRadius: 100, textTransform: "uppercase" as const }}>
              Admin
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: 3 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#D1D5DB", letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "8px 14px 4px", margin: 0 }}>
            Navigasi
          </p>
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`anl${active ? " act" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "10px", borderTop: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#F7F7F4", borderRadius: 12, marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#0D3B2E,#2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>
              {displayName[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{displayName}</p>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
            <LogOut size={15} /> Keluar
          </button>
        </div>
      </aside>

      <div className="main-area" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: 256 }}>

        <header style={{ height: 58, background: "white", borderBottom: "1px solid #EBEBEB", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
          <button className="mob-btn" onClick={() => setSidebarOpen(v => !v)}
            style={{ display: "none", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", padding: 6, color: "#374151", borderRadius: 8 }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1 style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "Fraunces, serif" }}>
            {NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Admin Panel"}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", background: "#F7F7F4", borderRadius: 100, border: "1px solid #EBEBEB" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#0D3B2E,#2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>
              {displayName[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", paddingRight: 4 }}>
              {user.full_name?.split(" ")[0] ?? "Admin"}
            </span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}