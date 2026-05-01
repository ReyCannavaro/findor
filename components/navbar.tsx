'use client';
import Link from 'next/link';
import { Menu, X, ArrowRight, ChevronDown, User, Receipt, Heart, Store, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'vendor' | 'admin';
};

export default function Navbar() {
  const [open, setOpen]               = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const [user, setUser]   = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch real user dari API
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.data.profile);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isLoggedIn = !!user && !loading;

  const requireAuth = (callback: () => void) => {
    if (!isLoggedIn) router.push('/login');
    else callback();
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/search', label: 'Jelajahi Vendor' },
    { href: '/how-it-works', label: 'Cara Kerja' },
    { href: '/about', label: 'Tentang Kami' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const dropdownItems = [
    { icon: <User size={15} />, label: 'Profil Saya', href: '/profile' },
    { icon: <Receipt size={15} />, label: 'Transaksi Saya', href: '/bookings' },
    { icon: <Heart size={15} />, label: 'Wishlist', href: '/bookmarks' },
    ...(user?.role === 'vendor'
      ? [{ icon: <Store size={15} />, label: 'Dashboard Vendor', href: '/vendor/dashboard' }]
      : [{ icon: <Store size={15} />, label: 'Daftarkan Layanan', href: '/vendor/register' }]),
    ...(user?.role === 'admin'
      ? [{ icon: <LayoutDashboard size={15} />, label: 'Admin Panel', href: '/admin/vendors' }]
      : []),
  ];

  const displayName = user?.full_name ?? user?.email?.split('@')[0] ?? 'User';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .fn-nav-wrapper {
          position: fixed;
          top: 16px;
          left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: center;
          pointer-events: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 0 20px;
        }

        .fn-pill {
          pointer-events: all;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 8px 8px 10px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border-radius: 999px;
          border: 0.75px solid rgba(255,255,255,0.9);
          box-shadow:
            0 4px 28px rgba(0,0,0,0.10),
            0 1px 4px rgba(0,0,0,0.06),
            inset 0 1px 0 rgba(255,255,255,1);
          transition: box-shadow 0.3s ease, background 0.3s ease;
          max-width: 100%;
        }
        .fn-pill.scrolled {
          background: rgba(255,255,255,0.98);
          box-shadow:
            0 10px 48px rgba(0,0,0,0.12),
            0 2px 8px rgba(0,0,0,0.07),
            inset 0 1px 0 rgba(255,255,255,1);
        }

        .fn-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          padding: 2px;
          border-radius: 999px;
          flex-shrink: 0;
          margin-right: 4px;
        }
        .fn-logo-img {
          height: 40px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .fn-sep-line {
          width: 1px; height: 22px;
          background: rgba(0,0,0,0.11);
          flex-shrink: 0;
          margin: 0 4px;
        }

        .fn-links {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .fn-link {
          padding: 10px 17px;
          border-radius: 999px;
          color: #555;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s, background 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .fn-link:hover { color: #1C3D2E; background: rgba(28,61,46,0.07); }
        .fn-link.active {
          color: #1a1a1a;
          font-weight: 650;
          background: rgba(0,0,0,0.06);
          box-shadow: 0 1px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1);
        }

        .fn-login {
          padding: 10px 16px;
          border-radius: 999px;
          color: #555;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .fn-login:hover { color: #1C3D2E; background: rgba(28,61,46,0.07); }

        .fn-cta {
          display: inline-flex;
          align-items: center;
          gap: 0;
          padding: 11px 22px;
          background: #1C3D2E;
          color: #d8f3dc;
          border-radius: 999px;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.01em;
          white-space: nowrap;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 2px 12px rgba(28,61,46,0.30), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .fn-cta:hover {
          background: #2D6A4F;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(28,61,46,0.38);
        }
        .fn-cta:active { transform: translateY(0); }

        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fn-nav-wrapper { animation: navSlideDown 0.55s cubic-bezier(0.22,1,0.36,1) both; }

        .fn-link { position: relative; }
        .fn-link::after {
          content: '';
          position: absolute;
          bottom: 5px; left: 17px; right: 17px;
          height: 1.5px;
          background: #1C3D2E;
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .fn-link:hover::after { transform: scaleX(1); }
        .fn-link.active::after { transform: scaleX(0); }

        .fn-user-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 11px 4px 4px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.7);
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .fn-user-btn:hover,
        .fn-user-btn.open {
          background: rgba(255,255,255,0.98);
          box-shadow: 0 3px 14px rgba(0,0,0,0.10);
          border-color: rgba(28,61,46,0.2);
        }
        .fn-user-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1C3D2E 0%, #2D6A4F 100%);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          flex-shrink: 0;
          transition: box-shadow 0.2s;
        }
        .fn-user-btn.open .fn-user-avatar {
          box-shadow: 0 0 0 2.5px rgba(28,61,46,0.22);
        }

        .fn-user-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #1a1a1a;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fn-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 232px;
          background: white;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow:
            0 16px 56px rgba(0,0,0,0.14),
            0 4px 16px rgba(0,0,0,0.07),
            inset 0 1px 0 rgba(255,255,255,0.9);
          padding: 8px;
          z-index: 200;
          transform-origin: top right;
          animation: dropIn 0.2s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.93) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .fn-dd-header {
          padding: 10px 12px 8px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 4px;
        }
        .fn-dd-name {
          font-size: 13px; font-weight: 700; color: #111827;
        }
        .fn-dd-role {
          font-size: 11px; color: #9ca3af; margin-top: 1px;
        }
        .fn-dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.12s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .fn-dd-item:hover { background: #f4faf6; color: #1C3D2E; }
        .fn-dd-item svg { color: #9ca3af; flex-shrink: 0; transition: color 0.15s, transform 0.15s; }
        .fn-dd-item:hover svg { color: #1C3D2E; transform: translateX(2px); }
        .fn-dd-sep {
          height: 1px; background: #f3f4f6;
          margin: 4px 0;
        }
        .fn-dd-logout {
          color: #ef4444 !important;
        }
        .fn-dd-logout:hover { background: #fef2f2 !important; }
        .fn-dd-logout svg { color: #ef4444 !important; }

        .fn-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 42px; height: 42px;
          background: rgba(255,255,255,0.8);
          border: 0.75px solid rgba(0,0,0,0.1);
          border-radius: 50%;
          cursor: pointer;
          color: #222;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .fn-toggle:hover { background: rgba(255,255,255,1); }

        .fn-drawer-wrap {
          position: fixed;
          top: 80px;
          left: 12px; right: 12px;
          z-index: 99;
          pointer-events: all;
        }
        .fn-drawer {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border-radius: 24px;
          border: 0.75px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1);
          padding: 10px 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fn-m-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          border-radius: 14px;
          color: #333;
          font-size: 15.5px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.13s;
          letter-spacing: -0.01em;
        }
        .fn-m-link:hover { background: rgba(0,0,0,0.04); }
        .fn-m-link.active {
          background: rgba(255,255,255,0.92);
          color: #1C3D2E;
          font-weight: 650;
          box-shadow: 0 1px 5px rgba(0,0,0,0.07);
        }
        .fn-m-link svg { color: #bbb; }
        .fn-m-sep {
          height: 0.75px;
          background: rgba(0,0,0,0.07);
          margin: 6px 2px 10px;
        }
        .fn-m-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          background: #1C3D2E;
          color: #d8f3dc;
          border-radius: 14px;
          font-size: 15.5px;
          font-weight: 700;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s;
          letter-spacing: -0.01em;
          box-shadow: 0 2px 14px rgba(28,61,46,0.24);
        }
        .fn-m-cta:hover { background: #2D6A4F; }
        .fn-m-login {
          display: block;
          text-align: center;
          margin-top: 8px;
          padding: 12px;
          color: #555;
          border: 0.75px solid rgba(0,0,0,0.1);
          border-radius: 14px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.13s;
        }
        .fn-m-login:hover { background: rgba(0,0,0,0.03); }
        .fn-m-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          padding: 12px;
          color: #ef4444;
          border: 0.75px solid #fecaca;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          background: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.13s;
          width: 100%;
        }
        .fn-m-logout:hover { background: #fef2f2; }

        @media (max-width: 860px) {
          .fn-links { display: none !important; }
          .fn-desktop-actions { display: none !important; }
          .fn-toggle { display: flex !important; }
          .fn-pill { padding: 6px 6px 6px 8px; }
        }
      `}</style>

      <div className={`fn-nav-wrapper${scrolled ? ' scrolled' : ''}`}>
        <nav className={`fn-pill${scrolled ? ' scrolled' : ''}`}>
          <Link href="/" className="fn-logo">
            <img src="/logo_findor.jpg" alt="Findor" className="fn-logo-img" />
          </Link>
          <div className="fn-sep-line" />
          <div className="fn-links">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={`fn-link${isActive(href) ? ' active' : ''}`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="fn-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="fn-sep-line" />

            {loading ? (
              <div style={{ width: 80, height: 36, borderRadius: 999, background: 'rgba(0,0,0,0.05)' }} />
            ) : !isLoggedIn ? (
              <>
                <Link href="/login" className="fn-login">Masuk</Link>
                <Link href="/vendor/register" className="fn-cta">Daftarkan Layanan</Link>
              </>
            ) : (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button className={`fn-user-btn${dropdownOpen ? ' open' : ''}`} onClick={() => setDropdownOpen(v => !v)}>
                  <div className="fn-user-avatar">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="fn-user-name">{displayName}</span>
                  <ChevronDown size={13} color="#9ca3af" style={{ transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
                </button>

                {dropdownOpen && (
                  <div className="fn-dropdown">
                    <div className="fn-dd-header">
                      <div className="fn-dd-name">{displayName}</div>
                      <div className="fn-dd-role">
                        {user?.role === 'admin' ? 'Administrator' : user?.role === 'vendor' ? 'Vendor & User' : 'User'}
                      </div>
                    </div>

                    {dropdownItems.map(item => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="fn-dd-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}

                    <div className="fn-dd-sep" />

                    <button className="fn-dd-item fn-dd-logout" onClick={handleLogout}>
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="fn-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={17} strokeWidth={2.2} /> : <Menu size={17} strokeWidth={2.2} />}
          </button>

        </nav>
      </div>

      {open && (
        <div className="fn-drawer-wrap">
          <div className="fn-drawer">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`fn-m-link${isActive(href) ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {label}
                <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
            ))}

            <div className="fn-m-sep" />

            {loading ? null : !isLoggedIn ? (
              <>
                <Link href="/vendor/register" className="fn-m-cta" onClick={() => setOpen(false)}>
                  Daftarkan Layanan
                </Link>
                <Link href="/login" className="fn-m-login" onClick={() => setOpen(false)}>
                  Masuk
                </Link>
              </>
            ) : (
              <>
                {dropdownItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="fn-m-link"
                    onClick={() => setOpen(false)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {item.icon} {item.label}
                    </span>
                    <ArrowRight size={15} strokeWidth={1.8} />
                  </Link>
                ))}
                <div className="fn-m-sep" />
                <button className="fn-m-logout" onClick={() => { handleLogout(); setOpen(false); }}>
                  <LogOut size={15} /> Keluar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}